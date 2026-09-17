'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CategoryCardProps {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  mcqCount: number;
}

export function CategoryCard({ name, slug, description, icon, mcqCount }: CategoryCardProps) {
  return (
    <Link href={`/${slug}`}>
      <Card className="cursor-pointer hover:shadow-md hover:border-[#007540]/30 transition-all duration-200 group h-full rounded-xl border-gray-200/80" suppressHydrationWarning>
        <CardContent className="p-2.5 sm:p-4" suppressHydrationWarning>
          <div className="flex items-start gap-2 sm:gap-3" suppressHydrationWarning>
            <div className="text-2xl sm:text-3xl shrink-0 group-hover:scale-110 transition-transform duration-200" suppressHydrationWarning>
              <span>{icon}</span>
            </div>
            <div className="min-w-0 flex-1" suppressHydrationWarning>
              <h3 className="font-semibold text-xs sm:text-sm text-gray-900 group-hover:text-[#007540] transition-colors line-clamp-1 leading-tight">
                {name}
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 line-clamp-1 sm:line-clamp-2 leading-tight">{description}</p>
              <Badge variant="secondary" className="mt-1.5 text-[10px] sm:text-xs bg-[#007540]/10 text-[#007540] hover:bg-[#007540]/20 py-0.5 px-1.5 font-medium">
                {mcqCount} MCQs
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
