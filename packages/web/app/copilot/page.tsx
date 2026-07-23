'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Sparkles, Send, Bot, User, ArrowRight } from 'lucide-react';

export default function CopilotPage() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([
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
      const res = await fetch('http://localhost:3001/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToSend }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: data.answer || 'Query processed by ABOS AI.',
            data: data.data,
          },
        ]);
      } else {
        throw new Error('API request failed');
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'API server unreachable or returned empty database result. Ensure NestJS backend API is running on http://localhost:3001.',
          data: null,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-7">
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
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition"
              >
                <span>{sp}</span>
                <ArrowRight className="w-3 h-3 text-zinc-500" />
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto space-y-3 p-4 rounded-xl bg-zinc-950 border border-zinc-800/80">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex items-start space-x-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-xl p-3.5 rounded-2xl text-xs space-y-2 ${
                    m.sender === 'user'
                      ? 'bg-indigo-600 text-white font-medium rounded-tr-none'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-none'
                  }`}
                >
                  <p className="leading-relaxed">{m.text}</p>
                  {m.data && (
                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-indigo-300 space-y-1">
                      {Object.entries(m.data).map(([k, v]) => (
                        <div key={k} className="flex justify-between">
                          <span className="text-zinc-500 uppercase">{k}:</span>
                          <span className="font-semibold text-zinc-200">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {m.sender === 'user' && (
                  <div className="p-2 rounded-lg bg-zinc-800 text-zinc-300">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center space-x-2 text-xs text-indigo-400 animate-pulse">
                <Sparkles className="w-4 h-4" />
                <span>AI Copilot is querying live PostgreSQL database...</span>
              </div>
            )}
          </div>

          {/* Input box */}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Ask ABOS AI Copilot a question... (e.g. 'Show delayed tasks')"
              className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-xs px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500 transition"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
              onClick={() => handleSend()}
              className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition flex items-center space-x-1 text-xs font-semibold"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
