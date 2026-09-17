#!/usr/bin/env python3
"""
Comprehensive PakMCQs Scraper with Strict Deduplication
Fetches MCQs from PakMCQs WordPress REST API and updates src/lib/db.ts & scraper-data/mcqs.json
"""

import json
import re
import os
import sys
import time
import html
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'scraper-data')
DB_TS_PATH = os.path.join(os.path.dirname(__file__), '..', 'src', 'lib', 'db.ts')
OUTPUT_JSON_PATH = os.path.join(DATA_DIR, 'mcqs.json')

WP_CATEGORY_MAP = {
    1: {"slug": "general_knowledge_mcqs", "name": "General Knowledge"},
    70: {"slug": "pakistan-current-affairs-mcqs", "name": "Pakistan Current Affairs"},
    37: {"slug": "world-current-affairs-mcqs", "name": "World Current Affairs"},
    48: {"slug": "pak-study-mcqs", "name": "Pak Study"},
    38: {"slug": "islamic-studies-mcqs", "name": "Islamic Studies"},
    39: {"slug": "everyday-science-mcqs", "name": "Everyday Science"},
    44: {"slug": "english-mcqs", "name": "English"},
    45: {"slug": "mathematics-mcqs", "name": "Mathematics"},
    50: {"slug": "computer-mcqs", "name": "Computer"},
    147: {"slug": "pedagogy-mcqs", "name": "Pedagogy"},
    46: {"slug": "physics-mcqs", "name": "Physics"},
    40: {"slug": "chemistry-mcqs", "name": "Chemistry"},
    41: {"slug": "biology-mcqs", "name": "Biology"},
    166: {"slug": "urdu-general-knowledge", "name": "URDU"},
    742: {"slug": "psychology-mcqs", "name": "Psychology"},
    393: {"slug": "agriculture-mcqs", "name": "Agriculture"},
    1025: {"slug": "forestry-mcqs", "name": "Forestry"},
    79: {"slug": "economics-mcqs", "name": "Economics"},
    570: {"slug": "sociology-mcqs", "name": "Sociology"},
    856: {"slug": "political-science-mcqs", "name": "Political Science"},
    76: {"slug": "statistics-mcqs", "name": "Statistics"},
    521: {"slug": "english-literature-mcqs", "name": "English Literature"},
    109: {"slug": "judiciary-and-law-mcqs", "name": "Judiciary And Law"},
    982: {"slug": "international-relations", "name": "International Relations"},
    1066: {"slug": "physical-education", "name": "Physical Education"},
    52: {"slug": "finance-mcqs", "name": "Finance"},
    53: {"slug": "hrm-mcqs", "name": "HRM"},
    54: {"slug": "marketing-mcqs", "name": "Marketing"},
    71: {"slug": "accounting-mcqs", "name": "Accounting"},
    80: {"slug": "auditing-mcqs", "name": "Auditing"},
    111: {"slug": "electrical-engineering-mcqs", "name": "Electrical Engineering"},
    240: {"slug": "civil-engineering-mcqs", "name": "Civil Engineering"},
    285: {"slug": "mechanical-engineering-mcqs", "name": "Mechanical Engineering"},
    320: {"slug": "chemical-engineering", "name": "Chemical Engineering"},
    304: {"slug": "software-engineering-mcqs", "name": "Software Engineering"},
    740: {"slug": "medical-mcqs", "name": "Medical"},
    1064: {"slug": "past-papers", "name": "Past Papers"},
}

def clean_text(s):
    if not s:
        return ''
    s = html.unescape(s)
    s = re.sub(r'<[^>]+>', '', s)
    s = s.replace('&nbsp;', ' ').replace('&#160;', ' ').replace('&#8209;', '-')
    s = s.replace('&#8217;', "'").replace('&#8216;', "'").replace('&#8220;', '"').replace('&#8221;', '"')
    s = s.replace('&#8211;', '-').replace('&#8212;', '—').replace('&#038;', '&').replace('&#8230;', '...')
    return re.sub(r'\s+', ' ', s).strip()

def normalize_for_dedupe(text):
    if not text:
        return ''
    t = clean_text(text).lower()
    t = re.sub(r'[^\w\s]', '', t)
    return re.sub(r'\s+', ' ', t).strip()

