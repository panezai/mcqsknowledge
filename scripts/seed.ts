import { db } from '../src/lib/db';
import * as fs from 'fs';
import * as path from 'path';

interface ScrapedMcq {
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

const CATEGORIES = [
  { name: "General Knowledge", slug: "general_knowledge_mcqs", description: "General Knowledge MCQs for NTS, FPSC, PPSC Tests", icon: "🌍", order: 1 },
  { name: "Pakistan Current Affairs", slug: "pakistan-current-affairs-mcqs", description: "Pakistan Current Affairs MCQs", icon: "🇵🇰", order: 2 },
  { name: "World Current Affairs", slug: "world-current-affairs-mcqs", description: "World Current Affairs MCQs", icon: "🌐", order: 3 },
  { name: "Pak Study", slug: "pak-study-mcqs", description: "Pakistan Studies MCQs", icon: "🇵🇰", order: 4 },
  { name: "Islamic Studies", slug: "islamic-studies-mcqs", description: "Islamic Studies MCQs", icon: "🕌", order: 5 },
  { name: "Everyday Science", slug: "everyday-science-mcqs", description: "Everyday Science MCQs", icon: "🔬", order: 6 },
  { name: "English", slug: "english-mcqs", description: "English MCQs", icon: "📝", order: 7 },
  { name: "Mathematics", slug: "mathematics-mcqs", description: "Mathematics MCQs", icon: "🔢", order: 8 },
  { name: "Computer", slug: "computer-mcqs", description: "Computer MCQs", icon: "💻", order: 9 },
  { name: "Pedagogy", slug: "pedagogy-mcqs", description: "Pedagogy MCQs", icon: "🎓", order: 10 },
  { name: "Physics", slug: "physics-mcqs", description: "Physics MCQs", icon: "⚛️", order: 11 },
  { name: "Chemistry", slug: "chemistry-mcqs", description: "Chemistry MCQs", icon: "🧪", order: 12 },
  { name: "Biology", slug: "biology-mcqs", description: "Biology MCQs", icon: "🧬", order: 13 },
  { name: "URDU", slug: "urdu-general-knowledge", description: "URDU General Knowledge MCQs", icon: "📖", order: 14 },
  { name: "Psychology", slug: "psychology-mcqs", description: "Psychology MCQs", icon: "🧠", order: 15 },
  { name: "Agriculture", slug: "agriculture-mcqs", description: "Agriculture MCQs", icon: "🌾", order: 16 },
  { name: "Forestry", slug: "forestry-mcqs", description: "Forestry MCQs", icon: "🌲", order: 17 },
  { name: "Economics", slug: "economics-mcqs", description: "Economics MCQs", icon: "📊", order: 18 },
  { name: "Sociology", slug: "sociology-mcqs", description: "Sociology MCQs", icon: "👥", order: 19 },
  { name: "Political Science", slug: "political-science-mcqs", description: "Political Science MCQs", icon: "🏛️", order: 20 },
  { name: "Statistics", slug: "statistics-mcqs", description: "Statistics MCQs", icon: "📈", order: 21 },
  { name: "English Literature", slug: "english-literature-mcqs", description: "English Literature MCQs", icon: "📚", order: 22 },
  { name: "Judiciary And Law", slug: "judiciary-and-law-mcqs", description: "Judiciary And Law MCQs", icon: "⚖️", order: 23 },
  { name: "International Relations", slug: "international-relations", description: "International Relations MCQs", icon: "🤝", order: 24 },
  { name: "Physical Education", slug: "physical-education", description: "Physical Education MCQs", icon: "🏃", order: 25 },
  { name: "Finance", slug: "finance-mcqs", description: "Finance MCQs", icon: "💰", order: 26 },
  { name: "HRM", slug: "hrm-mcqs", description: "Human Resource Management MCQs", icon: "👔", order: 27 },
  { name: "Marketing", slug: "marketing-mcqs", description: "Marketing MCQs", icon: "📣", order: 28 },
  { name: "Accounting", slug: "accounting-mcqs", description: "Accounting MCQs", icon: "📒", order: 29 },
  { name: "Auditing", slug: "auditing-mcqs", description: "Auditing MCQs", icon: "🔍", order: 30 },
  { name: "Electrical Engineering", slug: "electrical-engineering-mcqs", description: "Electrical Engineering MCQs", icon: "⚡", order: 31 },
  { name: "Civil Engineering", slug: "civil-engineering-mcqs", description: "Civil Engineering MCQs", icon: "🏗️", order: 32 },
  { name: "Mechanical Engineering", slug: "mechanical-engineering-mcqs", description: "Mechanical Engineering MCQs", icon: "⚙️", order: 33 },
  { name: "Chemical Engineering", slug: "chemical-engineering", description: "Chemical Engineering MCQs", icon: "🏭", order: 34 },
  { name: "Software Engineering", slug: "software-engineering-mcqs", description: "Software Engineering MCQs", icon: "💿", order: 35 },
  { name: "Medical", slug: "medical-mcqs", description: "Medical MCQs", icon: "🏥", order: 36 },
  { name: "Past Papers", slug: "past-papers", description: "Past Papers MCQs", icon: "📋", order: 37 },
];

async function main() {
  console.log('Seeding database...');

  // Create categories
  console.log('Creating categories...');
  for (const cat of CATEGORIES) {
    await db.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, icon: cat.icon, order: cat.order },
      create: cat
    });
  }
  console.log(`Created ${CATEGORIES.length} categories`);

  // Load scraped MCQs
  const mcqsPath = path.join(process.cwd(), 'scraper-data', 'mcqs.json');
  if (!fs.existsSync(mcqsPath)) {
    console.log('No MCQs data found. Skipping MCQ import.');
    return;
  }

  const mcqs: ScrapedMcq[] = JSON.parse(fs.readFileSync(mcqsPath, 'utf-8'));
  console.log(`Found ${mcqs.length} MCQs to import`);

  const validSlugs = new Set(CATEGORIES.map(c => c.slug));
  const validMcqs = mcqs.filter(m => validSlugs.has(m.categorySlug));

  // Get existing MCQs to avoid duplicates
  const existing = await db.mcq.findMany({ select: { question: true, categorySlug: true } });
  const existingSet = new Set(existing.map(m => `${m.question}|${m.categorySlug}`));

  const newMcqs = validMcqs.filter(m => !existingSet.has(`${m.question}|${m.categorySlug}`));

  console.log(`New MCQs to insert: ${newMcqs.length}`);

  // Insert in batches
  const batchSize = 20;
  for (let i = 0; i < newMcqs.length; i += batchSize) {
    const batch = newMcqs.slice(i, i + batchSize);
    for (const m of batch) {
      try {
        await db.mcq.create({
          data: {
            question: m.question,
            optionA: m.optionA,
            optionB: m.optionB,
            optionC: m.optionC,
            optionD: m.optionD,
            correctAnswer: m.correctAnswer || '',
            categorySlug: m.categorySlug,
            sourceUrl: m.sourceUrl,
            submittedBy: m.submittedBy,
          }
        });
      } catch (e) {
        // Skip duplicates silently
      }
    }
    console.log(`  Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(newMcqs.length / batchSize)}`);
  }

  // Stats
  const totalMcqs = await db.mcq.count();
  const totalCategories = await db.category.count();
  console.log(`\nDone! Total: ${totalCategories} categories, ${totalMcqs} MCQs`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
