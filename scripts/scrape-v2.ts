/**
 * PakMCQs Scraper V2 - Extracts MCQs directly from category listing pages
 * Much more efficient - gets multiple MCQs per page without visiting individual pages
 */

import ZAI from 'z-ai-web-dev-sdk';
import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(process.cwd(), 'scraper-data');
const MCQS_FILE = path.join(DATA_DIR, 'mcqs.json');
const PROGRESS_FILE = path.join(DATA_DIR, 'progress.json');

interface Category {
  name: string;
  slug: string;
  url: string;
  description: string;
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

const CATEGORIES: Category[] = [
  { name: "General Knowledge", slug: "general_knowledge_mcqs", url: "https://pakmcqs.com/category/general_knowledge_mcqs", description: "General Knowledge MCQs for NTS, FPSC, PPSC Tests" },
  { name: "Pakistan Current Affairs", slug: "pakistan-current-affairs-mcqs", url: "https://pakmcqs.com/category/pakistan-current-affairs-mcqs", description: "Pakistan Current Affairs MCQs" },
  { name: "World Current Affairs", slug: "world-current-affairs-mcqs", url: "https://pakmcqs.com/category/world-current-affairs-mcqs", description: "World Current Affairs MCQs" },
  { name: "Pak Study", slug: "pak-study-mcqs", url: "https://pakmcqs.com/category/pak-study-mcqs", description: "Pakistan Studies MCQs" },
  { name: "Islamic Studies", slug: "islamic-studies-mcqs", url: "https://pakmcqs.com/category/islamic-studies-mcqs", description: "Islamic Studies MCQs" },
  { name: "Everyday Science", slug: "everyday-science-mcqs", url: "https://pakmcqs.com/category/everyday-science-mcqs", description: "Everyday Science MCQs" },
  { name: "English", slug: "english-mcqs", url: "https://pakmcqs.com/category/english-mcqs", description: "English MCQs" },
  { name: "Mathematics", slug: "mathematics-mcqs", url: "https://pakmcqs.com/category/mathematics-mcqs", description: "Mathematics MCQs" },
  { name: "Computer", slug: "computer-mcqs", url: "https://pakmcqs.com/category/computer-mcqs", description: "Computer MCQs" },
  { name: "Pedagogy", slug: "pedagogy-mcqs", url: "https://pakmcqs.com/category/pedagogy-mcqs", description: "Pedagogy MCQs" },
  { name: "Physics", slug: "physics-mcqs", url: "https://pakmcqs.com/category/physics-mcqs", description: "Physics MCQs" },
  { name: "Chemistry", slug: "chemistry-mcqs", url: "https://pakmcqs.com/category/chemistry-mcqs", description: "Chemistry MCQs" },
  { name: "Biology", slug: "biology-mcqs", url: "https://pakmcqs.com/category/biology-mcqs", description: "Biology MCQs" },
  { name: "URDU", slug: "urdu-general-knowledge", url: "https://pakmcqs.com/category/urdu-general-knowledge", description: "URDU General Knowledge MCQs" },
  { name: "Psychology", slug: "psychology-mcqs", url: "https://pakmcqs.com/category/psychology-mcqs", description: "Psychology MCQs" },
  { name: "Agriculture", slug: "agriculture-mcqs", url: "https://pakmcqs.com/category/agriculture-mcqs", description: "Agriculture MCQs" },
  { name: "Forestry", slug: "forestry-mcqs", url: "https://pakmcqs.com/category/forestry-mcqs", description: "Forestry MCQs" },
  { name: "Economics", slug: "economics-mcqs", url: "https://pakmcqs.com/category/economics-mcqs", description: "Economics MCQs" },
  { name: "Sociology", slug: "sociology-mcqs", url: "https://pakmcqs.com/category/sociology-mcqs", description: "Sociology MCQs" },
  { name: "Political Science", slug: "political-science-mcqs", url: "https://pakmcqs.com/category/political-science-mcqs", description: "Political Science MCQs" },
  { name: "Statistics", slug: "statistics-mcqs", url: "https://pakmcqs.com/category/statistics-mcqs", description: "Statistics MCQs" },
  { name: "English Literature", slug: "english-literature-mcqs", url: "https://pakmcqs.com/category/english-literature-mcqs", description: "English Literature MCQs" },
  { name: "Judiciary And Law", slug: "judiciary-and-law-mcqs", url: "https://pakmcqs.com/category/judiciary-and-law-mcqs", description: "Judiciary And Law MCQs" },
  { name: "International Relations", slug: "international-relations", url: "https://pakmcqs.com/category/international-relations", description: "International Relations MCQs" },
  { name: "Physical Education", slug: "physical-education", url: "https://pakmcqs.com/category/physical-education", description: "Physical Education MCQs" },
  { name: "Finance", slug: "finance-mcqs", url: "https://pakmcqs.com/category/finance-mcqs", description: "Finance MCQs" },
  { name: "HRM", slug: "hrm-mcqs", url: "https://pakmcqs.com/category/hrm-mcqs", description: "HRM MCQs" },
  { name: "Marketing", slug: "marketing-mcqs", url: "https://pakmcqs.com/category/marketing-mcqs", description: "Marketing MCQs" },
  { name: "Accounting", slug: "accounting-mcqs", url: "https://pakmcqs.com/category/accounting-mcqs", description: "Accounting MCQs" },
  { name: "Auditing", slug: "auditing-mcqs", url: "https://pakmcqs.com/category/auditing-mcqs", description: "Auditing MCQs" },
  { name: "Electrical Engineering", slug: "electrical-engineering-mcqs", url: "https://pakmcqs.com/category/electrical-engineering-mcqs", description: "Electrical Engineering MCQs" },
  { name: "Civil Engineering", slug: "civil-engineering-mcqs", url: "https://pakmcqs.com/category/civil-engineering-mcqs", description: "Civil Engineering MCQs" },
  { name: "Mechanical Engineering", slug: "mechanical-engineering-mcqs", url: "https://pakmcqs.com/category/mechanical-engineering-mcqs", description: "Mechanical Engineering MCQs" },
  { name: "Chemical Engineering", slug: "chemical-engineering", url: "https://pakmcqs.com/category/chemical-engineering", description: "Chemical Engineering MCQs" },
  { name: "Software Engineering", slug: "software-engineering-mcqs", url: "https://pakmcqs.com/category/software-engineering-mcqs", description: "Software Engineering MCQs" },
  { name: "Medical", slug: "medical-mcqs", url: "https://pakmcqs.com/category/medical-mcqs", description: "Medical MCQs" },
  { name: "Past Papers", slug: "past-papers", url: "https://pakmcqs.com/category/past-papers", description: "Past Papers MCQs" },
];

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const clean = (s: string): string => s
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&#039;/g, "'")
  .replace(/&quot;/g, '"')
  .replace(/&#8217;/g, "'")
  .replace(/&#8216;/g, "'")
  .replace(/&#8220;/g, '"')
  .replace(/&#8221;/g, '"')
  .replace(/&#8211;/g, '-')
  .replace(/&#8212;/g, '—')
  .replace(/&#8230;/g, '...')
  .replace(/&nbsp;/g, ' ')
  .replace(/&#160;/g, ' ')
  .replace(/<[^>]+>/g, '')
  .replace(/\s+/g, ' ')
  .trim();

function extractMCQsFromCategoryHTML(html: string, category: Category): MCQ[] {
  const mcqs: MCQ[] = [];
  
  // Extract article blocks
  const articlePattern = /<article[^>]*class="[^"]*l-post[^"]*"[^>]*>([\s\S]*?)<\/article>/g;
  let articleMatch;
  
  while ((articleMatch = articlePattern.exec(html)) !== null) {
    const articleContent = articleMatch[1];
    
    // Extract title/question
    let question = '';
    const titleMatch = articleContent.match(/<h2[^>]*class="[^"]*post-title[^"]*"[^>]*>([\s\S]*?)<\/h2>/);
    if (titleMatch) {
      question = clean(titleMatch[1]);
      // Remove the link text if it's just the title
      question = question.replace(/<a[^>]*>/, '').replace(/<\/a>/, '');
    }
    
    // Also try h3
    if (!question) {
      const h3Match = articleContent.match(/<h3[^>]*>([\s\S]*?)<\/h3>/);
      if (h3Match) {
        question = clean(h3Match[1]);
      }
    }
    
    // Extract excerpt (contains options)
    let excerpt = '';
    const excerptMatch = articleContent.match(/class="excerpt[^"]*"[^>]*>([\s\S]*?)<\/div>/);
    if (excerptMatch) {
      excerpt = excerptMatch[1];
    }
    
    // Also try content div
    if (!excerpt) {
      const contentMatch = articleContent.match(/class="post-content[^"]*"[^>]*>([\s\S]*?)<\/div>/);
      if (contentMatch) {
        excerpt = contentMatch[1];
      }
    }
    
    // Extract source URL
    let sourceUrl = '';
    const linkMatch = articleContent.match(/href="(https:\/\/pakmcqs\.com\/[^"]+)"/);
    if (linkMatch) {
      sourceUrl = linkMatch[1];
    }
    
    // Extract options from excerpt
    let optionA = '', optionB = '', optionC = '', optionD = '';
    
    // Clean the excerpt for option extraction
    const cleanExcerpt = excerpt
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&#8211;/g, '-')
      .replace(/&#8217;/g, "'")
      .replace(/&#8220;/g, '"')
      .replace(/&#8221;/g, '"')
      .replace(/&#038;/g, '&')
      .replace(/&amp;/g, '&');
    
    // Extract options
    const aMatch = cleanExcerpt.match(/A\.\s*([^\n]+)/i);
    const bMatch = cleanExcerpt.match(/B\.\s*([^\n]+)/i);
    const cMatch = cleanExcerpt.match(/C\.\s*([^\n]+)/i);
    const dMatch = cleanExcerpt.match(/D\.\s*([^\n]+)/i);
    
    if (aMatch) optionA = aMatch[1].trim();
    if (bMatch) optionB = bMatch[1].trim();
    if (cMatch) optionC = cMatch[1].trim();
    if (dMatch) optionD = dMatch[1].trim();
    
    // Extract submitted by
    let submittedBy = '';
    const submittedMatch = cleanExcerpt.match(/Submitted\s*(?:by|By)\s*:\s*(.+)/i);
    if (submittedMatch) {
      submittedBy = submittedMatch[1].trim();
      // Remove submitted by from option D if it got appended
      optionD = optionD.replace(/Submitted\s*(?:by|By)\s*:.*/i, '').trim();
    }
    
    // Clean all fields
    question = clean(question);
    optionA = clean(optionA);
    optionB = clean(optionB);
    optionC = clean(optionC);
    optionD = clean(optionD);
    submittedBy = clean(submittedBy);
    
    // Validate - we need at least a question and some options
    if (!question || !optionA) continue;
    
    // Skip non-MCQ entries (like quiz pages, submit pages)
    if (question.toLowerCase().includes('quiz') || 
        question.toLowerCase().includes('submit') || 
        question.toLowerCase().includes('privacy') ||
        sourceUrl.includes('/quiz') ||
        sourceUrl.includes('/submit')) {
      continue;
    }
    
    mcqs.push({
      question,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer: '', // Will be filled from individual pages later
      categorySlug: category.slug,
      categoryName: category.name,
      sourceUrl,
      submittedBy
    });
  }
  
  return mcqs;
}

// Extract correct answers from individual MCQ pages
async function extractCorrectAnswer(zai: any, url: string): Promise<string> {
  try {
    const result = await zai.functions.invoke('page_reader', { url });
    const html = result.data.html;
    
    // Try schema.org first (most reliable)
    const schemaAnswerMatch = html.match(/"acceptedAnswer"\s*:\s*\{[^}]*"text"\s*:\s*"([^"]+)"/);
    if (schemaAnswerMatch) {
      return clean(schemaAnswerMatch[1]);
    }
    
    // Try correct-answer div
    const correctDivMatch = html.match(/correct-answer[^>]*>[\s\S]*?"([^"]+)"[^]*?is[^]*?"([^"]+)"/);
    if (correctDivMatch) {
      return clean(correctDivMatch[2]);
    }
    
    return '';
  } catch (error: any) {
    console.error(`  Failed to get answer from ${url}:`, error?.message?.substring(0, 50) || error);
    return '';
  }
}

interface Progress {
  [categorySlug: string]: {
    lastPage: number;
    totalScraped: number;
  };
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'scrape';
  const startCategoryIndex = args[1] ? parseInt(args[1]) : 0;
  const maxPages = args[2] ? parseInt(args[2]) : 5;
  const fetchAnswers = args[3] === 'answers';
  
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  
  const zai = await ZAI.create();
  
  if (command === 'scrape') {
    // Load existing MCQs and progress
    let allMcqs: MCQ[] = [];
    if (fs.existsSync(MCQS_FILE)) {
      allMcqs = JSON.parse(fs.readFileSync(MCQS_FILE, 'utf-8'));
      console.log(`Loaded ${allMcqs.length} existing MCQs`);
    }
    
    let progress: Progress = {};
    if (fs.existsSync(PROGRESS_FILE)) {
      progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
    }
    
    const existingUrls = new Set(allMcqs.map(m => m.sourceUrl));
    
    const categoriesToScrape = CATEGORIES.slice(startCategoryIndex);
    
    for (const category of categoriesToScrape) {
      console.log(`\n=== Scraping category: ${category.name} ===`);
      
      let startPage = (progress[category.slug]?.lastPage || 0) + 1;
      let categoryNewMcqs = 0;
      
      for (let page = startPage; page <= maxPages; page++) {
        const url = page === 1 ? category.url : `${category.url}/page/${page}`;
        console.log(`  Scraping page ${page}: ${url}`);
        
        try {
          const result = await zai.functions.invoke('page_reader', { url });
          const mcqs = extractMCQsFromCategoryHTML(result.data.html, category);
          
          let newCount = 0;
          for (const mcq of mcqs) {
            if (!existingUrls.has(mcq.sourceUrl)) {
              allMcqs.push(mcq);
              existingUrls.add(mcq.sourceUrl);
              newCount++;
              categoryNewMcqs++;
            }
          }
          
          console.log(`  Found ${mcqs.length} MCQs, ${newCount} new`);
          
          // Update progress
          progress[category.slug] = { lastPage: page, totalScraped: (progress[category.slug]?.totalScraped || 0) + newCount };
          
          // Save after each page
          fs.writeFileSync(MCQS_FILE, JSON.stringify(allMcqs, null, 2));
          fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
          
          if (mcqs.length === 0) {
            console.log(`  No more MCQs found, moving to next category`);
            break;
          }
          
          await delay(2000); // Rate limiting
        } catch (error: any) {
          console.error(`  Error scraping page ${page}:`, error?.message?.substring(0, 80) || error);
          if (error?.message?.includes('429')) {
            console.log(`  Rate limited, waiting 30 seconds...`);
            await delay(30000);
            // Retry the same page
            page--;
          }
          await delay(3000);
        }
      }
      
      console.log(`  Category ${category.name}: ${categoryNewMcqs} new MCQs`);
    }
    
    console.log(`\n=== Scraping Complete ===`);
    console.log(`Total MCQs: ${allMcqs.length}`);
  }
  
  if (command === 'answers') {
    // Fetch correct answers for MCQs that don't have them
    let allMcqs: MCQ[] = [];
    if (fs.existsSync(MCQS_FILE)) {
      allMcqs = JSON.parse(fs.readFileSync(MCQS_FILE, 'utf-8'));
    }
    
    const mcqsNeedAnswers = allMcqs.filter(m => !m.correctAnswer);
    console.log(`${mcqsNeedAnswers.length} MCQs need correct answers out of ${allMcqs.length} total`);
    
    let answered = 0;
    const batchSize = 5;
    
    for (let i = 0; i < mcqsNeedAnswers.length; i += batchSize) {
      const batch = mcqsNeedAnswers.slice(i, i + batchSize);
      
      for (const mcq of batch) {
        const answer = await extractCorrectAnswer(zai, mcq.sourceUrl);
        if (answer) {
          mcq.correctAnswer = answer;
          answered++;
          console.log(`  ✓ Answer: ${mcq.question.substring(0, 50)}... = ${answer}`);
        } else {
          console.log(`  ✗ No answer: ${mcq.question.substring(0, 50)}...`);
        }
        await delay(2000);
      }
      
      // Save progress
      fs.writeFileSync(MCQS_FILE, JSON.stringify(allMcqs, null, 2));
      console.log(`  Progress: ${answered}/${mcqsNeedAnswers.length} answers found`);
      
      if (i + batchSize < mcqsNeedAnswers.length) {
        await delay(3000);
      }
    }
    
    console.log(`\n=== Answers Complete ===`);
    console.log(`Found ${answered} answers out of ${mcqsNeedAnswers.length}`);
  }
  
  if (command === 'stats') {
    if (fs.existsSync(MCQS_FILE)) {
      const mcqs: MCQ[] = JSON.parse(fs.readFileSync(MCQS_FILE, 'utf-8'));
      console.log(`Total MCQs: ${mcqs.length}`);
      
      const withAnswers = mcqs.filter(m => m.correctAnswer).length;
      console.log(`With correct answers: ${withAnswers}`);
      console.log(`Without answers: ${mcqs.length - withAnswers}`);
      
      const byCategory: Record<string, number> = {};
      for (const mcq of mcqs) {
        byCategory[mcq.categoryName] = (byCategory[mcq.categoryName] || 0) + 1;
      }
      
      console.log('\nBy Category:');
      for (const [cat, count] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) {
        console.log(`  ${cat}: ${count}`);
      }
    } else {
      console.log('No MCQs data found. Run scrape first.');
    }
  }
}

main().catch(console.error);
