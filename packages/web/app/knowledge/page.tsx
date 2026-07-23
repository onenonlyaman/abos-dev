'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Stat } from '@/components/ui/stat';
import { EmptyState } from '@/components/ui/empty-state';
import { Disclosure } from '@/components/ui/disclosure';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Select } from '@/components/ui/select';
import { api, ApiError } from '@/lib/api';
import { BookOpen, Search, Eye, PlusCircle, User, FileText } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  category: string;
  content: string;
  author: string;
  views: number;
  createdAt: string;
}

export default function KnowledgeBasePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [err, setErr] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Booking & Payments');
  const [content, setContent] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchQuery) params.append('query', searchQuery);

      const data = await api.get<Article[]>(`/knowledge/articles?${params.toString()}`);
      setArticles(data);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Failed to load Knowledge Base articles');
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreateArticle = async () => {
    if (!title || !content) return;
    setBusy(true);
    try {
      await api.post('/knowledge/articles', {
        title,
        category,
        content,
      });
      setTitle('');
      setContent('');
      await load();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Failed to publish Knowledge Base article');
    } finally {
      setBusy(false);
    }
  };

  const handleSelectArticle = async (article: Article) => {
    setSelectedArticle(article);
    try {
      const updated = await api.get<Article>(`/knowledge/articles/${article.id}`);
      if (updated) {
        setArticles((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
        setSelectedArticle(updated);
      }
    } catch (e) {
      // Ignore background counter increment error
    }
  };

  const totalViews = articles.reduce((acc, a) => acc + Number(a.views), 0);

  return (
    <div className="space-y-7">
      <PageHeader
        title="Knowledge Base & Public Wiki Portal"
        description="Self-service documentation wiki, homebuyer FAQs, construction guides, and RERA compliance documentation."
      />

      {err && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">{err}</div>}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={BookOpen} tone="brand" value={String(articles.length)} label="Published Articles" sub="Wiki documentation" />
        <Stat icon={Eye} tone="green" value={String(totalViews)} label="Total Article Views" sub="Self-service hits" />
        <Stat icon={FileText} tone="blue" value="Active" label="Search Index" sub="Instant article lookup" />
        <Stat icon={User} tone="amber" value="Support Team" label="Verified Authors" sub="Curated content" />
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
          <input
            type="text"
            placeholder="Search knowledge base articles..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:border-zinc-600 text-zinc-100 placeholder-zinc-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:border-zinc-600 text-zinc-100"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="Booking & Payments">Booking & Payments</option>
          <option value="Construction FAQ">Construction FAQ</option>
          <option value="RERA Compliance">RERA Compliance</option>
          <option value="Handover & Possession">Handover & Possession</option>
        </select>
      </div>

      {/* Action Panel */}
      <Disclosure title="Publish New Knowledge Base Article">
        <div className="space-y-3">
          <Field label="Article Title" placeholder="e.g. How to track your construction milestone payment status online" value={title} onChange={(e) => setTitle(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="Booking & Payments">Booking & Payments</option>
              <option value="Construction FAQ">Construction FAQ</option>
              <option value="RERA Compliance">RERA Compliance</option>
              <option value="Handover & Possession">Handover & Possession</option>
            </Select>
            <Field label="Author" placeholder="Support Team" disabled value="Support Team" />
          </div>
          <Field label="Article Content (Markdown supported)" placeholder="Provide detailed steps, guidelines, and FAQs..." value={content} onChange={(e) => setContent(e.target.value)} />
          <Button size="sm" className="w-full" disabled={busy || !title || !content} onClick={handleCreateArticle}>
            <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Publish Article
          </Button>
        </div>
      </Disclosure>

      {/* Articles Grid & Reader */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader title="Knowledge Directory" description="Click an article to read" />
          <CardBody className="space-y-2 max-h-[500px] overflow-y-auto">
            {articles.length === 0 ? (
              <EmptyState icon={BookOpen} title="No articles found" description="Publish an article using the panel above." />
            ) : (
              articles.map((a) => (
                <div
                  key={a.id}
                  onClick={() => handleSelectArticle(a)}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    selectedArticle?.id === a.id
                      ? 'bg-indigo-500/10 border-indigo-500/30'
                      : 'bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Badge tone="blue">{a.category}</Badge>
                    <span className="text-[10px] text-zinc-500 font-mono flex items-center space-x-1">
                      <Eye className="w-3 h-3 mr-0.5 inline" /> {a.views} views
                    </span>
                  </div>
                  <div className="font-semibold text-xs text-zinc-100 mt-2 line-clamp-1">{a.title}</div>
                </div>
              ))
            )}
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title={selectedArticle ? selectedArticle.title : 'Article Reader'} description={selectedArticle ? `Category: ${selectedArticle.category} • Author: ${selectedArticle.author}` : 'Select an article from the directory to view details'} />
          <CardBody>
            {selectedArticle ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap font-sans">
                  {selectedArticle.content}
                </div>
                <div className="text-[11px] text-zinc-500 flex items-center justify-between pt-2 border-t border-zinc-800">
                  <span>Published on {new Date(selectedArticle.createdAt).toLocaleDateString()}</span>
                  <span>{selectedArticle.views} Total Views</span>
                </div>
              </div>
            ) : (
              <EmptyState icon={BookOpen} title="No article selected" description="Select any knowledge article from the directory list on the left to read." />
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
