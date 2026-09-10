/**
 * Comprehensive scraper for pakmcqs.com using WordPress REST API
 * Fetches MCQ posts and parses quiz data from post content
 * 
 * Usage: bun run scripts/scrape-v3.ts
 * With custom page limit: MAX_PAGES=10 bun run scripts/scrape-v3.ts
 */

import { db } from '../src/lib/db';

const POSTS_ENDPOINT = 'https://pakmcqs.com/wp-json/wp/v2/posts';

// Direct mapping from WordPress category IDs to our database slugs
const WP_CATEGORY_MAP: Record<number, { slug: string; name: string }> = {
  1: { slug: "General_Knowledge_MCQs", name: "General Knowledge" },
  70: { slug: "Pakistan_Current_Affairs_MCQs", name: "Pakistan Current Affairs" },
  37: { slug: "World_Current_Affairs_MCQs", name: "World Current Affairs" },
  48: { slug: "Pak_Study_MCQs", name: "Pak Study" },
  38: { slug: "Islamic_Studies_MCQs", name: "Islamic Studies" },
  39: { slug: "Everyday_Science_MCQs", name: "Everyday Science" },
  44: { slug: "English_MCQs", name: "English" },
  45: { slug: "Mathematics_MCQs", name: "Mathematics" },
  50: { slug: "Computer_MCQs", name: "Computer" },
  147: { slug: "Pedagogy_MCQs", name: "Pedagogy" },
  46: { slug: "Physics_MCQs", name: "Physics" },
  40: { slug: "Chemistry_MCQs", name: "Chemistry" },
  41: { slug: "Biology_MCQs", name: "Biology" },
  166: { slug: "URDU_MCQs", name: "URDU" },
  742: { slug: "Psychology_MCQs", name: "Psychology" },
  393: { slug: "Agriculture_MCQs", name: "Agriculture" },
  1025: { slug: "Forestry_MCQs", name: "Forestry" },
  79: { slug: "Economics_MCQs", name: "Economics" },
  570: { slug: "Sociology_MCQs", name: "Sociology" },
  856: { slug: "Political_Science_MCQs", name: "Political Science" },
  76: { slug: "Statistics_MCQs", name: "Statistics" },
  521: { slug: "English_Literature_MCQs", name: "English Literature" },
  109: { slug: "Judiciary_And_Law_MCQs", name: "Judiciary And Law" },
  982: { slug: "International_Relations_MCQs", name: "International Relations" },
  1066: { slug: "Physical_Education_MCQs", name: "Physical Education" },
  52: { slug: "Finance_MCQs", name: "Finance" },
  53: { slug: "HRM_MCQs", name: "HRM" },
  54: { slug: "Marketing_MCQs", name: "Marketing" },
  71: { slug: "Accounting_MCQs", name: "Accounting" },
  80: { slug: "Auditing_MCQs", name: "Auditing" },
  111: { slug: "Electrical_Engineering_MCQs", name: "Electrical Engineering" },
  240: { slug: "Civil_Engineering_MCQs", name: "Civil Engineering" },
  285: { slug: "Mechanical_Engineering_MCQs", name: "Mechanical Engineering" },
  320: { slug: "Chemical_Engineering_MCQs", name: "Chemical Engineering" },
  304: { slug: "Software_Engineering_MCQs", name: "Software Engineering" },
  740: { slug: "Medical_MCQs", name: "Medical" },
  1064: { slug: "Past_Papers_MCQs", name: "Past Papers" },
};

interface WPPost {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  categories: number[];
  slug: string;
  link: string;
}