def parse_mcq_from_wp_post(post):
    title_raw = post.get('title', {}).get('rendered', '')
    content_raw = post.get('content', {}).get('rendered', '')
    link = post.get('link', '')

    question = clean_text(title_raw)
    if not question or len(question) < 5:
        return None

    # Clean content text
    clean_content = content_raw \
        .replace('<br>', '\n').replace('<br/>', '\n').replace('<br />', '\n') \
        .replace('</p>', '\n').replace('</div>', '\n')
    clean_content_text = clean_text(clean_content)

    # Extract options A, B, C, D
    options = {}

    # Match A. ... B. ... C. ... D. ...
    opt_matches = list(re.finditer(r'\b([A-D])[\.\)]\s*(.+?)(?=\b[A-D][\.\)]|\n|Submitted|$)', clean_content_text, re.DOTALL | re.IGNORECASE))
    for m in opt_matches:
        letter = m.group(1).upper()
        val = m.group(2).strip()
        # Clean trailing submitted by or unwanted labels
        val = re.sub(r'\s*Submitted\s*by.*$', '', val, flags=re.IGNORECASE).strip()
        if val and len(val) < 300:
            options[letter] = val

    # Fallback to regex split if not found
    if len(options) < 2:
        a_match = re.search(r'A[\.\)]\s*(.+?)(?=B[\.\)]|$)', clean_content_text, re.IGNORECASE)
        b_match = re.search(r'B[\.\)]\s*(.+?)(?=C[\.\)]|$)', clean_content_text, re.IGNORECASE)
        c_match = re.search(r'C[\.\)]\s*(.+?)(?=D[\.\)]|$)', clean_content_text, re.IGNORECASE)
        d_match = re.search(r'D[\.\)]\s*(.+?)(?=Submitted|Answer|$)', clean_content_text, re.IGNORECASE)

        if a_match: options['A'] = clean_text(a_match.group(1))
        if b_match: options['B'] = clean_text(b_match.group(1))
        if c_match: options['C'] = clean_text(c_match.group(1))
        if d_match: options['D'] = clean_text(d_match.group(1))

    if not options.get('A') or not options.get('B'):
        return None

    # Correct Answer
    correct_answer = ''
    # Strategy 1: "Correct Answer: Option X" or "Answer: X"
    ans_match = re.search(r'(?:correct\s*answer|answer)\s*[:\-]?\s*(?:option\s*)?([A-D])\b', clean_content_text, re.IGNORECASE)
    if ans_match:
        ans_letter = ans_match.group(1).upper()
        correct_answer = options.get(ans_letter, '')

    # Strategy 2: mtq plugin correct answer marker
    if not correct_answer:
        mtq_match = re.search(r'mtq_correct[^>]*>[\s\S]*?mtq_answer_text[^>]*>([\s\S]*?)</div>', content_raw, re.IGNORECASE)
        if mtq_match:
            mtq_text = clean_text(mtq_match.group(1))
            for letter, opt_val in options.items():
                if opt_val.lower() == mtq_text.lower() or mtq_text.lower() in opt_val.lower():
                    correct_answer = opt_val
                    break
            if not correct_answer and mtq_text:
                correct_answer = mtq_text

    # Strategy 3: Bold text in content matching an option
    if not correct_answer:
        bold_match = re.search(r'<strong>\s*([A-D][\.\)]?\s*[^<]+)\s*<\/strong>', content_raw, re.IGNORECASE)
        if bold_match:
            b_text = clean_text(bold_match.group(1))
            b_letter = b_text[0].upper() if b_text and b_text[0].upper() in ['A','B','C','D'] else ''
            if b_letter and b_letter in options:
                correct_answer = options[b_letter]

    # Submitted By
    submitted_by = ''
    sub_match = re.search(r'Submitted\s*(?:by|By)\s*:\s*([^\n,.<]+)', clean_content_text)
    if sub_match:
        submitted_by = clean_text(sub_match.group(1))[:100]

    return {
        'question': question,
        'optionA': options.get('A', ''),
        'optionB': options.get('B', ''),
        'optionC': options.get('C', ''),
        'optionD': options.get('D', ''),
        'correctAnswer': correct_answer,
        'sourceUrl': link,
        'submittedBy': submitted_by
    }

def fetch_page(cat_id, page):
    url = f"https://pakmcqs.com/wp-json/wp/v2/posts?categories={cat_id}&per_page=20&page={page}&_fields=id,title,content,categories,slug,link"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        with urllib.request.urlopen(req, timeout=12) as res:
            total_pages = int(res.headers.get('X-WP-TotalPages', 1))
            data = json.loads(res.read().decode('utf-8'))
            return page, data, total_pages
    except Exception as e:
        return page, [], 0

def load_existing_db_mcqs():
    existing_mcqs = []
    if os.path.exists(DB_TS_PATH):
        with open(DB_TS_PATH, 'r', encoding='utf-8') as f:
            content = f.read()
            match = re.search(r'const dbData = (\{[\s\S]*?\n\};)', content)
            if match:
                try:
                    json_str = match.group(1).rstrip(';')
                    parsed = json.loads(json_str)
                    existing_mcqs = parsed.get('mcqs', [])
                except Exception as e:
                    print(f"Error parsing existing db.ts: {e}")
    return existing_mcqs

