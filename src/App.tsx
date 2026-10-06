import React, { useState } from 'react';
import { AuthProvider, useAuth } from './lib/auth/authContext';
import { Navbar } from './components/layout/Navbar';
import { PublicWebsite } from './pages/PublicWebsite';
import { StudentPortal } from './pages/StudentPortal';
import { TeacherPortal } from './pages/TeacherPortal';
import { HODPortal } from './pages/HODPortal';
import { PrincipalPortal } from './pages/PrincipalPortal';
import { AdminPortal } from './pages/AdminPortal';
import { ParentPortal } from './pages/ParentPortal';
import { LoginPage } from './pages/LoginPage';
import { QRGeneratorModal } from './components/qr/QRGeneratorModal';
import { QRScannerModal } from './components/qr/QRScannerModal';
import { ClassroomQRPresenter } from './components/qr/ClassroomQRPresenter';
import { db } from './lib/db/store';
import { UserRole } from './types';
import { QrCode, Camera, Monitor, Sparkles } from 'lucide-react';

function AppContent() {
  const { currentUser, role } = useAuth();
  const [currentView, setCurrentView] = useState<'public' | 'portal' | 'login'>('public');
  const [loginTargetRole, setLoginTargetRole] = useState<UserRole>('STUDENT');

  // Modals & Screens
  const [isQRGeneratorOpen, setIsQRGeneratorOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [presenterSessionId, setPresenterSessionId] = useState<string | null>(null);

  const handleNavigateToLogin = (targetRole: string = 'STUDENT') => {
    setLoginTargetRole(targetRole as UserRole);
    setCurrentView('login');
  };

  const handleSessionCreated = (sessionId: string) => {
    setPresenterSessionId(sessionId);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-poppins text-slate-800">
      {/* Navbar (hidden on standalone login screen) */}
      {currentView !== 'login' && (
        <Navbar
          currentView={currentView}
          onNavigate={(view: any) => setCurrentView(view)}
          onOpenQRGenerator={() => setIsQRGeneratorOpen(true)}
          onOpenQRScanner={() => setIsQRScannerOpen(true)}
        />
      )}

      {/* Main View Router */}
      <main className="flex-1">
        {/* Projector Screen Overlay if active */}
        {presenterSessionId && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <ClassroomQRPresenter
              sessionId={presenterSessionId}
              onCloseView={() => setPresenterSessionId(null)}
            />
          </div>
        )}

        {currentView === 'login' && (
          <LoginPage
            initialRole={loginTargetRole}
            onLoginSuccess={() => setCurrentView('portal')}
            onBackToPublic={() => setCurrentView('public')}
          />
        )}

        {currentView === 'public' && !presenterSessionId && (
          <PublicWebsite
            onNavigateToLogin={handleNavigateToLogin}
            onNavigateToPortal={() => setCurrentView('portal')}
            onOpenQRScanner={() => setIsQRScannerOpen(true)}
          />
        )}

        {currentView === 'portal' && !presenterSessionId && (
          <>
            {role === 'STUDENT' && (
              <StudentPortal onOpenQRScanner={() => setIsQRScannerOpen(true)} />
            )}

            {role === 'TEACHER' && (
              <TeacherPortal
                onOpenQRGenerator={() => setIsQRGeneratorOpen(true)}
                onOpenPresenterSession={(id) => setPresenterSessionId(id)}
              />
            )}

            {role === 'HOD' && <HODPortal />}

            {role === 'PRINCIPAL' && <PrincipalPortal />}

            {role === 'ADMIN' && <AdminPortal />}

            {role === 'PARENT' && <ParentPortal />}

            {role === 'GUEST' && (
              <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 text-center shadow-lg">
                <Sparkles className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-900">Authentication Required</h3>
                <p className="text-xs text-slate-500 mt-1 mb-6">
                  Please log in with your institutional credentials to access your designated role portal.
                </p>
                <button
                  onClick={() => setCurrentView('login')}
                  className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl text-xs hover:bg-indigo-700 transition"
                >
                  Proceed to Login
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Global Modals */}
      <QRGeneratorModal
        isOpen={isQRGeneratorOpen}
        onClose={() => setIsQRGeneratorOpen(false)}
        onSessionCreated={handleSessionCreated}
      />

      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onScanSuccess={() => {}}
      />

      {/* Floating Smart QR Quick-Test Dock (Bottom-Right for easy access) */}
      <div className="fixed bottom-4 right-4 z-40 bg-slate-950/90 backdrop-blur-md border border-slate-800 text-white p-2 rounded-2xl shadow-2xl flex items-center gap-2">
        <button
          onClick={() => setIsQRGeneratorOpen(true)}
          className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow"
          title="Launch 5-Minute Classroom QR"
        >
          <QrCode className="w-4 h-4" />
          <span className="hidden sm:inline">Launch QR</span>
        </button>

        <button
          onClick={() => setIsQRScannerOpen(true)}
          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow"
          title="Open Camera QR Scanner"
        >
          <Camera className="w-4 h-4" />
          <span className="hidden sm:inline">Scan QR</span>
        </button>

        <button
          onClick={() => {
            const state = db.getState();
            const active = state.attendanceSessions[0];
            if (active) setPresenterSessionId(active.id);
          }}
          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          title="View Classroom Projector Screen"
        >
          <Monitor className="w-4 h-4" />
          <span className="hidden sm:inline">Projector</span>
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
