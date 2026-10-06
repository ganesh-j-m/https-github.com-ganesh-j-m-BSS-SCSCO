import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, StudentProfile, FacultyProfile } from '../../types';
import { db } from '../db/store';

interface AuthContextType {
  currentUser: User | null;
  studentProfile: StudentProfile | null;
  facultyProfile: FacultyProfile | null;
  role: UserRole | 'GUEST';
  isAuthenticated: boolean;
  login: (email: string, role?: UserRole) => boolean;
  logout: () => void;
  switchUser: (userId: string) => void;
  availableDemoUsers: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'scsco_active_user_id';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dbState, setDbState] = useState(db.getState());
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(CURRENT_USER_KEY) || 'usr_teacher'; // Default to teacher so QR generation is immediately discoverable
    }
    return 'usr_teacher';
  });

  useEffect(() => {
    const unsubscribe = db.subscribe(() => {
      setDbState({ ...db.getState() });
    });
    return unsubscribe;
  }, []);

  const currentUser = currentUserId
    ? dbState.users.find(u => u.id === currentUserId) || null
    : null;

  const studentProfile = currentUser && currentUser.role === 'STUDENT'
    ? dbState.students.find(s => s.userId === currentUser.id || s.id === currentUser.studentProfileId) || null
    : null;

  const facultyProfile = currentUser && (currentUser.role === 'TEACHER' || currentUser.role === 'HOD')
    ? dbState.faculty.find(f => f.userId === currentUser.id || f.id === currentUser.facultyProfileId) || null
    : null;

  const login = (email: string, role?: UserRole): boolean => {
    const user = dbState.users.find(u =>
      u.email.toLowerCase() === email.toLowerCase() && (!role || u.role === role)
    );
    if (user) {
      setCurrentUserId(user.id);
      if (typeof window !== 'undefined') {
        localStorage.setItem(CURRENT_USER_KEY, user.id);
      }
      return true;
    }
    return false;
  };

  const switchUser = (userId: string) => {
    const user = dbState.users.find(u => u.id === userId);
    if (user) {
      setCurrentUserId(user.id);
      if (typeof window !== 'undefined') {
        localStorage.setItem(CURRENT_USER_KEY, user.id);
      }
    }
  };

  const logout = () => {
    setCurrentUserId(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        studentProfile,
        facultyProfile,
        role: currentUser ? currentUser.role : 'GUEST',
        isAuthenticated: !!currentUser,
        login,
        logout,
        switchUser,
        availableDemoUsers: dbState.users,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
