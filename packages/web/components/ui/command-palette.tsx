"use client";

import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Command, Building, FileText, DollarSign, Hammer, CheckSquare, Shield, Users, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const commands = [
    { title: 'Owner Command Center', category: 'Navigation', path: '/', icon: Building },
    { title: 'Construction & Gantt Charts', category: 'Navigation', path: '/construction', icon: Hammer },
    { title: 'BOQ Management', category: 'Navigation', path: '/boq', icon: FileText },
    { title: 'FinOS Banking & Treasury', category: 'Navigation', path: '/finos', icon: DollarSign },
    { title: 'Quality Control & Snagging', category: 'Navigation', path: '/quality', icon: CheckSquare },
    { title: 'Legal & RERA Compliance', category: 'Navigation', path: '/legal', icon: Shield },
    { title: 'Role Workspaces (24 Roles)', category: 'Workspaces', path: '/workspaces', icon: Users },
    { title: 'Ask AI Copilot...', category: 'AI Intelligence', path: '/copilot', icon: Sparkles },
  ];

  const filtered = commands.filter(
    (c) => c.title.toLowerCase().includes(query.toLowerCase()) || c.category.toLowerCase().includes(query.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-24 p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-surface border border-line rounded-lg shadow-lift overflow-hidden flex flex-col">
        {/* Input */}
        <div className="flex items-center px-4 py-3 border-b border-line bg-surface-2">
          <Search className="w-4 h-4 text-ink-2 mr-3" />
          <input
            type="text"
            placeholder="Type a command, search modules, or ask AI... (⌘K)"
            className="w-full bg-transparent text-ink placeholder-ink-3 text-xs focus:outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-ink-3 bg-surface border border-line rounded-md">
            ESC
          </kbd>
        </div>

        {/* Command List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-ink-3">No matching commands or actions.</div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setIsOpen(false);
                    router.push(item.path);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-surface-2 text-ink text-xs transition group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 rounded-md bg-surface-2 text-ink group-hover:bg-brand group-hover:text-brand-ink transition">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold uppercase tracking-wider text-xs text-ink">{item.title}</div>
                      <div className="text-[10px] text-ink-3">{item.category}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-ink-3 group-hover:text-ink transition" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-surface-2 border-t border-line flex items-center justify-between text-[11px] text-ink-3">
          <div className="flex items-center space-x-1.5">
            <Command className="w-3 h-3 text-ink-2" />
            <span className="font-semibold uppercase tracking-wider">ABOS Command Palette</span>
          </div>
          <span>Use ↑↓ to navigate, ENTER to select</span>
        </div>
      </div>
    </div>
  );
}
