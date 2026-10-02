import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/index.ts';

interface AuthContextType {
  currentUser: User;
  users: User[];
  portalMode: 'admin' | 'public';
  setPortalMode: (mode: 'admin' | 'public') => void;
  switchUser: (userId: string) => void;
  apiFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const defaultCitizen: User = {
  id: 'user_citizen',
  name: '남양주시민',
  role: 'CITIZEN',
  departmentId: '',
  departmentName: '',
  bureauId: '',
  bureauName: '',
  email: 'citizen@namyangju.kr'
};

const AuthContext = createContext<AuthContextType>({
  currentUser: defaultCitizen,
  users: [defaultCitizen],
  portalMode: 'public',
  setPortalMode: () => {},
  switchUser: () => {},
  apiFetch: async () => new Response()
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('demo_current_user');
    return saved ? JSON.parse(saved) : defaultCitizen;
  });
  const [users, setUsers] = useState<User[]>([defaultCitizen]);
  const [portalMode, setPortalMode] = useState<'admin' | 'public'>(() => {
    return (localStorage.getItem('portal_mode') as 'admin' | 'public') || 'admin';
  });

  // 서버에서 데모 사용자 목록 로드
  useEffect(() => {
    fetch('/api/auth/users')
      .then(res => res.json())
      .then(data => {
        if (data.users && data.users.length > 0) {
          setUsers(data.users);
          // 저장된 사용자가 목록에 있으면 갱신
          const matched = data.users.find((u: User) => u.id === currentUser.id);
          if (matched) setCurrentUser(matched);
        }
      })
      .catch(err => console.error('사용자 목록 로드 오류:', err));
  }, []);

  const switchUser = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (target) {
      setCurrentUser(target);
      localStorage.setItem('demo_current_user', JSON.stringify(target));
      if (target.role === 'CITIZEN') {
        setPortalMode('public');
        localStorage.setItem('portal_mode', 'public');
      } else {
        setPortalMode('admin');
        localStorage.setItem('portal_mode', 'admin');
      }
    }
  };

  const handleSetPortalMode = (mode: 'admin' | 'public') => {
    setPortalMode(mode);
    localStorage.setItem('portal_mode', mode);
  };

  // 요청 헤더에 현재 사용자 ID 자동 주입
  const apiFetch = async (url: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers || {});
    headers.set('x-user-id', currentUser.id);
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }
    return fetch(url, { ...options, headers });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        portalMode,
        setPortalMode: handleSetPortalMode,
        switchUser,
        apiFetch
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
