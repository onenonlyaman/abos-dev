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
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-start justify-center pt-24 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-zinc-800 bg-zinc-950/50">
          <Search className="w-5 h-5 text-zinc-400 mr-3" />
          <input
            type="text"
            placeholder="Type a command, search modules, or ask AI... (⌘K)"
            className="w-full bg-transparent text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-zinc-400 bg-zinc-800 border border-zinc-700 rounded-md">
            ESC
          </kbd>
        </div>

        {/* Command List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-sm text-zinc-500">No matching commands or actions.</div>
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
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-zinc-800/80 text-zinc-200 text-sm transition group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-zinc-800 group-hover:bg-zinc-700 text-zinc-300">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-zinc-100">{item.title}</div>
                      <div className="text-xs text-zinc-500">{item.category}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-zinc-950 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center space-x-2">
            <Command className="w-3.5 h-3.5 text-zinc-400" />
            <span>ABOS Command Palette</span>
          </div>
          <span>Use ↑↓ to navigate, ENTER to select</span>
        </div>
      </div>
    </div>
  );
}
