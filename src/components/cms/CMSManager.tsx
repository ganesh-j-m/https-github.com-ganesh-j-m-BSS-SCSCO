import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Calendar,
  Image,
  Bell,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';
import { db } from '../../lib/db/store';
import { NoticeItem, EventItem, NewsItem, GalleryItem } from '../../types';

export const CMSManager: React.FC = () => {
  const [dbState, setDbState] = useState(db.getState());
  const [cmsTab, setCmsTab] = useState<'NOTICES' | 'EVENTS' | 'NEWS' | 'GALLERY'>('NOTICES');

  // New Notice Form State
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeCategory, setNewNoticeCategory] = useState<NoticeItem['category']>('ACADEMIC');
  const [newNoticeContent, setNewNoticeContent] = useState('');
  const [newNoticeRole, setNewNoticeRole] = useState<NoticeItem['targetRole']>('ALL');
  const [newNoticeImportant, setNewNoticeImportant] = useState(false);

  // New Event Form State
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventCategory, setNewEventCategory] = useState<EventItem['category']>('TECHNICAL');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventDate, setNewEventDate] = useState('2026-11-25');
  const [newEventLocation, setNewEventLocation] = useState('Main Auditorium');
  const [newEventCapacity, setNewEventCapacity] = useState(300);
  const [newEventImage, setNewEventImage] = useState('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800');

  // New News Form State
  const [newNewsTitle, setNewNewsTitle] = useState('');
  const [newNewsSummary, setNewNewsSummary] = useState('');
  const [newNewsContent, setNewNewsContent] = useState('');
  const [newNewsImage, setNewNewsImage] = useState('https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800');

  // Feedback banner
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  React.useEffect(() => {
    return db.subscribe(() => setDbState({ ...db.getState() }));
  }, []);

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    db.addNotice({
      title: newNoticeTitle,
      category: newNoticeCategory,
      content: newNoticeContent,
      targetRole: newNoticeRole,
      isImportant: newNoticeImportant,
    });
    setNewNoticeTitle('');
    setNewNoticeContent('');
    setSuccessMsg('New official notice published successfully.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    db.addEvent({
      title: newEventTitle,
      category: newEventCategory,
      description: newEventDesc,
      eventDate: newEventDate,
      location: newEventLocation,
      capacity: newEventCapacity,
      imageUrl: newEventImage,
    });
    setNewEventTitle('');
    setNewEventDesc('');
    setSuccessMsg('New college event published to public portal.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleCreateNews = (e: React.FormEvent) => {
    e.preventDefault();
    db.addNews({
      title: newNewsTitle,
      summary: newNewsSummary,
      content: newNewsContent,
      imageUrl: newNewsImage,
    });
    setNewNewsTitle('');
    setNewNewsSummary('');
    setNewNewsContent('');
    setSuccessMsg('Press release / news item added successfully.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          Content Management System (CMS)
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage public website content, circular notices, events, and news articles in real-time
        </p>
      </div>

      {successMsg && (
        <div className="m-6 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 px-6 bg-slate-50/50">
        <button
          onClick={() => setCmsTab('NOTICES')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 transition ${
            cmsTab === 'NOTICES'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Notices ({dbState.notices.length})
        </button>
        <button
          onClick={() => setCmsTab('EVENTS')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 transition ${
            cmsTab === 'EVENTS'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Events ({dbState.events.length})
        </button>
        <button
          onClick={() => setCmsTab('NEWS')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 transition ${
            cmsTab === 'NEWS'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          News & Press ({dbState.news.length})
        </button>
        <button
          onClick={() => setCmsTab('GALLERY')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 transition ${
            cmsTab === 'GALLERY'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Campus Gallery ({dbState.gallery.length})
        </button>
      </div>

      <div className="p-6">
        {/* NOTICES TAB */}
        {cmsTab === 'NOTICES' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Create Form */}
            <form onSubmit={handleCreateNotice} className="lg:col-span-5 bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-indigo-600" /> Publish New Notice
              </h3>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notice Title</label>
                <input
                  type="text"
                  value={newNoticeTitle}
                  onChange={e => setNewNoticeTitle(e.target.value)}
                  placeholder="e.g. Schedule for Mid-Term Exams"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newNoticeCategory}
                    onChange={e => setNewNoticeCategory(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none"
                  >
                    <option value="ACADEMIC">ACADEMIC</option>
                    <option value="EXAMINATION">EXAMINATION</option>
                    <option value="PLACEMENT">PLACEMENT</option>
                    <option value="EVENT">EVENT</option>
                    <option value="GENERAL">GENERAL</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Audience</label>
                  <select
                    value={newNoticeRole}
                    onChange={e => setNewNoticeRole(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none"
                  >
                    <option value="ALL">All College</option>
                    <option value="STUDENT">Students Only</option>
                    <option value="TEACHER">Faculty Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Content</label>
                <textarea
                  value={newNoticeContent}
                  onChange={e => setNewNoticeContent(e.target.value)}
                  placeholder="Official notice circular text..."
                  rows={3}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-600"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="notice-imp"
                  checked={newNoticeImportant}
                  onChange={e => setNewNoticeImportant(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <label htmlFor="notice-imp" className="text-slate-700 font-medium">
                  Mark as High Priority / Urgent
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition shadow"
              >
                Publish Notice
              </button>
            </form>

            {/* List */}
            <div className="lg:col-span-7 space-y-3">
              <h3 className="font-bold text-slate-800 text-sm">Active College Notices</h3>
              {dbState.notices.map(notice => (
                <div key={notice.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 uppercase">
                        {notice.category}
                      </span>
                      {notice.isImportant && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 uppercase">
                          URGENT
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">{notice.publishedDate}</span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm mt-1">{notice.title}</h4>
                    <p className="text-xs text-slate-600 mt-1">{notice.content}</p>
                  </div>
                  <button
                    onClick={() => db.deleteNotice(notice.id)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                    title="Delete Notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EVENTS TAB */}
        {cmsTab === 'EVENTS' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <form onSubmit={handleCreateEvent} className="lg:col-span-5 bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-indigo-600" /> Create Campus Event
              </h3>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Event Title</label>
                <input
                  type="text"
                  value={newEventTitle}
                  onChange={e => setNewEventTitle(e.target.value)}
                  placeholder="e.g. Annual Hackathon 2026"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={newEventDate}
                    onChange={e => setNewEventDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    value={newEventCapacity}
                    onChange={e => setNewEventCapacity(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Location Venue</label>
                <input
                  type="text"
                  value={newEventLocation}
                  onChange={e => setNewEventLocation(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  value={newEventDesc}
                  onChange={e => setNewEventDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition shadow"
              >
                Add Campus Event
              </button>
            </form>

            <div className="lg:col-span-7 space-y-3">
              <h3 className="font-bold text-slate-800 text-sm">Scheduled Events</h3>
              {dbState.events.map(ev => (
                <div key={ev.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src={ev.imageUrl} alt={ev.title} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 uppercase">{ev.category} • {ev.eventDate}</span>
                      <h4 className="font-bold text-slate-800 text-sm">{ev.title}</h4>
                      <p className="text-xs text-slate-500">{ev.location} • {ev.registeredCount}/{ev.capacity} Registered</p>
                    </div>
                  </div>
                  <button
                    onClick={() => db.deleteEvent(ev.id)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NEWS TAB */}
        {cmsTab === 'NEWS' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <form onSubmit={handleCreateNews} className="lg:col-span-5 bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-indigo-600" /> Add Press News Article
              </h3>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Headline</label>
                <input
                  type="text"
                  value={newNewsTitle}
                  onChange={e => setNewNewsTitle(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Short Summary</label>
                <textarea
                  value={newNewsSummary}
                  onChange={e => setNewNewsSummary(e.target.value)}
                  rows={2}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Article Content</label>
                <textarea
                  value={newNewsContent}
                  onChange={e => setNewNewsContent(e.target.value)}
                  rows={3}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition shadow"
              >
                Publish Article
              </button>
            </form>

            <div className="lg:col-span-7 space-y-3">
              <h3 className="font-bold text-slate-800 text-sm">Published Press Articles</h3>
              {dbState.news.map(item => (
                <div key={item.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src={item.imageUrl} alt={item.title} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400">{item.publishedDate}</span>
                      <h4 className="font-bold text-slate-800 text-sm">{item.title}</h4>
                      <p className="text-xs text-slate-600 line-clamp-1">{item.summary}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => db.deleteNews(item.id)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GALLERY TAB */}
        {cmsTab === 'GALLERY' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Campus Photo Gallery</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {dbState.gallery.map(g => (
                <div key={g.id} className="relative group rounded-2xl overflow-hidden border border-slate-200">
                  <img src={g.imageUrl} alt={g.title} className="w-full h-36 object-cover" />
                  <div className="p-2.5 bg-white text-xs">
                    <span className="text-[9px] font-bold text-indigo-600 uppercase">{g.category}</span>
                    <h5 className="font-semibold text-slate-800 truncate">{g.title}</h5>
                  </div>
                  <button
                    onClick={() => db.deleteGallery(g.id)}
                    className="absolute top-2 right-2 p-1 bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition shadow"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
