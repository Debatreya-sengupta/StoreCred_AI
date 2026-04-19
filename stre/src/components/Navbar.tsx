"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Store, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Home' },
    { href: '/#how-it-works', label: 'How It Works' },
    { href: '/underwriter', label: 'Underwriter View' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-slate-900 hover:opacity-80 transition">
          <div className="bg-emerald-600 p-1.5 rounded-lg">
            <Store className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">StoreCred AI</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-emerald-600",
                pathname === link.href ? "text-emerald-600" : "text-slate-600"
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/assess"
            className="flex items-center gap-1 text-sm font-semibold bg-slate-900 text-white px-4 py-2 rounded-full hover:bg-slate-800 transition shadow-sm"
          >
            Run Demo Assessment
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </nav>
  );
}
