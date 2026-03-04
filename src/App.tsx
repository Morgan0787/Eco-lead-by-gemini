/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Leaf, Send, Database, Cpu, AlertTriangle } from 'lucide-react';
import { supabase } from './lib/supabase';

export default function App() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  useEffect(() => {
    async function checkSupabase() {
      try {
        const { data, error } = await supabase.from('health_check').select('*').limit(1);
        if (error) throw error;
        setDbStatus('connected');
      } catch (err) {
        console.error('Supabase check failed:', err);
        setDbStatus('error');
      }
    }
    checkSupabase();
  }, []);

  const handleGroqChat = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      setResponse(data.response || data.error);
    } catch (err) {
      setResponse('Error connecting to Groq API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans p-8">
      <header className="max-w-4xl mx-auto mb-12 flex items-center justify-between border-b border-stone-200 pb-6">
        <div className="flex items-center gap-3">
          <Leaf className="text-emerald-600 w-8 h-8" />
          <h1 className="text-3xl font-bold tracking-tight">Eco-Lead</h1>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${dbStatus === 'connected' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            <Database size={14} />
            {dbStatus === 'connected' ? 'Supabase Connected' : 'Supabase Offline'}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Vercel Analysis Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200"
        >
          <div className="flex items-center gap-2 mb-4 text-amber-600">
            <AlertTriangle size={20} />
            <h2 className="text-xl font-semibold">Vercel Build Analysis</h2>
          </div>
          <ul className="space-y-4 text-sm text-stone-600">
            <li className="flex gap-3">
              <span className="font-bold text-stone-900">1. better-sqlite3:</span>
              Native modules often fail to build on Vercel. SQLite is not persistent in serverless environments.
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-stone-900">2. Express Setup:</span>
              Vercel requires specific routing for Express. Use the `api/` directory for serverless functions.
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-stone-900">3. Env Vars:</span>
              Ensure SUPABASE_URL and GROQ_API_KEY are configured in Vercel's project settings.
            </li>
          </ul>
        </motion.section>

        {/* Groq Integration Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 flex flex-col"
        >
          <div className="flex items-center gap-2 mb-4 text-indigo-600">
            <Cpu size={20} />
            <h2 className="text-xl font-semibold">Groq AI Test</h2>
          </div>
          <div className="flex-1 mb-4 p-4 bg-stone-100 rounded-xl overflow-y-auto min-h-[150px] text-sm italic">
            {loading ? 'Thinking...' : response || 'Ask the AI something about sustainability...'}
          </div>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button 
              onClick={handleGroqChat}
              disabled={loading}
              className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </div>
        </motion.section>
      </main>

      <footer className="max-w-4xl mx-auto mt-12 pt-6 border-t border-stone-200 text-center text-stone-400 text-xs uppercase tracking-widest">
        Eco-Lead &copy; 2024 • Built with Supabase & Groq
      </footer>
    </div>
  );
}

