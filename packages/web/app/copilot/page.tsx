'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api, ApiError } from '@/lib/api';
import { Sparkles, Send, Bot, User, ArrowRight } from 'lucide-react';

export default function CopilotPage() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<
    { sender: 'bot' | 'user'; text: string; data?: Record<string, unknown> | null }[]
  >([
    {
      sender: 'bot',
      text: 'ABOS AI Copilot & Control Tower connected to live PostgreSQL database. Ask any query about active projects, BOQ cost overruns, cash flow, or site tasks.',
      data: null,
    },
  ]);
  const [loading, setLoading] = useState(false);

  const samplePrompts = [
    'Show delayed tasks',
    'Which BOQ items have overruns?',
    'Forecast cash position',
    'Database overview',
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || prompt;
    if (!textToSend.trim()) return;

    setMessages((prev) => [...prev, { sender: 'user', text: textToSend, data: null }]);
    if (!queryText) setPrompt('');
    setLoading(true);

    try {
      const data = await api.post<{ answer?: string; data?: Record<string, unknown> }>('/ai/query', {
        prompt: textToSend,
      });
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: data.answer || 'Query processed by ABOS AI.',
          data: data.data,
        },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: e instanceof ApiError ? e.message : 'API server unreachable. Ensure NestJS backend is running.',
          data: null,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Control Tower & Copilot"
        description="Live Database Query Engine: Conversational AI intelligence across every operational module."
      />

      {/* Copilot Chat Interface */}
      <Card>
        <CardHeader
          title="Conversational Copilot Assistant"
          description="Type natural language questions or select sample queries below (Connected to Database)"
        />
        <CardBody className="space-y-4">
          {/* Sample Prompts */}
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((sp, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(sp)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-surface-2 border border-line hover:bg-surface text-ink text-xs transition uppercase font-semibold tracking-wider"
              >
                <span>{sp}</span>
                <ArrowRight className="w-3 h-3 text-ink-3" />
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto space-y-3 p-4 rounded-md bg-surface-2 border border-line">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex items-start space-x-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="p-2 rounded-md bg-brand text-brand-ink border border-brand">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-xl p-3.5 rounded-md text-xs space-y-2 border ${
                    m.sender === 'user'
                      ? 'bg-brand text-brand-ink border-brand font-semibold'
                      : 'bg-surface border-line text-ink'
                  }`}
                >
                  <p className="leading-relaxed">{m.text}</p>
                  {m.data && (
                    <div className="p-2.5 rounded-md bg-surface-2 border border-line text-[11px] font-mono text-ink space-y-1">
                      {Object.entries(m.data).map(([k, v]) => (
                        <div key={k} className="flex justify-between">
                          <span className="text-ink-3 uppercase">{k}:</span>
                          <span className="font-semibold text-ink">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {m.sender === 'user' && (
                  <div className="p-2 rounded-md bg-surface-2 border border-line text-ink">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center space-x-2 text-xs text-ink-2 animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Copilot is querying live PostgreSQL database...</span>
              </div>
            )}
          </div>

          {/* Input box */}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Ask ABOS AI Copilot a question... (e.g. 'Show delayed tasks')"
              className="flex-1 input"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button onClick={() => handleSend()}>
              <span>Send</span>
              <Send className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
