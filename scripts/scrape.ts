/**
 * PakMCQs Scraper - Scrapes categories and MCQs from pakmcqs.com
 * Uses z-ai-web-dev-sdk page_reader function
 */

import ZAI from 'z-ai-web-dev-sdk';
import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(process.cwd(), 'scraper-data');
const CATEGORIES_FILE = path.join(DATA_DIR, 'categories.json');
const MCQS_FILE = path.join(DATA_DIR, 'mcqs.json');

interface Category {
  name: string;
  slug: string;
  url: string;
  description: string;
  mcqCount: number;
}

interface MCQ {
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
}

const KNOWN_CATEGORIES: Category[] = [
  { name: "General Knowledge", slug: "general_knowledge_mcqs", url: "https://pakmcqs.com/category/general_knowledge_mcqs", description: "General Knowledge MCQs for NTS, FPSC, PPSC Tests", mcqCount: 0 },
  { name: "Pakistan Current Affairs", slug: "pakistan-current-affairs-mcqs", url: "https://pakmcqs.com/category/pakistan-current-affairs-mcqs", description: "Pakistan Current Affairs MCQs", mcqCount: 0 },
  { name: "World Current Affairs", slug: "world-current-affairs-mcqs", url: "https://pakmcqs.com/category/world-current-affairs-mcqs", description: "World Current Affairs MCQs", mcqCount: 0 },
  { name: "Pak Study", slug: "pak-study-mcqs", url: "https://pakmcqs.com/category/pak-study-mcqs", description: "Pakistan Studies MCQs", mcqCount: 0 },
  { name: "Islamic Studies", slug: "islamic-studies-mcqs", url: "https://pakmcqs.com/category/islamic-studies-mcqs", description: "Islamic Studies MCQs", mcqCount: 0 },
  { name: "Everyday Science", slug: "everyday-science-mcqs", url: "https://pakmcqs.com/category/everyday-science-mcqs", description: "Everyday Science MCQs", mcqCount: 0 },
  { name: "English", slug: "english-mcqs", url: "https://pakmcqs.com/category/english-mcqs", description: "English MCQs", mcqCount: 0 },
  { name: "Mathematics", slug: "mathematics-mcqs", url: "https://pakmcqs.com/category/mathematics-mcqs", description: "Mathematics MCQs", mcqCount: 0 },
  { name: "Computer", slug: "computer-mcqs", url: "https://pakmcqs.com/category/computer-mcqs", description: "Computer MCQs", mcqCount: 0 },
  { name: "Pedagogy", slug: "pedagogy-mcqs", url: "https://pakmcqs.com/category/pedagogy-mcqs", description: "Pedagogy MCQs", mcqCount: 0 },
  { name: "Physics", slug: "physics-mcqs", url: "https://pakmcqs.com/category/physics-mcqs", description: "Physics MCQs", mcqCount: 0 },
  { name: "Chemistry", slug: "chemistry-mcqs", url: "https://pakmcqs.com/category/chemistry-mcqs", description: "Chemistry MCQs", mcqCount: 0 },
  { name: "Biology", slug: "biology-mcqs", url: "https://pakmcqs.com/category/biology-mcqs", description: "Biology MCQs", mcqCount: 0 },
  { name: "URDU", slug: "urdu-general-knowledge", url: "https://pakmcqs.com/category/urdu-general-knowledge", description: "URDU General Knowledge MCQs", mcqCount: 0 },
  { name: "Psychology", slug: "psychology-mcqs", url: "https://pakmcqs.com/category/psychology-mcqs", description: "Psychology MCQs", mcqCount: 0 },
  { name: "Agriculture", slug: "agriculture-mcqs", url: "https://pakmcqs.com/category/agriculture-mcqs", description: "Agriculture MCQs", mcqCount: 0 },
  { name: "Forestry", slug: "forestry-mcqs", url: "https://pakmcqs.com/category/forestry-mcqs", description: "Forestry MCQs", mcqCount: 0 },
  { name: "Economics", slug: "economics-mcqs", url: "https://pakmcqs.com/category/economics-mcqs", description: "Economics MCQs", mcqCount: 0 },
  { name: "Sociology", slug: "sociology-mcqs", url: "https://pakmcqs.com/category/sociology-mcqs", description: "Sociology MCQs", mcqCount: 0 },
  { name: "Political Science", slug: "political-science-mcqs", url: "https://pakmcqs.com/category/political-science-mcqs", description: "Political Science MCQs", mcqCount: 0 },
  { name: "Statistics", slug: "statistics-mcqs", url: "https://pakmcqs.com/category/statistics-mcqs", description: "Statistics MCQs", mcqCount: 0 },
  { name: "English Literature", slug: "english-literature-mcqs", url: "https://pakmcqs.com/category/english-literature-mcqs", description: "English Literature MCQs", mcqCount: 0 },
  { name: "Judiciary And Law", slug: "judiciary-and-law-mcqs", url: "https://pakmcqs.com/category/judiciary-and-law-mcqs", description: "Judiciary And Law MCQs", mcqCount: 0 },
  { name: "International Relations", slug: "international-relations", url: "https://pakmcqs.com/category/international-relations", description: "International Relations MCQs", mcqCount: 0 },
  { name: "Physical Education", slug: "physical-education", url: "https://pakmcqs.com/category/physical-education", description: "Physical Education MCQs", mcqCount: 0 },
  { name: "Finance", slug: "finance-mcqs", url: "https://pakmcqs.com/category/finance-mcqs", description: "Finance MCQs", mcqCount: 0 },
  { name: "HRM", slug: "hrm-mcqs", url: "https://pakmcqs.com/category/hrm-mcqs", description: "Human Resource Management MCQs", mcqCount: 0 },
  { name: "Marketing", slug: "marketing-mcqs", url: "https://pakmcqs.com/category/marketing-mcqs", description: "Marketing MCQs", mcqCount: 0 },
  { name: "Accounting", slug: "accounting-mcqs", url: "https://pakmcqs.com/category/accounting-mcqs", description: "Accounting MCQs", mcqCount: 0 },
  { name: "Auditing", slug: "auditing-mcqs", url: "https://pakmcqs.com/category/auditing-mcqs", description: "Auditing MCQs", mcqCount: 0 },
  { name: "Electrical Engineering", slug: "electrical-engineering-mcqs", url: "https://pakmcqs.com/category/electrical-engineering-mcqs", description: "Electrical Engineering MCQs", mcqCount: 0 },
  { name: "Civil Engineering", slug: "civil-engineering-mcqs", url: "https://pakmcqs.com/category/civil-engineering-mcqs", description: "Civil Engineering MCQs", mcqCount: 0 },
  { name: "Mechanical Engineering", slug: "mechanical-engineering-mcqs", url: "https://pakmcqs.com/category/mechanical-engineering-mcqs", description: "Mechanical Engineering MCQs", mcqCount: 0 },
  { name: "Chemical Engineering", slug: "chemical-engineering", url: "https://pakmcqs.com/category/chemical-engineering", description: "Chemical Engineering MCQs", mcqCount: 0 },
  { name: "Software Engineering", slug: "software-engineering-mcqs", url: "https://pakmcqs.com/category/software-engineering-mcqs", description: "Software Engineering MCQs", mcqCount: 0 },
  { name: "Medical", slug: "medical-mcqs", url: "https://pakmcqs.com/category/medical-mcqs", description: "Medical MCQs", mcqCount: 0 },
  { name: "Past Papers", slug: "past-papers", url: "https://pakmcqs.com/category/past-papers", description: "Past Papers MCQs", mcqCount: 0 },
];

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function extractMCQUrlsFromCategoryPage(html: string): string[] {
  const urls: string[] = [];
  const seen = new Set<string>();
  
  const linkPattern = /href="(https:\/\/pakmcqs\.com\/[^"]+)"[^>]*>([^<]+)<\/a>/g;
  let match;
  
  while ((match = linkPattern.exec(html)) !== null) {
    const url = match[1];
    const text = match[2].trim();
    
    if (url.includes('/category/') || 
        url.includes('quiz') || 
        url.includes('/submit') || 
        url.includes('/privacy') || 
        url.includes('/pakmcqs-app') ||
        url.includes('/my-account') ||
        url.includes('/page/') ||
        url.includes('/feed') ||
        text.length < 15) {
      continue;
    }
    
    if (!seen.has(url)) {
      urls.push(url);
      seen.add(url);
    }
  }
  
  return urls;
}

