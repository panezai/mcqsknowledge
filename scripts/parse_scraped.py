#!/usr/bin/env python3
"""Parse scraped category pages and extract MCQs into structured JSON"""

import json
import re
import os
import glob

DATA_DIR = os.environ.get('DATA_DIR', '/app/scraper-data')
OUTPUT_FILE = os.environ.get('OUTPUT_FILE', '/app/scraper-data/mcqs.json')

# Category mapping from file names
FILE_CATEGORY_MAP = {
    'cat-gk': ('General Knowledge', 'general_knowledge_mcqs'),
    'cat-pca': ('Pakistan Current Affairs', 'pakistan-current-affairs-mcqs'),
    'cat-wca': ('World Current Affairs', 'world-current-affairs-mcqs'),
    'cat-pak': ('Pak Study', 'pak-study-mcqs'),
    'cat-isl': ('Islamic Studies', 'islamic-studies-mcqs'),
    'cat-sci': ('Everyday Science', 'everyday-science-mcqs'),
    'cat-eng': ('English', 'english-mcqs'),
    'cat-math': ('Mathematics', 'mathematics-mcqs'),
    'cat-comp': ('Computer', 'computer-mcqs'),
    'cat-ped': ('Pedagogy', 'pedagogy-mcqs'),
    'cat-phys': ('Physics', 'physics-mcqs'),
    'cat-chem': ('Chemistry', 'chemistry-mcqs'),
    'cat-bio': ('Biology', 'biology-mcqs'),
    'cat-psy': ('Psychology', 'psychology-mcqs'),
    'cat-eco': ('Economics', 'economics-mcqs'),
    'cat-soc': ('Sociology', 'sociology-mcqs'),
    'cat-pol': ('Political Science', 'political-science-mcqs'),
    'cat-fin': ('Finance', 'finance-mcqs'),
    'cat-acc': ('Accounting', 'accounting-mcqs'),
    'cat-mkt': ('Marketing', 'marketing-mcqs'),
}

def clean_text(s):
    """Clean HTML entities and tags from text"""
    return s \
        .replace('&amp;', '&') \
        .replace('&lt;', '<') \
        .replace('&gt;', '>') \
        .replace('&#039;', "'") \
        .replace('&quot;', '"') \
        .replace('&#8217;', "'") \
        .replace('&#8216;', "'") \
        .replace('&#8220;', '"') \
        .replace('&#8221;', '"') \
        .replace('&#8211;', '-') \
        .replace('&#8212;', '—') \
        .replace('&#8230;', '...') \
        .replace('&nbsp;', ' ') \
        .replace('&#160;', ' ') \
        .replace('&#8209;', '-') \
        .strip()