interface ParsedMcq {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  sourceUrl: string;
  submittedBy: string;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Clean HTML to plain text
 */
function cleanHtml(html: string): string {
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
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '-')
    .replace(/&#8212;/g, '—')
    .replace(/&#038;/g, '&')
    .replace(/&#8230;/g, '...')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Decode HTML entities in title
 */
function decodeTitle(title: string): string {
  return title
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '-')
    .replace(/&#038;/g, '&')
    .replace(/&#8230;/g, '...')
    .trim();
}

/**
 * Parse MCQ data from WordPress post content HTML
 */
function parseMcqFromPost(html: string, postTitle: string, sourceUrl: string): ParsedMcq | null {
  const cleanText = cleanHtml(html);
  
  // Strategy 1: Look for quiz data (mtq plugin format)
  // The pakmcqs.com uses My Quiz plugin which stores answers in specific HTML structure
  
  // Strategy 2: Extract options from content with letter prefix pattern
  // Match patterns like "A. text" or "A) text" 
  const options: Record<string, string> = {};
  
  // First try to extract from clean text with careful regex
  // Pattern: A. or A) followed by text until B. or B) etc.
  const optRegex = /\b([A-D])[\.\)]\s*((?:(?!\b[A-D][\.\)]\s).)+)/gi;
  let match;
  while ((match = optRegex.exec(cleanText)) !== null) {
    const letter = match[1].toUpperCase();
    const text = match[2].trim();
    if (text.length > 0 && text.length < 500) {
      options[letter] = text;
    }
  }
  
  // Strategy 3: Try extracting from the HTML more carefully for mtq quiz format
  if (Object.keys(options).length < 4) {
    // mtq uses specific class names for questions and answers
    const mtqQuestionMatch = html.match(/mtq_question_text[^>]*>([\s\S]*?)<\/div>/i);
    const mtqAnswerMatches = [...html.matchAll(/mtq_answer_text[^>]*>([\s\S]*?)<\/div>/gi)];
    const mtqCorrectMatches = [...html.matchAll(/mtq_correct_marker[^>]*>[\s\S]*?mtq_answer_text[^>]*>([\s\S]*?)<\/div>/gi)];
    
    if (mtqAnswerMatches.length >= 4) {
      const letters = ['A', 'B', 'C', 'D'];
      mtqAnswerMatches.forEach((m, i) => {
        if (i < 4) {
          options[letters[i]] = cleanHtml(m[1]).trim();
        }
      });
    }
  }
  
  // Must have at least 3 options to be valid
  if (Object.keys(options).length < 3) {
    return null;
  }
  
  // Clean question
  const question = decodeTitle(postTitle);
  if (!question || question.length < 5) {
    return null;
  }
  
  // Try to find correct answer
  let correctAnswer = '';
  
  // Method 1: Look for "Correct Answer:" pattern
  const answerPatterns = [
    /correct\s*answer\s*[:\-]?\s*(?:option\s*)?([A-D])/i,
    /answer\s*[:\-]?\s*(?:is\s*)?(?:option\s*)?([A-D])[\.\)]/i,
    /the\s+correct\s+answer\s+is\s+(?:option\s*)?([A-D])/i,
  ];

  for (const pattern of answerPatterns) {
    const answerMatch = cleanText.match(pattern);
    if (answerMatch) {
      const letter = answerMatch[1].toUpperCase();
      if (options[letter]) {
        correctAnswer = options[letter];
        break;
      }
    }
  }
  
  // Method 2: Check for mtq_correct class
  if (!correctAnswer) {
    const correctClassMatch = html.match(/mtq_correct[^>]*>[\s\S]*?mtq_answer_text[^>]*>([\s\S]*?)<\/div>/i);
    if (correctClassMatch) {
      const correctText = cleanHtml(correctClassMatch[1]).trim();
      for (const [letter, text] of Object.entries(options)) {
        if (text === correctText || text.includes(correctText) || correctText.includes(text)) {
          correctAnswer = text;
          break;
        }
      }
    }
  }
  
  // Method 3: Look for highlighted/bold correct answer in content
  if (!correctAnswer) {
    const boldAnswerMatch = html.match(/<strong>\s*([A-D][\.\)]?\s*[^<]+)\s*<\/strong>/i);
    if (boldAnswerMatch) {
      const boldText = boldAnswerMatch[1].trim();
      const letterMatch = boldText.match(/^([A-D])[\\.\)]?\s*/i);
      if (letterMatch) {
        const letter = letterMatch[1].toUpperCase();
        if (options[letter]) {
          correctAnswer = options[letter];
        }
      }
    }
  }

  // Try to find submitted by info
  let submittedBy = '';
  const submittedMatch = cleanText.match(/submitted\s+by\s*[:\-]?\s*([^\n,.]+)/i);
  if (submittedMatch) {
    submittedBy = submittedMatch[1].trim().replace(/\s+/g, ' ').substring(0, 100);
  }

  return {
    question,
    optionA: options.A || '',
    optionB: options.B || '',
    optionC: options.C || 'N/A',
    optionD: options.D || 'N/A',
    correctAnswer,
    sourceUrl,
    submittedBy,
  };
}

/**
 * Fetch posts for a category using WordPress REST API
 */
