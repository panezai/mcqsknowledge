import { db } from '../src/lib/db';

const POSTS_ENDPOINT = 'https://pakmcqs.com/wp-json/wp/v2/posts';

const EMPTY_CATEGORIES: Record<number, { slug: string; name: string }> = {
  166: { slug: "URDU_MCQs", name: "URDU" },
  1025: { slug: "Forestry_MCQs", name: "Forestry" },
  76: { slug: "Statistics_MCQs", name: "Statistics" },
  521: { slug: "English_Literature_MCQs", name: "English Literature" },
  109: { slug: "Judiciary_And_Law_MCQs", name: "Judiciary And Law" },
  982: { slug: "International_Relations_MCQs", name: "International Relations" },
  1066: { slug: "Physical_Education_MCQs", name: "Physical Education" },
  53: { slug: "HRM_MCQs", name: "HRM" },
  80: { slug: "Auditing_MCQs", name: "Auditing" },
  111: { slug: "Electrical_Engineering_MCQs", name: "Electrical Engineering" },
  240: { slug: "Civil_Engineering_MCQs", name: "Civil Engineering" },
  285: { slug: "Mechanical_Engineering_MCQs", name: "Mechanical Engineering" },
  320: { slug: "Chemical_Engineering_MCQs", name: "Chemical Engineering" },
  304: { slug: "Software_Engineering_MCQs", name: "Software Engineering" },
  740: { slug: "Medical_MCQs", name: "Medical" },
  1064: { slug: "Past_Papers_MCQs", name: "Past Papers" },
};

function cleanHtml(html: string): string {
  return html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n').replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#8217;/g, "'").replace(/&#8216;/g, "'").replace(/&#8220;/g, '"').replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '-').replace(/&#038;/g, '&').replace(/&#8230;/g, '...').replace(/\s+/g, ' ').trim();
}

function decodeTitle(t: string) {
  return t.replace(/&#8217;/g, "'").replace(/&#8216;/g, "'").replace(/&#8220;/g, '"').replace(/&#8221;/g, '"').replace(/&#8211;/g, '-').replace(/&#038;/g, '&').replace(/&#8230;/g, '...').trim();
}

function parseMcq(html: string, title: string, url: string) {
  const text = cleanHtml(html);
  const options: Record<string, string> = {};
  const re = /\b([A-D])[\.\)]\s*((?:(?!\b[A-D][\.\)]\s).)+)/gi;
  let m;
  while ((m = re.exec(text)) !== null) {
    const l = m[1].toUpperCase();
    const t = m[2].trim();
    if (t.length > 0 && t.length < 500) options[l] = t;
  }
  if (Object.keys(options).length < 3) return null;
  const question = decodeTitle(title);
  if (!question || question.length < 5) return null;
  
  let correctAnswer = '';
  for (const p of [/correct\s*answer\s*[:\-]?\s*(?:option\s*)?([A-D])/i, /answer\s*[:\-]?\s*(?:is\s*)?(?:option\s*)?([A-D])[\.\)]/i]) {
    const a = text.match(p);
    if (a && options[a[1].toUpperCase()]) { correctAnswer = options[a[1].toUpperCase()]; break; }
  }
  
  let submittedBy = '';
  const s = text.match(/submitted\s+by\s*[:\-]?\s*([^\n,.]+)/i);
  if (s) submittedBy = s[1].trim().substring(0, 100);
  
  return { question, optionA: options.A||'', optionB: options.B||'', optionC: options.C||'N/A', optionD: options.D||'N/A', correctAnswer, sourceUrl: url, submittedBy };
}

async function main() {
  const existing = await db.mcq.findMany({ select: { question: true, categorySlug: true } });
  const existingSet = new Set(existing.map(m => m.question + '|' + m.categorySlug));
  let total = 0;
  
  for (const [id, cat] of Object.entries(EMPTY_CATEGORIES)) {
    console.log(`Scraping ${cat.name}...`);
    for (let page = 1; page <= 5; page++) {
      try {
        const res = await fetch(`${POSTS_ENDPOINT}?categories=${id}&per_page=20&page=${page}&_fields=id,title,content,categories,slug,link`, { signal: AbortSignal.timeout(10000) });
        if (!res.ok) break;
        const posts = await res.json();
        if (!posts.length) break;
        for (const post of posts) {
          const mcq = parseMcq(post.content.rendered, post.title.rendered, post.link);
          if (!mcq || !mcq.optionA || !mcq.optionB) continue;
          const key = mcq.question + '|' + cat.slug;
          if (existingSet.has(key)) continue;
          try {
            await db.mcq.create({ data: { ...mcq, categorySlug: cat.slug } });
            existingSet.add(key);
            total++;
          } catch (e: any) { if (e?.code !== 'P2002') console.error(e.message?.substring(0,60)); }
        }
        await new Promise(r => setTimeout(r, 500));
      } catch (e: any) { console.error(`Page ${page} error: ${e.message?.substring(0,40)}`); break; }
    }
    console.log(`  ${cat.name}: done`);
  }
  
  const final = await db.mcq.count();
  console.log(`\nAdded ${total} MCQs. Total: ${final}`);
}

main().catch(console.error).finally(() => db.$disconnect());