function extractMCQFromPage(html: string, sourceUrl: string, categorySlug: string, categoryName: string): MCQ | null {
  try {
    let question = '';
    let correctAnswer = '';
    
    // Method 1: Extract from schema.org structured data (most reliable)
    const schemaQuestionMatch = html.match(/"name"\s*:\s*"([^"]+\?)/);
    if (schemaQuestionMatch) {
      question = schemaQuestionMatch[1];
    }
    
    const schemaAnswerMatch = html.match(/"acceptedAnswer"\s*:\s*\{[^}]*"text"\s*:\s*"([^"]+)"/);
    if (schemaAnswerMatch) {
      correctAnswer = schemaAnswerMatch[1];
    }
    
    // Method 2: Extract from correct-answer div
    if (!question || !correctAnswer) {
      const correctDivMatch = html.match(/correct-answer[^>]*>[\s\S]*?"([^"]+)"[^]*?is[^]*?"([^"]+)"/);
      if (correctDivMatch && !question) {
        question = correctDivMatch[1];
      }
      if (correctDivMatch && !correctAnswer) {
        correctAnswer = correctDivMatch[2];
      }
    }
    
    // Method 3: Try h1 tag
    if (!question) {
      const h1Match = html.match(/<h1[^>]*class="post-title[^"]*"[^>]*>([\s\S]*?)<\/h1>/);
      if (h1Match) {
        question = h1Match[1].replace(/<[^>]+>/g, '').trim();
      }
    }
    
    // Method 4: Try OG title
    if (!question) {
      const ogTitle = html.match(/property="og:title"\s+content="([^"]+)"/);
      if (ogTitle) {
        question = ogTitle[1].replace(/\s*-\s*PakMcqs\s*$/, '').trim();
      }
    }
    
    // Extract options from the content
    let optionA = '', optionB = '', optionC = '', optionD = '';
    
    // Clean the HTML for better option extraction
    const textContent = html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/&nbsp;/g, ' ')
      .replace(/&#8211;/g, '-')
      .replace(/&#8217;/g, "'")
      .replace(/&#8220;/g, '"')
      .replace(/&#8221;/g, '"')
      .replace(/&#038;/g, '&')
      .replace(/&amp;/g, '&');
    
    // Try to find options in the standard format A. B. C. D.
    const optionRegex = /([A-D])\.\s+([^A-D\n]+?)(?=\s+[A-D]\.|Submitted|correct|$)/gi;
    const optionMatches: Record<string, string> = {};
    let optMatch;
    
    while ((optMatch = optionRegex.exec(textContent)) !== null) {
      const letter = optMatch[1].toUpperCase();
      const text = optMatch[2].replace(/<[^>]+>/g, '').trim();
      if (text.length > 0 && text.length < 200) {
        optionMatches[letter] = text;
      }
    }
    
    optionA = optionMatches['A'] || '';
    optionB = optionMatches['B'] || '';
    optionC = optionMatches['C'] || '';
    optionD = optionMatches['D'] || '';
    
    // Extract submitted by
    let submittedBy = '';
    const submittedMatch = html.match(/Submitted\s*(?:by|By)\s*:\s*([^<\n]+)/i);
    if (submittedMatch) {
      submittedBy = submittedMatch[1].trim();
    }
    
    // Clean HTML entities
    const clean = (s: string) => s
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#039;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&#8217;/g, "'")
      .replace(/&#8220;/g, '"')
      .replace(/&#8221;/g, '"')
      .replace(/&#8211;/g, '-')
      .replace(/&#8212;/g, '—')
      .replace(/&nbsp;/g, ' ')
      .replace(/<[^>]+>/g, '')
      .trim();
    
    question = clean(question);
    correctAnswer = clean(correctAnswer);
    optionA = clean(optionA);
    optionB = clean(optionB);
    optionC = clean(optionC);
    optionD = clean(optionD);
    submittedBy = clean(submittedBy);
    
    if (!question || !optionA || !correctAnswer) {
      return null;
    }
    
    // Ensure question ends with ?
    if (!question.endsWith('?') && !question.endsWith('?')) {
      question = question.replace(/\?\s*$/, '') + '?';
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
      sourceUrl,
      submittedBy
    };
  } catch (e) {
    console.error(`Error extracting MCQ from ${sourceUrl}:`, e);
    return null;
  }
}

async function scrapeCategoryPage(zai: any, category: Category, pageNum: number = 1): Promise<{ urls: string[], html: string }> {
  const url = pageNum === 1 ? category.url : `${category.url}/page/${pageNum}`;
  console.log(`  Scraping category page: ${url}`);
  
  try {
    const result = await zai.functions.invoke('page_reader', { url });
    return { urls: extractMCQUrlsFromCategoryPage(result.data.html), html: result.data.html };
  } catch (error: any) {
    console.error(`  Failed to scrape ${url}:`, error?.message || error);
    return { urls: [], html: '' };
  }
}

async function scrapeMCQPage(zai: any, url: string, categorySlug: string, categoryName: string): Promise<MCQ | null> {
  try {
    const result = await zai.functions.invoke('page_reader', { url });
    return extractMCQFromPage(result.data.html, url, categorySlug, categoryName);
  } catch (error: any) {
    console.error(`  Failed to scrape MCQ ${url}:`, error?.message || error);
    return null;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'scrape';
  const categoryIndex = args[1] ? parseInt(args[1]) : -1;
  const maxPages = args[2] ? parseInt(args[2]) : 3;
  
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  
  const zai = await ZAI.create();
  
  if (command === 'categories') {
    fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(KNOWN_CATEGORIES, null, 2));
    console.log(`Saved ${KNOWN_CATEGORIES.length} categories to ${CATEGORIES_FILE}`);
    return;
  }
  
  if (command === 'scrape') {
    const categoriesToScrape = categoryIndex >= 0 
      ? [KNOWN_CATEGORIES[categoryIndex]] 
      : KNOWN_CATEGORIES;
    
    let allMcqs: MCQ[] = [];
    
    if (fs.existsSync(MCQS_FILE)) {
      allMcqs = JSON.parse(fs.readFileSync(MCQS_FILE, 'utf-8'));
      console.log(`Loaded ${allMcqs.length} existing MCQs`);
    }
    
    const existingUrls = new Set(allMcqs.map(m => m.sourceUrl));
    
    for (const category of categoriesToScrape) {
      console.log(`\n=== Scraping category: ${category.name} ===`);
      
      let categoryMcqs: MCQ[] = [];
      
      for (let page = 1; page <= maxPages; page++) {
        const { urls } = await scrapeCategoryPage(zai, category, page);
        console.log(`  Found ${urls.length} MCQ URLs on page ${page}`);
        
        for (const url of urls) {
          if (existingUrls.has(url)) {
            console.log(`  Skipping already scraped: ${url}`);
            continue;
          }
          
          const mcq = await scrapeMCQPage(zai, url, category.slug, category.name);
          if (mcq) {
            categoryMcqs.push(mcq);
            existingUrls.add(url);
            console.log(`  ✓ Extracted: ${mcq.question.substring(0, 60)}...`);
          } else {
            console.log(`  ✗ Failed to extract from: ${url}`);
          }
          
          await delay(500);
        }
        
        if (urls.length === 0) break;
        await delay(1000);
      }
      
      console.log(`  Category ${category.name}: ${categoryMcqs.length} MCQs scraped`);
      allMcqs.push(...categoryMcqs);
      
      fs.writeFileSync(MCQS_FILE, JSON.stringify(allMcqs, null, 2));
      console.log(`  Total MCQs saved: ${allMcqs.length}`);
    }
    
    console.log(`\n=== Scraping Complete ===`);
    console.log(`Total MCQs scraped: ${allMcqs.length}`);
    
    for (const category of KNOWN_CATEGORIES) {
      category.mcqCount = allMcqs.filter(m => m.categorySlug === category.slug).length;
    }
    fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(KNOWN_CATEGORIES, null, 2));
  }
  
  if (command === 'stats') {
    if (fs.existsSync(MCQS_FILE)) {
      const mcqs: MCQ[] = JSON.parse(fs.readFileSync(MCQS_FILE, 'utf-8'));
      console.log(`Total MCQs: ${mcqs.length}`);
      
      const byCategory: Record<string, number> = {};
      for (const mcq of mcqs) {
        byCategory[mcq.categoryName] = (byCategory[mcq.categoryName] || 0) + 1;
      }
      
      for (const [cat, count] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) {
        console.log(`  ${cat}: ${count}`);
      }
    } else {
      console.log('No MCQs data found. Run scrape first.');
    }
  }
}

main().catch(console.error);