async function fetchPosts(categoryId: number, page: number = 1, perPage: number = 20): Promise<{ posts: WPPost[]; totalPages: number }> {
  const url = `${POSTS_ENDPOINT}?categories=${categoryId}&per_page=${perPage}&page=${page}&_fields=id,title,content,categories,slug,link`;
  
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    signal: AbortSignal.timeout(15000),
  });
  
  if (!response.ok) {
    if (response.status === 400) {
      return { posts: [], totalPages: 0 };
    }
    throw new Error(`HTTP ${response.status}`);
  }
  
  const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1', 10);
  const posts: WPPost[] = await response.json();
  
  return { posts, totalPages };
}

/**
 * Main scraping function
 */
async function main() {
  const maxPagesPerCategory = parseInt(process.env.MAX_PAGES || '5', 10);
  
  console.log(`\n🚀 Starting PakMCQs scraper (max ${maxPagesPerCategory} pages/category)`);
  console.log(`   Categories to scrape: ${Object.keys(WP_CATEGORY_MAP).length}\n`);
  
  // Get valid category slugs from our database
  const dbCategories = await db.category.findMany({ select: { slug: true, name: true } });
  const dbSlugSet = new Set(dbCategories.map(c => c.slug));
  
  // Get existing MCQs to avoid duplicates
  const existingMcqs = await db.mcq.findMany({ select: { question: true, categorySlug: true } });
  const existingSet = new Set(existingMcqs.map(m => `${m.question}|${m.categorySlug}`));
  console.log(`📊 Current database: ${existingMcqs.length} MCQs across ${dbCategories.length} categories\n`);
  
  let totalNew = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  
  // Process each WordPress category
  for (const [wpCatIdStr, catInfo] of Object.entries(WP_CATEGORY_MAP)) {
    const wpCatId = parseInt(wpCatIdStr);
    
    // Skip if not in our database
    if (!dbSlugSet.has(catInfo.slug)) {
      console.log(`⏭️  Skipping ${catInfo.name} - not in database`);
      continue;
    }
    
    console.log(`\n📂 ${catInfo.name} (${catInfo.slug})`);
    
    let categoryNew = 0;
    
    for (let page = 1; page <= maxPagesPerCategory; page++) {
      try {
        const { posts, totalPages } = await fetchPosts(wpCatId, page);
        
        if (posts.length === 0) {
          break;
        }
        
        for (const post of posts) {
          try {
            const mcq = parseMcqFromPost(
              post.content.rendered,
              post.title.rendered,
              post.link
            );
            
            if (!mcq || !mcq.optionA || !mcq.optionB) {
              totalSkipped++;
              continue;
            }
            
            // Check for duplicates
            const dedupeKey = `${mcq.question}|${catInfo.slug}`;
            if (existingSet.has(dedupeKey)) {
              totalSkipped++;
              continue;
            }
            
            // Insert into database
            await db.mcq.create({
              data: {
                question: mcq.question,
                optionA: mcq.optionA,
                optionB: mcq.optionB,
                optionC: mcq.optionC || 'N/A',
                optionD: mcq.optionD || 'N/A',
                correctAnswer: mcq.correctAnswer || '',
                categorySlug: catInfo.slug,
                sourceUrl: mcq.sourceUrl,
                submittedBy: mcq.submittedBy,
              },
            });
            
            existingSet.add(dedupeKey);
            totalNew++;
            categoryNew++;
            
          } catch (error: any) {
            if (error?.code === 'P2002') {
              totalSkipped++;
            } else {
              totalErrors++;
            }
          }
        }
        
        console.log(`  Page ${page}: +${categoryNew} new MCQs`);
        
        // Rate limiting
        await delay(800);
        
      } catch (error: any) {
        totalErrors++;
        console.error(`  ❌ Page ${page} error: ${error?.message?.substring(0, 60)}`);
        await delay(3000);
      }
    }
  }
  
  // Print summary
  const finalCount = await db.mcq.count();
  const categoriesWithMcqs = await db.category.findMany({
    include: { _count: { select: { mcqs: true } } },
  });
  
  console.log(`\n${'='.repeat(50)}`);
  console.log(`✅ SCRAPE COMPLETE`);
  console.log(`${'='.repeat(50)}`);
  console.log(`  New MCQs added:      ${totalNew}`);
  console.log(`  Skipped (dup/invalid): ${totalSkipped}`);
  console.log(`  Errors:               ${totalErrors}`);
  console.log(`  Total MCQs in DB:     ${finalCount}`);
  console.log(`\n  Categories with MCQs:`);
  categoriesWithMcqs
    .filter(c => c._count.mcqs > 0)
    .sort((a, b) => b._count.mcqs - a._count.mcqs)
    .forEach(c => console.log(`    ${c.icon} ${c.name}: ${c._count.mcqs}`));
  console.log(`${'='.repeat(50)}\n`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
