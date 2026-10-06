import React, { useState } from 'react';
import {
  FileCheck2,
  Send,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Upload,
  Sparkles,
  GraduationCap
} from 'lucide-react';
import { db } from '../../lib/db/store';
import { AdmissionApplication } from '../../types';

export const AdmissionsPortal: React.FC = () => {
  const [dbState, setDbState] = useState(db.getState());
  const [activeTab, setActiveTab] = useState<'APPLY' | 'TRACK'>('APPLY');

  // Form state
  const [applicantName, setApplicantName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [courseId, setCourseId] = useState(dbState.courses[0]?.id || '');
  const [previousSchool, setPreviousSchool] = useState('');
  const [marksPercentage, setMarksPercentage] = useState<number>(85.5);
  const [submittedApplication, setSubmittedApplication] = useState<AdmissionApplication | null>(null);

  // Track state
  const [trackNumber, setTrackNumber] = useState('');
  const [trackedApp, setTrackedApp] = useState<AdmissionApplication | null>(null);
  const [trackError, setTrackError] = useState<string | null>(null);

  React.useEffect(() => {
    return db.subscribe(() => setDbState({ ...db.getState() }));
  }, []);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const course = dbState.courses.find(c => c.id === courseId);
    const newApp = db.submitAdmission({
      applicantName,
      email,
      phone,
      courseId,
      courseName: course?.name || 'Selected Degree Course',
      previousSchoolOrCollege: previousSchool,
      marksPercentage,
    });
    setSubmittedApplication(newApp);
    setTrackNumber(newApp.applicationNumber);
  };

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setTrackError(null);
    const app = dbState.admissions.find(
      a => a.applicationNumber.toLowerCase() === trackNumber.trim().toLowerCase()
    );
    if (app) {
      setTrackedApp(app);
    } else {
      setTrackedApp(null);
      setTrackError('Application number not found. Please verify your reference code (e.g. APP-2026-7819).');
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-8 bg-gradient-to-r from-indigo-900 to-indigo-800 text-white">
        <div className="max-w-2xl">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 uppercase tracking-wider">
            Admissions Open 2026-2027
          </span>
          <h2 className="text-2xl font-black mt-2 tracking-tight">SCSCO Online Admissions Portal</h2>
          <p className="text-sm text-indigo-200 mt-1">
            Apply online for Undergraduate and Postgraduate programs with real-time application tracking.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex gap-2 mt-6">
          <button
            onClick={() => setActiveTab('APPLY')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'APPLY'
                ? 'bg-white text-indigo-900 shadow'
                : 'bg-indigo-700/50 text-indigo-200 hover:bg-indigo-700'
            }`}
          >
            Apply for Admission
          </button>
          <button
            onClick={() => setActiveTab('TRACK')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'TRACK'
                ? 'bg-white text-indigo-900 shadow'
                : 'bg-indigo-700/50 text-indigo-200 hover:bg-indigo-700'
            }`}
          >
            Track Existing Application
          </button>
        </div>
      </div>

      <div className="p-8">
        {activeTab === 'APPLY' && !submittedApplication && (
          <form onSubmit={handleApply} className="max-w-2xl space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Student & Academic Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={applicantName}
                  onChange={e => setApplicantName(e.target.value)}
                  placeholder="e.g. Tanvi Deshpande"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-indigo-600"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. applicant@example.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-indigo-600"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mobile Contact</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-indigo-600"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Degree Program Selection</label>
                <select
                  value={courseId}
                  onChange={e => setCourseId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-indigo-600"
                >
                  {dbState.courses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.degreeType})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Previous School / Junior College</label>
                <input
                  type="text"
                  value={previousSchool}
                  onChange={e => setPreviousSchool(e.target.value)}
                  placeholder="e.g. Modern Junior Science College, Pune"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-indigo-600"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Qualifying Examination Marks (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={marksPercentage}
                  onChange={e => setMarksPercentage(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-indigo-600"
                  required
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center">
              <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
              <p className="font-semibold text-slate-700">Digital Document Verification</p>
              <p className="text-[11px] text-slate-500">
                10th, 12th / Diploma Marksheets & Identity Proofs attached for verification.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition shadow flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Submit Application
            </button>
          </form>
        )}

        {submittedApplication && (
          <div className="max-w-md mx-auto text-center p-6 bg-emerald-50 border border-emerald-200 rounded-2xl">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">Application Submitted Successfully</h3>
            <p className="text-xs text-slate-600 mt-1">
              Your admission application reference number is:
            </p>
            <div className="my-3 p-3 bg-white border border-emerald-300 rounded-xl font-mono text-base font-extrabold text-indigo-700">
              {submittedApplication.applicationNumber}
            </div>
            <p className="text-[11px] text-slate-500">
              Please save this reference number to track your scrutiny status and admission interview schedule.
            </p>
            <button
              onClick={() => {
                setActiveTab('TRACK');
                setSubmittedApplication(null);
                setTrackedApp(submittedApplication);
              }}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition"
            >
              Track Application Now
            </button>
          </div>
        )}

        {activeTab === 'TRACK' && (
          <div className="max-w-md mx-auto space-y-4 text-xs">
            <form onSubmit={handleTrack} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={trackNumber}
                  onChange={e => setTrackNumber(e.target.value)}
                  placeholder="Enter Application ID (e.g. APP-2026-7819)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-slate-800 focus:outline-none focus:border-indigo-600"
                  required
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition shadow"
              >
                Track
              </button>
            </form>

            {trackError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{trackError}</span>
              </div>
            )}

            {trackedApp && (
              <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-indigo-600">{trackedApp.applicationNumber}</span>
                    <h4 className="font-bold text-slate-900 text-sm mt-0.5">{trackedApp.applicantName}</h4>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    trackedApp.status === 'APPROVED'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : trackedApp.status === 'UNDER_REVIEW'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {trackedApp.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Selected Program:</span>
                    <span className="font-semibold text-slate-800">{trackedApp.courseName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Date Applied:</span>
                    <span>{trackedApp.appliedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Qualifying Percentage:</span>
                    <span className="font-semibold text-slate-800">{trackedApp.marksPercentage}%</span>
                  </div>
                </div>

                {trackedApp.adminComments && (
                  <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-indigo-900">
                    <span className="font-bold text-[10px] uppercase text-indigo-500 block mb-0.5">Admissions Committee Remarks</span>
                    <p className="italic">{trackedApp.adminComments}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
