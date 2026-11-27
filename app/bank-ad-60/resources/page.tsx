'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  FolderArchive,
  Plus,
  Search,
  ExternalLink,
  BookOpen,
  FileText,
  Globe,
  Newspaper,
  CheckCircle2,
  Trash2,
  X,
  Bookmark,
} from 'lucide-react';
import { toast } from 'sonner';

interface ResourceItem {
  _id: string;
  resourceId: string;
  subject: string;
  title: string;
  type: string;
  url: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Active' | 'Completed' | 'Bookmarked';
  notes: string;
  isSystem: boolean;
}

export default function BankAdResourcesPage() {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Add Custom Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formSubject, setFormSubject] = useState('Banking & GK');
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState('Website');
  const [formUrl, setFormUrl] = useState('');
  const [formPriority, setFormPriority] = useState('High');
  const [formNotes, setFormNotes] = useState('');

  const fetchResources = async () => {
    try {
      const res = await fetch('/api/bank-ad/resources');
      const data = await res.json();
      setResources(data.resources || []);
    } catch {
      toast.error('রিসোর্স ভল্ট লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formSubject) {
      toast.error('শিরোনাম ও বিষয় পূরণ করুন');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/bank-ad/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: formSubject,
          title: formTitle,
          type: formType,
          url: formUrl,
          priority: formPriority,
          notes: formNotes,
        }),
      });

      if (res.ok) {
        toast.success('কাস্টম রিসোর্স সফলভাবে যোগ হয়েছে!');
        setModalOpen(false);
        setFormTitle('');
        setFormUrl('');
        setFormNotes('');
        fetchResources();
      } else {
        const err = await res.json();
        toast.error(err.error || 'সংরক্ষণ ব্যর্থ হয়েছে');
      }
    } catch {
      toast.error('সংরক্ষণ ব্যর্থ হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Active' ? 'Completed' : currentStatus === 'Completed' ? 'Bookmarked' : 'Active';
    try {
      setResources((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: nextStatus as any } : r))
      );
      await fetch('/api/bank-ad/resources', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: nextStatus }),
      });
      toast.success(`স্ট্যাটাস: ${nextStatus}`);
    } catch {
      fetchResources();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('আপনি কি এই কাস্টম রিসোর্স মুছে ফেলতে চান?')) return;
    try {
      setResources((prev) => prev.filter((r) => r._id !== id));
      await fetch(`/api/bank-ad/resources?id=${id}`, { method: 'DELETE' });
      toast.success('মুছে ফেলা হয়েছে');
    } catch {
      fetchResources();
    }
  };

  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      if (selectedSubject !== 'All' && r.subject !== selectedSubject) return false;
      if (selectedType !== 'All' && r.type !== selectedType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = r.title.toLowerCase().includes(q);
        const inNotes = (r.notes || '').toLowerCase().includes(q);
        if (!inTitle && !inNotes) return false;
      }
      return true;
    });
  }, [resources, selectedSubject, selectedType, searchQuery]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return <FileText className="w-4 h-4 text-rose-400" />;
      case 'Book':
        return <BookOpen className="w-4 h-4 text-amber-400" />;
      case 'Newspaper':
        return <Newspaper className="w-4 h-4 text-blue-400" />;
      default:
        return <Globe className="w-4 h-4 text-emerald-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-400">রিসোর্স ভল্ট লোড হচ্ছে…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>পরীক্ষার রিসোর্স ও বুক ভল্ট</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                অফিসিয়াল ও স্ট্যান্ডার্ড
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              বাংলাদেশ ব্যাংক ২০২৬ প্রস্তুতিমূলক অফিসিয়াল MPS লিংক, সেরা বইয়ের রেফারেন্স এবং আপনার নিজস্ব নোট বা ভিডিও যুক্ত করুন।
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-600/20 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>কাস্টম রিসোর্স যোগ করুন</span>
          </button>
        </div>

        {/* Filters */}
        <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="রিসোর্স বা বই খুঁজুন…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            <option value="All">সকল বিষয় (All Subjects)</option>
            <option value="Banking & GK">Banking & GK</option>
            <option value="Math">Math</option>
            <option value="Analytical">Analytical</option>
            <option value="English">English</option>
            <option value="Bangla">Bangla</option>
            <option value="ICT">ICT</option>
            <option value="Written">Written</option>
            <option value="All Subjects">All Subjects</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            <option value="All">সকল ফরম্যাট (Book, PDF, Web)</option>
            <option value="Website">Website</option>
            <option value="PDF">PDF Document</option>
            <option value="Book">Printed / PDF Book</option>
            <option value="Newspaper">Newspaper</option>
          </select>
        </div>
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredResources.map((item) => {
          const isUrl = item.url && (item.url.startsWith('http') || item.url.startsWith('/'));
          return (
            <div
              key={item._id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between gap-4 shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                      {getTypeIcon(item.type)}
                    </span>
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 block">
                        {item.resourceId}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {item.subject}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      item.priority === 'High'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                    }`}
                  >
                    {item.priority} Priority
                  </span>
                </div>

                <h3 className="text-base font-bold text-white leading-snug">
                  {item.title}
                </h3>

                {item.notes && (
                  <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    💡 {item.notes}
                  </p>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
                {isUrl ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 font-semibold transition"
                  >
                    <span>রিসোর্স খুলুন</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="text-slate-500 italic text-[11px] truncate max-w-[200px]">
                    {item.url || 'Standard Edition'}
                  </span>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleStatus(item._id, item.status)}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition"
                    title="স্ট্যাটাস পরিবর্তন"
                  >
                    {item.status}
                  </button>

                  {!item.isSystem && (
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-1 text-slate-600 hover:text-rose-400 transition"
                      title="মুছুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Resource Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative text-slate-100 my-8">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 mb-6">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                কাস্টম রিসোর্স
              </span>
              <h3 className="text-xl font-bold text-white">নতুন রিসোর্স যোগ করুন</h3>
              <p className="text-xs text-slate-400">
                আপনার পছন্দের ড্রাইভ লিংক, ইউটিউব প্লেলিস্ট বা বইয়ের তথ্য সংরক্ষণ করুন।
              </p>
            </div>

            <form onSubmit={handleAddResource} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">রিসোর্স শিরোনাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: BB AD 2024 Math Solution PDF"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">বিষয় *</label>
                  <select
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Banking & GK">Banking & GK</option>
                    <option value="Math">Math</option>
                    <option value="Analytical">Analytical</option>
                    <option value="English">English</option>
                    <option value="Bangla">Bangla</option>
                    <option value="ICT">ICT</option>
                    <option value="Written">Written</option>
                    <option value="All Subjects">All Subjects</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">টাইপ (Type)</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Website">Website</option>
                    <option value="PDF">PDF</option>
                    <option value="Book">Book</option>
                    <option value="Newspaper">Newspaper</option>
                    <option value="Video">Video</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">URL বা ফাইল পাথ / বইয়ের এডিশন</label>
                <input
                  type="text"
                  placeholder="https://... অথবা প্রিন্ট এডিশন"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">নোট / পড়ার সেরা চ্যাপ্টার</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="কোন কোন পৃষ্ঠা বা চ্যাপ্টারে জোর দিতে হবে…"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                >
                  {saving ? 'সংরক্ষণ হচ্ছে…' : 'রিসোর্স সেভ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
