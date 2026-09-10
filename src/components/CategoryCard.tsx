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
      <Card className="cursor-pointer hover:shadow-lg hover:border-[#007540]/30 transition-all duration-200 group h-full">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="text-3xl shrink-0 group-hover:scale-110 transition-transform duration-200">
              {icon}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm text-gray-900 group-hover:text-[#007540] transition-colors line-clamp-1">
                {name}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{description}</p>
              <Badge variant="secondary" className="mt-2 text-xs bg-[#007540]/10 text-[#007540] hover:bg-[#007540]/20">
                {mcqCount} MCQs
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
