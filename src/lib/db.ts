import { dbData } from '@/data/dbData';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Mcq {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  categorySlug: string;
  sourceUrl: string;
  submittedBy: string;
  difficulty: string;
  createdAt: string;
  updatedAt: string;
}

let categoriesData: Category[] = [...(dbData.categories as Category[])];
let mcqsData: Mcq[] = [...(dbData.mcqs as Mcq[])];

function matchesWhere(item: any, where: any): boolean {
  if (!where) return true;
  for (const key of Object.keys(where)) {
    if (key === 'OR' && Array.isArray(where.OR)) {
      const matchesOr = where.OR.some((subWhere: any) => matchesWhere(item, subWhere));
      if (!matchesOr) return false;
      continue;
    }
    if (key === 'AND' && Array.isArray(where.AND)) {
      const matchesAnd = where.AND.every((subWhere: any) => matchesWhere(item, subWhere));
      if (!matchesAnd) return false;
      continue;
    }
    const val = where[key];
    const itemVal = item[key];

    if (val && typeof val === 'object') {
      if ('contains' in val) {
        const needle = String(val.contains).toLowerCase();
        const haystack = String(itemVal || '').toLowerCase();
        if (!haystack.includes(needle)) return false;
      } else if ('in' in val && Array.isArray(val.in)) {
        if (!val.in.includes(itemVal)) return false;
      }
    } else {
      if (itemVal !== val) return false;
    }
  }
  return true;
}

export const db: any = {
  category: {
    findMany: async (args: any = {}) => {
      let list = categoriesData.filter(c => matchesWhere(c, args.where));
      if (args.orderBy) {
        if (args.orderBy.order) {
          list.sort((a, b) => args.orderBy.order === 'desc' ? b.order - a.order : a.order - b.order);
        }
      }
      if (args.skip) list = list.slice(args.skip);
      if (args.take) list = list.slice(0, args.take);

      return list.map(cat => {
        const mcqCount = mcqsData.filter(m => m.categorySlug === cat.slug).length;
        const res: any = { ...cat };
        if (args.include?._count) {
          res._count = { mcqs: mcqCount };
        }
        return res;
      });
    },
    findUnique: async (args: any) => {
      const cat = categoriesData.find(c => matchesWhere(c, args.where));
      if (!cat) return null;
      const res: any = { ...cat };
      if (args.include?._count) {
        const mcqCount = mcqsData.filter(m => m.categorySlug === cat.slug).length;
        res._count = { mcqs: mcqCount };
      }
      return res;
    },
    count: async (args: any = {}) => {
      return categoriesData.filter(c => matchesWhere(c, args.where)).length;
    }
  },
  mcq: {
    findMany: async (args: any = {}) => {
      let list = mcqsData.filter(m => matchesWhere(m, args.where));

      if (args.orderBy) {
        if (args.orderBy.createdAt) {
          list.sort((a, b) => args.orderBy.createdAt === 'desc'
            ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        }
      }

      if (args.skip) list = list.slice(args.skip);
      if (args.take) list = list.slice(0, args.take);

      return list.map(mcq => {
        const res: any = { ...mcq };
        if (args.include?.category) {
          const cat = categoriesData.find(c => c.slug === mcq.categorySlug);
          res.category = cat ? { name: cat.name, slug: cat.slug, icon: cat.icon } : { name: '', slug: mcq.categorySlug, icon: '📚' };
        }
        return res;
      });
    },
    findUnique: async (args: any) => {
      const mcq = mcqsData.find(m => matchesWhere(m, args.where));
      if (!mcq) return null;
      const res: any = { ...mcq };
      if (args.include?.category) {
        const cat = categoriesData.find(c => c.slug === mcq.categorySlug);
        res.category = cat ? { name: cat.name, slug: cat.slug, icon: cat.icon } : { name: '', slug: mcq.categorySlug, icon: '📚' };
      }
      return res;
    },
    count: async (args: any = {}) => {
      return mcqsData.filter(m => matchesWhere(m, args.where)).length;
    },
    update: async (args: any) => {
      const index = mcqsData.findIndex(m => matchesWhere(m, args.where));
      if (index !== -1) {
        mcqsData[index] = { ...mcqsData[index], ...args.data };
        return mcqsData[index];
      }
      return null;
    }
  },
  $disconnect: async () => {}
};