/**
 * PakMCQs Scraper Module
 * Scrapes live MCQs from pakmcqs.com via WP REST API and HTML parsing
 */

export interface ScrapedMcq {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  categorySlug: string;
  categoryName: string;
  sourceUrl: string;
  submittedBy: string;
  difficulty: string;
}

const CATEGORY_SLUG_MAP: Record<string, string> = {
  "computer-mcqs": "computer-mcqs",
  "general-knowledge-mcqs": "general_knowledge_mcqs",
  "general_knowledge_mcqs": "general_knowledge_mcqs",
  "pakistan-current-affairs-mcqs": "pakistan-current-affairs-mcqs",
  "world-current-affairs-mcqs": "world-current-affairs-mcqs",
  "pak-study-mcqs": "pak-study-mcqs",
  "islamic-studies-mcqs": "islamic-studies-mcqs",
  "everyday-science-mcqs": "everyday-science-mcqs",
  "english-mcqs": "english-mcqs",
  "mathematics-mcqs": "mathematics-mcqs",
  "pedagogy-mcqs": "pedagogy-mcqs",
  "physics-mcqs": "physics-mcqs",
  "chemistry-mcqs": "chemistry-mcqs",
  "biology-mcqs": "biology-mcqs",
  "urdu-general-knowledge": "urdu-general-knowledge",
  "urdu-mcqs": "urdu-general-knowledge",
  "psychology-mcqs": "psychology-mcqs",
  "agriculture-mcqs": "agriculture-mcqs",
  "forestry-mcqs": "forestry-mcqs",
  "economics-mcqs": "economics-mcqs",
  "sociology-mcqs": "sociology-mcqs",
  "political-science-mcqs": "political-science-mcqs",
  "statistics-mcqs": "statistics-mcqs",
  "english-literature-mcqs": "english-literature-mcqs",
  "judiciary-and-law-mcqs": "judiciary-and-law-mcqs",
  "international-relations": "international-relations",
  "physical-education": "physical-education",
  "finance-mcqs": "finance-mcqs",
  "hrm-mcqs": "hrm-mcqs",
  "marketing-mcqs": "marketing-mcqs",
  "accounting-mcqs": "accounting-mcqs",
  "auditing-mcqs": "auditing-mcqs",
  "electrical-engineering-mcqs": "electrical-engineering-mcqs",
  "civil-engineering-mcqs": "civil-engineering-mcqs",
  "mechanical-engineering-mcqs": "mechanical-engineering-mcqs",
  "chemical-engineering": "chemical-engineering",
  "software-engineering-mcqs": "software-engineering-mcqs",
  "medical-mcqs": "medical-mcqs",
  "past-papers": "past-papers",
};

const SLUG_TO_WP_CAT_ID: Record<string, number> = {
  "general_knowledge_mcqs": 1,
  "pakistan-current-affairs-mcqs": 70,
  "world-current-affairs-mcqs": 37,
  "pak-study-mcqs": 48,
  "islamic-studies-mcqs": 38,
  "everyday-science-mcqs": 39,
  "english-mcqs": 44,
  "mathematics-mcqs": 45,
  "computer-mcqs": 50,
  "pedagogy-mcqs": 147,
  "physics-mcqs": 46,
  "chemistry-mcqs": 40,
  "biology-mcqs": 41,
  "urdu-general-knowledge": 166,
  "psychology-mcqs": 742,
  "agriculture-mcqs": 393,
  "forestry-mcqs": 1025,
  "economics-mcqs": 79,
  "sociology-mcqs": 570,
  "political-science-mcqs": 856,
  "statistics-mcqs": 76,
  "english-literature-mcqs": 521,
  "judiciary-and-law-mcqs": 109,
  "international-relations": 982,
  "physical-education": 1066,
  "finance-mcqs": 52,
  "hrm-mcqs": 53,
  "marketing-mcqs": 54,
  "accounting-mcqs": 71,
  "auditing-mcqs": 80,
  "electrical-engineering-mcqs": 111,
  "civil-engineering-mcqs": 240,
  "mechanical-engineering-mcqs": 285,
  "chemical-engineering": 320,
  "software-engineering-mcqs": 304,
  "medical-mcqs": 740,
  "past-papers": 1064,
};

/**
 * Decode common HTML entities and strip unwanted HTML tags
 */
