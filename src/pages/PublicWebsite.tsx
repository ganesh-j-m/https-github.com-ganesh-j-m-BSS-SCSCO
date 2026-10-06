import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  QrCode,
  Calendar,
  Bell,
  Award,
  Users,
  Briefcase,
  BookOpen,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Clock,
  Layers
} from 'lucide-react';
import { db } from '../lib/db/store';
import { AdmissionsPortal } from '../components/admissions/AdmissionsPortal';

interface PublicWebsiteProps {
  onNavigateToLogin: (role?: string) => void;
  onNavigateToPortal: () => void;
  onOpenQRScanner?: () => void;
}

export const PublicWebsite: React.FC<PublicWebsiteProps> = ({
  onNavigateToLogin,
  onNavigateToPortal,
  onOpenQRScanner,
}) => {
  const [dbState, setDbState] = useState(db.getState());
  const [activeSlide, setActiveSlide] = useState(0);

  React.useEffect(() => {
    return db.subscribe(() => setDbState({ ...db.getState() }));
  }, []);

  const heroSlides = dbState.heroSlides.filter(s => s.isActive);
  const currentSlide = heroSlides[activeSlide] || heroSlides[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Hero Slideshow Section */}
      <section className="relative min-h-[560px] lg:min-h-[640px] flex items-center bg-slate-950 text-white overflow-hidden">
        {/* Background Image with Ambient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={currentSlide?.imageUrl || 'https://images.unsplash.com/photo-1562774053-701939374585?w=1600'}
            alt="Campus Hero"
            className="w-full h-full object-cover opacity-35 scale-105 transition-all duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40"></div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold backdrop-blur">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Autonomous Premier Academic Institution • NAAC A++ Accredited</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              {currentSlide?.title || 'Excellence in Technology, Innovation & Research'}
            </h1>

            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
              {currentSlide?.subtitle ||
                'Autonomous institution empowering next-generation computer scientists and engineers with real-time digital learning and industry alliances.'}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#admissions"
                className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center gap-2"
              >
                Apply for Admissions 2026-27 <ArrowRight className="w-4 h-4" />
              </a>

              <button
                onClick={() => onNavigateToLogin('STUDENT')}
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl border border-white/20 backdrop-blur transition flex items-center gap-2"
              >
                <GraduationCap className="w-4 h-4 text-indigo-400" /> Student Portal Login
              </button>

              {onOpenQRScanner && (
                <button
                  onClick={onOpenQRScanner}
                  className="px-5 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-emerald-700/30 flex items-center gap-2"
                >
                  <QrCode className="w-4 h-4" /> Scan Attendance QR
                </button>
              )}
            </div>
          </div>

          {/* Slide Indicator Dots */}
          <div className="flex items-center gap-2 mt-12">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`h-2 rounded-full transition-all ${
                  activeSlide === idx ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-600 hover:bg-slate-500'
                }`}
                title={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Quick Access Grid */}
      <section className="relative z-20 -mt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Student Portal', icon: GraduationCap, color: 'text-indigo-600', role: 'STUDENT' },
            { label: 'Faculty Portal', icon: BookOpen, color: 'text-blue-600', role: 'TEACHER' },
            { label: 'HOD Portal', icon: Layers, color: 'text-purple-600', role: 'HOD' },
            { label: 'Principal Portal', icon: Award, color: 'text-amber-600', role: 'PRINCIPAL' },
            { label: 'Admissions 2026', icon: CheckCircle2, color: 'text-emerald-600', anchor: '#admissions' },
            { label: 'Placements Wall', icon: Briefcase, color: 'text-rose-600', anchor: '#placements' },
          ].map((item, idx) => (
            <div
              key={idx}
              onClick={() => {
                if (item.role) onNavigateToLogin(item.role);
                else if (item.anchor) window.location.hash = item.anchor;
              }}
              className="bg-white p-4 rounded-2xl shadow-md border border-slate-200/80 hover:shadow-lg hover:-translate-y-1 transition cursor-pointer flex flex-col items-center text-center group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mb-2 group-hover:bg-indigo-50 transition">
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Institutional Statistics Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white p-8 rounded-3xl shadow-xl">
          <div className="text-center border-r border-indigo-800/40 last:border-0">
            <div className="text-3xl sm:text-4xl font-extrabold text-indigo-400">NAAC A++</div>
            <p className="text-xs text-indigo-200 mt-1">Autonomous Accreditation</p>
          </div>
          <div className="text-center border-r border-indigo-800/40 last:border-0">
            <div className="text-3xl sm:text-4xl font-extrabold text-white">48.5 LPA</div>
            <p className="text-xs text-indigo-200 mt-1">Highest Placement Package</p>
          </div>
          <div className="text-center border-r border-indigo-800/40 last:border-0">
            <div className="text-3xl sm:text-4xl font-extrabold text-indigo-400">98.4%</div>
            <p className="text-xs text-indigo-200 mt-1">Campus Placement Rate</p>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-white">100%</div>
            <p className="text-xs text-indigo-200 mt-1">Smart QR Attendance Verified</p>
          </div>
        </div>
      </section>

      {/* Notices & Events Split Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Latest Official Notices */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Latest Circulars & Notices</h3>
                  <p className="text-[11px] text-slate-400">Real-time academic and examination updates</p>
                </div>
              </div>
              <span className="text-xs text-indigo-600 font-semibold cursor-pointer hover:underline">
                View All
              </span>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {dbState.notices.map(notice => (
                <div key={notice.id} className="py-3.5 hover:bg-slate-50/70 px-2 rounded-xl transition">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 uppercase">
                      {notice.category}
                    </span>
                    {notice.isImportant && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 uppercase">
                        Urgent
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400 font-medium">{notice.publishedDate}</span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm mt-1">{notice.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{notice.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Campus Events */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Upcoming Events</h3>
                  <p className="text-[11px] text-slate-400">Hackathons, Conferences & Cultural Fests</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 mt-4">
              {dbState.events.map(ev => (
                <div key={ev.id} className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition">
                  <img
                    src={ev.imageUrl}
                    alt={ev.title}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase block">{ev.category} • {ev.eventDate}</span>
                    <h5 className="font-bold text-slate-800 text-xs truncate">{ev.title}</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">{ev.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Smart QR Attendance Explainer Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-slate-900 text-white rounded-3xl p-8 lg:p-12 relative overflow-hidden shadow-2xl border border-slate-800">
          <div className="max-w-2xl relative z-10 space-y-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
              Proprietary Classroom Tech
            </span>
            <h2 className="text-3xl font-black text-white tracking-tight">
              Smart QR Attendance Architecture
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Eliminate proxy attendance completely. SCSCO College uses a dynamic cryptographic QR code generated on classroom projection screens that expires after <strong className="text-white">strictly 5 minutes</strong>. Students scan using their mobile camera with instantaneous server-side validation against class, division, subject, and unique database constraints.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80">
                <span className="font-bold text-indigo-400 block">5-Minute Lifetime</span>
                <span className="text-slate-400 text-[11px]">Strict server timestamp</span>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80">
                <span className="font-bold text-emerald-400 block">Zero Proxy Scans</span>
                <span className="text-slate-400 text-[11px]">Unique DB constraints</span>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80">
                <span className="font-bold text-amber-400 block">Audited Corrections</span>
                <span className="text-slate-400 text-[11px]">Permanent change log</span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => onNavigateToLogin('TEACHER')}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition shadow flex items-center gap-2"
              >
                <QrCode className="w-4 h-4" /> Try Teacher QR Generation
              </button>
              <button
                onClick={() => onNavigateToLogin('STUDENT')}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center gap-2"
              >
                <GraduationCap className="w-4 h-4 text-emerald-400" /> Try Student QR Scanner
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Online Admissions Application Section */}
      <section id="admissions" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AdmissionsPortal />
      </section>

      {/* Placements Wall */}
      <section id="placements" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Placement Cell</span>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">Corporate Recruitment Opportunities</h3>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
              98% Placement Milestone
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {dbState.jobs.map(job => (
              <div key={job.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-md transition space-y-3">
                <div className="flex items-center gap-3">
                  <img src={job.companyLogo} alt={job.companyName} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{job.companyName}</h4>
                    <span className="text-xs font-semibold text-indigo-600">{job.packageLPA}</span>
                  </div>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <p><strong>Role:</strong> {job.jobRole}</p>
                  <p><strong>Location:</strong> {job.location}</p>
                  <p><strong>Eligibility:</strong> Min CGPA {job.minCgpa}</p>
                  <p><strong>Last Date:</strong> {job.lastDateToApply}</p>
                </div>
                <button
                  onClick={() => onNavigateToLogin('STUDENT')}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition shadow"
                >
                  Apply via Student Portal
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Campus Photo Gallery */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Campus Life</span>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">Infrastructure & World-Class Facilities</h3>
          <p className="text-xs text-slate-500 mt-1">High-tech laboratories, Olympic sports facilities, and smart auditoriums</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {dbState.gallery.map(item => (
            <div key={item.id} className="group relative rounded-2xl overflow-hidden shadow-sm border border-slate-200">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent p-4 flex flex-col justify-end text-white">
                <span className="text-[10px] font-bold text-indigo-300 uppercase">{item.category}</span>
                <h5 className="font-bold text-xs leading-tight mt-0.5">{item.title}</h5>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Professional Academic Footer */}
      <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 mt-16 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-800 text-xs">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-base text-white tracking-tight">SCSCO College</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              SCSCO College Digital Platform is a fully autonomous, next-generation academic operating system providing verified digital credentials, Smart QR attendance, and unified administration.
            </p>
            <div className="text-[11px] text-slate-500">
              Autonomous Premier Engineering & Science Campus
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Academic Portals</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li><button onClick={() => onNavigateToLogin('STUDENT')} className="hover:text-white transition">Student Portal</button></li>
              <li><button onClick={() => onNavigateToLogin('TEACHER')} className="hover:text-white transition">Faculty Attendance Engine</button></li>
              <li><button onClick={() => onNavigateToLogin('HOD')} className="hover:text-white transition">Head of Department Dashboard</button></li>
              <li><button onClick={() => onNavigateToLogin('PRINCIPAL')} className="hover:text-white transition">Principal Analytics Hub</button></li>
              <li><button onClick={() => onNavigateToLogin('ADMIN')} className="hover:text-white transition">System Administration CMS</button></li>
            </ul>
          </div>

          {/* Academic Programs */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Degrees & Programs</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>B.Tech Computer Science & Engineering</li>
              <li>Bachelor of Computer Science (BCS)</li>
              <li>Master of Computer Applications (MCA)</li>
              <li>B.Tech Mechanical Engineering</li>
              <li>B.Tech Information Technology</li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Campus Contact</h4>
            <div className="space-y-2 text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>SCSCO Academic Campus, University Innovation Boulevard, Pune, Maharashtra 411007</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>+91 20 2569 8800 / 8801</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>admissions@scsco.edu | office@scsco.edu</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-4">
          <p>© 2026 SCSCO College Digital Platform. All rights reserved. English Language Academic Specification.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-400">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400">Attendance Regulations</a>
            <a href="#" className="hover:text-slate-400">Security Architecture</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
