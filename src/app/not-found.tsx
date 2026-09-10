import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Home, Search, BookOpen } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-8xl font-bold text-[#007540]/20 mb-4">404</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
          <p className="text-gray-500 mb-6">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <Button className="bg-[#007540] hover:bg-[#005e33] w-full sm:w-auto">
                <Home className="h-4 w-4 mr-2" /> Go Home
              </Button>
            </Link>
            <Link href="/search">
              <Button variant="outline" className="w-full sm:w-auto">
                <Search className="h-4 w-4 mr-2" /> Search MCQs
              </Button>
            </Link>
          </div>
          <div className="mt-8 text-sm text-gray-400">
            <BookOpen className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>Browse our categories to find what you need</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