def extract_mcqs_from_html(html, category_name, category_slug):
    """Extract MCQs from a category listing page HTML"""
    mcqs = []
    
    # Find article blocks
    article_pattern = r'<article[^>]*class="[^"]*l-post[^"]*"[^>]*>([\s\S]*?)</article>'
    articles = re.findall(article_pattern, html)
    
    for article_content in articles:
        # Extract title/question
        question = ''
        title_match = re.search(r'<h2[^>]*class="[^"]*post-title[^"]*"[^>]*>([\s\S]*?)</h2>', article_content)
        if title_match:
            # Remove HTML tags from title
            question = re.sub(r'<[^>]+>', '', title_match.group(1)).strip()
        
        # Also try h3
        if not question:
            h3_match = re.search(r'<h3[^>]*>([\s\S]*?)</h3>', article_content)
            if h3_match:
                question = re.sub(r'<[^>]+>', '', h3_match.group(1)).strip()
        
        # Extract excerpt (contains options)
        excerpt = ''
        excerpt_match = re.search(r'class="excerpt[^"]*"[^>]*>([\s\S]*?)</div>', article_content)
        if excerpt_match:
            excerpt = excerpt_match.group(1)
        
        # Also try content div
        if not excerpt:
            content_match = re.search(r'class="post-content[^"]*"[^>]*>([\s\S]*?)</div>', article_content)
            if content_match:
                excerpt = content_match.group(1)
        
        # Extract source URL
        source_url = ''
        link_match = re.search(r'href="(https://pakmcqs\.com/[^"]+)"', article_content)
        if link_match:
            source_url = link_match.group(1)
        
        # Extract options from excerpt
        clean_excerpt = excerpt \
            .replace('<br>', '\n') \
            .replace('<br/>', '\n') \
            .replace('<br />', '\n') \
            .replace('</p>', '\n') \
            .replace('&nbsp;', ' ')
        clean_excerpt = re.sub(r'<[^>]+>', '', clean_excerpt)
        clean_excerpt = clean_text(clean_excerpt)
        
        option_a = option_b = option_c = option_d = ''
        submitted_by = ''
        
        # Extract options
        a_match = re.search(r'A\.\s*(.+?)(?=\s*B\.|$)', clean_excerpt)
        b_match = re.search(r'B\.\s*(.+?)(?=\s*C\.|$)', clean_excerpt)
        c_match = re.search(r'C\.\s*(.+?)(?=\s*D\.|$)', clean_excerpt)
        d_match = re.search(r'D\.\s*(.+?)(?=\s*Submitted|$)', clean_excerpt)
        
        if a_match: option_a = a_match.group(1).strip()
        if b_match: option_b = b_match.group(1).strip()
        if c_match: option_c = c_match.group(1).strip()
        if d_match: option_d = d_match.group(1).strip()
        
        # Extract submitted by
        submitted_match = re.search(r'Submitted\s*(?:by|By)\s*:\s*(.+)', clean_excerpt)
        if submitted_match:
            submitted_by = submitted_match.group(1).strip()
            # Remove submitted by from option D
            option_d = option_d.replace(submitted_match.group(0), '').strip()
        
        # Clean all fields
        question = clean_text(question)
        option_a = clean_text(option_a)
        option_b = clean_text(option_b)
        option_c = clean_text(option_c)
        option_d = clean_text(option_d)
        submitted_by = clean_text(submitted_by)
        
        # Validate
        if not question or not option_a:
            continue
        
        # Skip non-MCQ entries
        if any(skip in question.lower() for skip in ['quiz', 'submit', 'privacy', 'app']):
            continue
        if any(skip in source_url for skip in ['/quiz', '/submit', '/privacy', '/app']):
            continue
        
        mcqs.append({
            'question': question,
            'optionA': option_a,
            'optionB': option_b,
            'optionC': option_c,
            'optionD': option_d,
            'correctAnswer': '',
            'categorySlug': category_slug,
            'categoryName': category_name,
            'sourceUrl': source_url,
            'submittedBy': submitted_by
        })
    
    return mcqs

def main():
    all_mcqs = []
    seen_urls = set()
    
    # Process all scraped category files
    for filename in sorted(glob.glob(os.path.join(DATA_DIR, 'cat-*.json'))):
        basename = os.path.basename(filename)
        
        # Determine category from filename
        cat_key = None
        for key in FILE_CATEGORY_MAP:
            if basename.startswith(key + '-'):
                cat_key = key
                break
        
        if not cat_key:
            print(f"Skipping unknown category file: {basename}")
            continue
        
        category_name, category_slug = FILE_CATEGORY_MAP[cat_key]
        
        try:
            with open(filename) as f:
                data = json.load(f)
            
            html = data.get('data', {}).get('html', '')
            if not html:
                print(f"Empty HTML in {basename}")
                continue
            
            mcqs = extract_mcqs_from_html(html, category_name, category_slug)
            
            new_count = 0
            for mcq in mcqs:
                if mcq['sourceUrl'] not in seen_urls:
                    all_mcqs.append(mcq)
                    seen_urls.add(mcq['sourceUrl'])
                    new_count += 1
            
            print(f"{basename}: {len(mcqs)} MCQs found, {new_count} new")
        except Exception as e:
            print(f"Error processing {basename}: {e}")
    
    # Save results
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(all_mcqs, f, indent=2)
    
    # Print stats
    print(f"\n=== Total MCQs: {len(all_mcqs)} ===")
    by_category = {}
    for mcq in all_mcqs:
        by_category[mcq['categoryName']] = by_category.get(mcq['categoryName'], 0) + 1
    
    for cat, count in sorted(by_category.items(), key=lambda x: -x[1]):
        print(f"  {cat}: {count}")

if __name__ == '__main__':
    main()
