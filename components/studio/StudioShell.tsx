'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import {
  Activity,
  AudioLines,
  BookOpen,
  Clapperboard,
  FileText,
  Film,
  Grid2x2,
  Layers,
  LayoutDashboard,
  Menu,
  PlayCircle,
  Settings,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';

interface NavGroup {
  label: string;
  items: Array<{
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    matchPrefix?: string;
  }>;
}

const SIDEBAR_GROUPS: NavGroup[] = [
  {
    label: 'Production',
    items: [
      { href: '/', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/script-studio', label: 'Script Studio', icon: FileText },
      { href: '/ai-director', label: 'AI Director', icon: Sparkles },
      { href: '/storyboard', label: 'Storyboard', icon: Clapperboard, matchPrefix: '/projects/' },
    ],
  },
  {
    label: 'Reference Lab',
    items: [
      { href: '/reference-analyzer', label: 'Reference Analyzer', icon: Activity },
      { href: '/frame-explorer', label: 'Frame Explorer', icon: Grid2x2 },
      { href: '/audio-studio', label: 'Audio & SFX Studio', icon: AudioLines },
    ],
  },
  {
    label: 'Creative Engine',
    items: [
      { href: '/scene-builder', label: 'Scene Builder', icon: Layers },
      { href: '/animation-studio', label: 'Animation Studio', icon: PlayCircle },
    ],
  },
  {
    label: 'Output & Governance',
    items: [
      { href: '/rendering', label: 'Final Rendering', icon: Film },
      { href: '/quality-control', label: 'Quality Control', icon: ShieldCheck },
      { href: '/reports', label: 'Reports & Provenance', icon: BookOpen },
      { href: '/settings', label: 'Settings & GitHub', icon: Settings },
    ],
  },
];

const TOP_NAV_LINKS = [
  { href: '/', label: 'Dashboard' },
  { href: '/reference-analyzer', label: 'Reference Lab' },
  { href: '/script-studio', label: 'Script & Director' },
  { href: '/scene-builder', label: 'Scene Engine' },
  { href: '/rendering', label: 'Render & QA' },
];

export function StudioShell({
  title,
  subtitle,
  primaryAction,
  children,
}: {
  title: string;
  subtitle?: string;
  primaryAction?: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href: string, matchPrefix?: string) => {
    if (href === '/') return pathname === '/' || pathname === '/dashboard';
    if (pathname === href) return true;
    if (matchPrefix && pathname.startsWith(matchPrefix)) return true;
    return false;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-slate-900">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 lg:px-6 h-14 flex items-center justify-between gap-8">
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="lg:hidden p-2 -ml-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Link
            href="/"
            className="text-base font-bold tracking-tight text-[#041664] whitespace-nowrap shrink-0"
          >
            Onyo Alap Studio
          </Link>
        </div>

        <nav
          aria-label="Primary sections"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
        >
          {TOP_NAV_LINKS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap shrink-0 transition-colors pb-0.5 ${
                  active
                    ? 'text-[#16339B] border-b-2 border-[#16339B]'
                    : 'hover:text-slate-900'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center shrink-0">
          <Link
            href="/script-studio"
            className="px-4 py-2 text-xs font-semibold text-white bg-[#16339B] rounded-lg hover:bg-[#0A2A9F] transition-colors whitespace-nowrap shrink-0"
          >
            New Production
          </Link>
        </div>
      </header>

      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Desktop Sidebar */}
        <aside
          aria-label="Studio workspace navigation"
          className="hidden lg:block w-60 shrink-0 bg-white border-r border-slate-200 px-3 py-5"
        >
          <div className="space-y-6">
            {SIDEBAR_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="px-3 mb-2 text-[11px] font-semibold text-slate-400 tracking-wide">
                  {group.label}
                </p>
                <ul className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href, item.matchPrefix);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                            active
                              ? 'bg-slate-100 text-[#16339B]'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/40"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <nav className="relative z-10 w-64 max-w-[80vw] bg-white h-full border-r border-slate-200 p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
                <span className="font-bold text-sm text-[#041664]">Workspace Menu</span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                  className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-5">
                {SIDEBAR_GROUPS.map((group) => (
                  <div key={group.label}>
                    <p className="px-2 mb-1.5 text-[11px] font-semibold text-slate-400">
                      {group.label}
                    </p>
                    <ul className="space-y-1">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href, item.matchPrefix);
                        return (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-medium ${
                                active
                                  ? 'bg-slate-100 text-[#16339B]'
                                  : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <Icon className="w-4 h-4 shrink-0" />
                              <span>{item.label}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </nav>
          </div>
        )}

        {/* Main Workspace Canvas */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 mb-6 border-b border-slate-200">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-1.5 text-sm text-slate-600 max-w-3xl">
                  {subtitle}
                </p>
              )}
            </div>
            {primaryAction && <div className="shrink-0">{primaryAction}</div>}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