def save_to_db_ts(categories, mcqs):
    # Load current db.ts structure to keep tail implementation
    with open(DB_TS_PATH, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split before export const db
    match = re.search(r'function normalizeSearchText', content)
    if not match:
        print("Error: Could not find function normalizeSearchText in db.ts")
        return

    tail_code = content[match.start():]

    new_db_data = {
        "categories": categories,
        "mcqs": mcqs
    }

    new_file_content = f"""export interface Category {{ id: string; name: string; slug: string; description: string; icon: string; order: number; createdAt: string; updatedAt: string; }}
export interface Mcq {{ id: string; question: string; optionA: string; optionB: string; optionC: string; optionD: string; correctAnswer: string; categorySlug: string; sourceUrl: string; submittedBy: string; difficulty: string; createdAt: string; updatedAt: string; }}
const dbData = {json.dumps(new_db_data, indent=2)};
let categoriesData: Category[] = [...(dbData.categories as Category[])];
let mcqsData: Mcq[] = [...(dbData.mcqs as Mcq[])];
{tail_code}"""

    with open(DB_TS_PATH, 'w', encoding='utf-8') as f:
        f.write(new_file_content)

    print(f"✅ Saved {len(mcqs)} total MCQs and {len(categories)} categories to {DB_TS_PATH}")

def main():
    print("🚀 Starting Comprehensive PakMCQs Scraper with Deduplication...")
    
    # Map of seen normalized questions -> MCQ object
    seen_map = {}
    
    # 1. Load existing MCQs from db.ts
    existing_mcqs = load_existing_db_mcqs()
    print(f"📦 Loaded {len(existing_mcqs)} existing MCQs from db.ts")

    for mcq in existing_mcqs:
        norm_k = normalize_for_dedupe(mcq.get('question', ''))
        if norm_k:
            seen_map[norm_k] = mcq

    print(f"🔍 {len(seen_map)} unique existing questions indexed.")

    # 2. Fetch from WordPress API for each category
    categories_list = []
    # Extract categories from db.ts
    if os.path.exists(DB_TS_PATH):
        with open(DB_TS_PATH, 'r', encoding='utf-8') as f:
            c_match = re.search(r'"categories": (\[[\s\S]*?\]),\s*"mcqs"', f.read())
            if c_match:
                categories_list = json.loads(c_match.group(1))

    new_scraped_count = 0
    duplicate_count = 0

    max_pages_per_cat = int(os.environ.get('MAX_PAGES', '25'))

    for cat_id, cat_info in WP_CATEGORY_MAP.items():
        print(f"\n📂 Fetching Category: {cat_info['name']} (ID: {cat_id}, Slug: {cat_info['slug']})")

        # Fetch page 1 first to know total pages
        _, page1_posts, total_pages = fetch_page(cat_id, 1)
        pages_to_fetch = min(total_pages, max_pages_per_cat)
        print(f"   Found {total_pages} total pages available. Scraping {pages_to_fetch} pages...")

        cat_mcqs = []
        if page1_posts:
            cat_mcqs.extend(page1_posts)

        # Fetch remaining pages concurrently
        if pages_to_fetch > 1:
            with ThreadPoolExecutor(max_workers=5) as executor:
                futures = [executor.submit(fetch_page, cat_id, p) for p in range(2, pages_to_fetch + 1)]
                for future in as_completed(futures):
                    _, posts, _ = future.result()
                    if posts:
                        cat_mcqs.extend(posts)

        cat_new_added = 0
        cat_dups = 0

        for post in cat_mcqs:
            parsed = parse_mcq_from_wp_post(post)
            if not parsed:
                continue

            parsed['categorySlug'] = cat_info['slug']
            norm_k = normalize_for_dedupe(parsed['question'])

            if not norm_k:
                continue

            if norm_k in seen_map:
                existing = seen_map[norm_k]
                # Upgrade if existing lacks answer or options and new one has it
                if not existing.get('correctAnswer') and parsed.get('correctAnswer'):
                    existing['correctAnswer'] = parsed['correctAnswer']
                    if parsed.get('submittedBy'):
                        existing['submittedBy'] = parsed['submittedBy']
                cat_dups += 1
                duplicate_count += 1
            else:
                new_mcq_obj = {
                    "id": f"mcq_{int(time.time() * 1000)}_{len(seen_map)+1}",
                    "question": parsed['question'],
                    "optionA": parsed['optionA'],
                    "optionB": parsed['optionB'],
                    "optionC": parsed['optionC'],
                    "optionD": parsed['optionD'],
                    "correctAnswer": parsed['correctAnswer'],
                    "categorySlug": cat_info['slug'],
                    "sourceUrl": parsed['sourceUrl'],
                    "submittedBy": parsed['submittedBy'],
                    "difficulty": "medium",
                    "createdAt": int(time.time() * 1000),
                    "updatedAt": int(time.time() * 1000)
                }
                seen_map[norm_k] = new_mcq_obj
                cat_new_added += 1
                new_scraped_count += 1

        print(f"   + Added {cat_new_added} new unique MCQs ({cat_dups} duplicates skipped)")

    final_mcqs = list(seen_map.values())
    print(f"\n==========================================")
    print(f"🎉 SCRAPE & DEDUPLICATION SUMMARY")
    print(f"==========================================")
    print(f"  New MCQs added:           {new_scraped_count}")
    print(f"  Duplicates skipped:       {duplicate_count}")
    print(f"  Total Unique MCQs in DB:  {len(final_mcqs)}")
    print(f"==========================================")

    # Save to scraper-data/mcqs.json
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(OUTPUT_JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(final_mcqs, f, indent=2)
    print(f"💾 Saved JSON copy to {OUTPUT_JSON_PATH}")

    # Update src/lib/db.ts
    save_to_db_ts(categories_list, final_mcqs)

if __name__ == '__main__':
    main()
