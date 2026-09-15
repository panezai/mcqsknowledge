import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { mcqs: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: categories.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        order: cat.order,
        mcqCount: cat._count?.mcqs || 0
      }))
    });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch categories',
      details: error?.message || String(error)
    }, { status: 500 });
  }
}
