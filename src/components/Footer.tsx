'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-auto bg-[#007540] text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-bold">
                M
              </div>
              <h3 className="font-bold text-lg">MCQs Knowledge</h3>
            </div>
            <p className="text-white/80 text-sm leading-relaxed">
              Pakistan&apos;s largest MCQs website. Prepare for NTS, FPSC, PPSC, BPSC, SPSC, KPKPSC, AJKPSC tests with our comprehensive collection of multiple choice questions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li><Link href="/general_knowledge_mcqs" className="hover:text-white transition-colors">General Knowledge MCQs</Link></li>
              <li><Link href="/islamic-studies-mcqs" className="hover:text-white transition-colors">Islamic Studies MCQs</Link></li>
              <li><Link href="/pak-study-mcqs" className="hover:text-white transition-colors">Pak Study MCQs</Link></li>
              <li><Link href="/everyday-science-mcqs" className="hover:text-white transition-colors">Everyday Science MCQs</Link></li>
              <li><Link href="/computer-mcqs" className="hover:text-white transition-colors">Computer MCQs</Link></li>
              <li><Link href="/english-mcqs" className="hover:text-white transition-colors">English MCQs</Link></li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="font-bold text-lg mb-3">Features</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li>✅ 37+ Subject Categories</li>
              <li>✅ Online Quiz System</li>
              <li>✅ Instant Answer Reveal</li>
              <li>✅ AI-Powered Answers</li>
              <li>✅ Search MCQs</li>
              <li>✅ Mobile Responsive</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/20 text-center text-sm text-white/60">
          <p>© 2024 MCQs Knowledge. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