export function cleanHtmlText(html: string): string {
  if (!html) return '';
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '-')
    .replace(/&#8212;/g, '—')
    .replace(/&#038;/g, '&')
    .replace(/&#8230;/g, '...')
    .replace(/[\u2018\u2019`]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Clean search query string for WordPress search endpoint
 */
function cleanQueryForWp(query: string): string {
  const cleaned = query
    .replace(/[\u2018\u2019`]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[:?!\,\.\-\(\)]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // If query contains long sentence, pick significant terms (length > 2)
  const words = cleaned.split(' ').filter(w => w.length > 2);
  if (words.length > 5) {
    return words.slice(0, 5).join(' ');
  }
  return cleaned;
}

/**
 * Parse single post from WP REST API response into a ScrapedMcq
 */
function parseWpPost(post: any): ScrapedMcq | null {
  try {
    const rawTitle = post.title?.rendered || '';
    const rawContent = post.content?.rendered || '';
    
    // Clean Question Title
    let question = cleanHtmlText(rawTitle);
    if (!question || question.length < 5) return null;

    let optionA = cleanHtmlText(post.option_a || '');
    let optionB = cleanHtmlText(post.option_b || '');
    let optionC = cleanHtmlText(post.option_c || '');
    let optionD = cleanHtmlText(post.option_d || '');
    let correctAnswer = cleanHtmlText(post.correct_answer || '');

    // Extract options from content HTML if custom fields are missing
    if (!optionA || !optionB) {
      const cleanContent = cleanHtmlText(rawContent);
      
      const optRegex = /\b([A-D])[\.\)]\s*([^A-D\n]+?)(?=\s+\b[A-D][\.\)]|\s+Submitted|$)/gi;
      const foundOpts: Record<string, string> = {};
      let match;
      while ((match = optRegex.exec(cleanContent)) !== null) {
        const letter = match[1].toUpperCase();
        const text = match[2].replace(/<[^>]+>/g, '').trim();
        if (text) foundOpts[letter] = text;
      }

      if (foundOpts['A']) optionA = foundOpts['A'];
      if (foundOpts['B']) optionB = foundOpts['B'];
      if (foundOpts['C']) optionC = foundOpts['C'];
      if (foundOpts['D']) optionD = foundOpts['D'];
    }

    // Try finding correct answer from <strong> tags if missing
    if (!correctAnswer && rawContent) {
      const strongMatches = rawContent.match(/<strong>([\s\S]*?)<\/strong>/gi);
      if (strongMatches) {
        for (const s of strongMatches) {
          const text = cleanHtmlText(s);
          if (text && !text.toLowerCase().includes('submitted by')) {
            correctAnswer = text;
            break;
          }
        }
      }
    }

    // If options A & B are still empty, skip this entry
    if (!optionA && !optionB) {
      return null;
    }

    // Extract category information
    let categoryName = 'General Knowledge';
    let categorySlug = 'general_knowledge_mcqs';

    if (post.categories_details && Array.isArray(post.categories_details) && post.categories_details.length > 0) {
      const firstCat = post.categories_details[0];
      categoryName = firstCat.name || 'General Knowledge';
      const rawSlug = (firstCat.slug || '').toLowerCase();
      categorySlug = CATEGORY_SLUG_MAP[rawSlug] || 'world-current-affairs-mcqs';
    }

    // Extract submitted by
    let submittedBy = cleanHtmlText(post.submittedBy || '');
    if (!submittedBy && rawContent) {
      const subMatch = rawContent.match(/Submitted\s*(?:by|By)\s*:\s*([^<\n]+)/i);
      if (subMatch) {
        submittedBy = cleanHtmlText(subMatch[1]);
      }
    }

    return {
      question,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer,
      categorySlug,
      categoryName,
      sourceUrl: post.link || 'https://pakmcqs.com/',
      submittedBy,
      difficulty: 'medium',
    };
  } catch (err) {
    console.error('Error parsing WP post for MCQ:', err);
    return null;
  }
}

/**
 * Scrape PakMCQs for a search query using WP REST API
 */
export async function scrapePakMcqsSearch(query: string, limit: number = 10): Promise<ScrapedMcq[]> {
  if (!query || !query.trim()) return [];

  const cleanQuery = cleanQueryForWp(query);
  const searchUrls = [
    `https://pakmcqs.com/wp-json/wp/v2/posts?search=${encodeURIComponent(cleanQuery)}&per_page=${limit}`,
    `https://pakmcqs.com/wp-json/wp/v2/posts?search=${encodeURIComponent(query.trim())}&per_page=${limit}`
  ];

  for (const searchUrl of searchUrls) {
    try {
      const res = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
        },
        next: { revalidate: 3600 },
      });

      if (!res.ok) continue;

      const posts = await res.json();
      if (!Array.isArray(posts) || posts.length === 0) continue;

      const mcqs: ScrapedMcq[] = [];
      for (const post of posts) {
        const parsed = parseWpPost(post);
        if (parsed) {
          mcqs.push(parsed);
        }
      }

      if (mcqs.length > 0) {
        return mcqs;
      }
    } catch (error) {
      console.error('Error scraping PakMCQs search:', error);
    }
  }

  return [];
}

/**
 * Scrape PakMCQs for a category using WP REST API
 */
export async function scrapePakMcqsCategory(categorySlug: string, limit: number = 15): Promise<ScrapedMcq[]> {
  const catId = SLUG_TO_WP_CAT_ID[categorySlug];
  let catUrl = '';

  if (catId) {
    catUrl = `https://pakmcqs.com/wp-json/wp/v2/posts?categories=${catId}&per_page=${limit}`;
  } else {
    catUrl = `https://pakmcqs.com/wp-json/wp/v2/posts?search=${encodeURIComponent(categorySlug)}&per_page=${limit}`;
  }

  try {
    const res = await fetch(catUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) return [];
    const posts = await res.json();
    if (!Array.isArray(posts)) return [];

    const mcqs: ScrapedMcq[] = [];
    for (const post of posts) {
      const parsed = parseWpPost(post);
      if (parsed) {
        parsed.categorySlug = categorySlug;
        mcqs.push(parsed);
      }
    }
    return mcqs;
  } catch (err) {
    console.error(`Error scraping PakMCQs category ${categorySlug}:`, err);
    return [];
  }
}
