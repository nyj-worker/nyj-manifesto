import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/index.ts';
import {
  getClientDashboardStats,
  getClientProjects,
  getClientProjectById,
  updateClientProject,
  transitionClientProject,
  getClientPublicStats,
  getClientPublicProjects,
  getClientAuditLogs,
  initClientStorage
} from '../services/clientStorage.ts';
import { SEED_USERS } from '../../server/seed_data.ts';

// Vercel 정적 호스팅 환경에서 백엔드 API 부재 시 동작하는 클라이언트 라우터
async function handleClientFallback(url: string, options: RequestInit = {}, currentUser: User): Promise<Response> {
  initClientStorage();
  const method = (options.method || 'GET').toUpperCase();
  const cleanUrl = url.split('?')[0];

  // 1. 사용자 목록
  if (cleanUrl === '/api/auth/users') {
    return new Response(JSON.stringify({ users: SEED_USERS }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 2. 관리자 대시보드 통계
  if (cleanUrl === '/api/admin/dashboard-stats') {
    const stats = getClientDashboardStats();
    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 3. 관리자 공약 목록
  if (cleanUrl === '/api/admin/projects' && method === 'GET') {
    const projects = getClientProjects();
    return new Response(JSON.stringify({ projects }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 4. 프로젝트 상세
  if (cleanUrl.startsWith('/api/admin/projects/') && method === 'GET') {
    const id = cleanUrl.replace('/api/admin/projects/', '');
    const data = getClientProjectById(id);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 5. 프로젝트 실적 수정
  if (cleanUrl.startsWith('/api/admin/projects/') && method === 'PUT') {
    const id = cleanUrl.replace('/api/admin/projects/', '');
    const body = options.body ? JSON.parse(options.body as string) : {};
    const updated = updateClientProject(id, body, currentUser);
    return new Response(JSON.stringify({ success: true, project: updated }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 6. 상태 전이 (승인/반려/게시/철회)
  if (cleanUrl.includes('/transition') && method === 'POST') {
    const parts = cleanUrl.split('/');
    const id = parts[parts.indexOf('projects') + 1];
    const body = options.body ? JSON.parse(options.body as string) : {};
    const updated = transitionClientProject(id, body.action, body.comment, body.rejectReason, currentUser);
    return new Response(JSON.stringify({ success: true, project: updated }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 6-1. 감사 로그
  if (cleanUrl === '/api/admin/audit-logs') {
    const logs = getClientAuditLogs();
    return new Response(JSON.stringify({ logs }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 7. 시민 공개 통계
  if (cleanUrl === '/api/public/stats') {
    const stats = getClientPublicStats();
    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 8. 시민 공개 프로젝트 목록
  if (cleanUrl === '/api/public/projects' && method === 'GET') {
    const result = getClientPublicProjects();
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 9. 시민 공약 상세
  if (cleanUrl.startsWith('/api/public/projects/') && method === 'GET') {
    const id = cleanUrl.replace('/api/public/projects/', '');
    const { project } = getClientProjectById(id);
    return new Response(JSON.stringify({ project }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 10. 쉬운말 AI 질문 응답 (클라이언트 전용)
  if (cleanUrl === '/api/ai/custom-ask' && method === 'POST') {
    let question = '';
    try {
      if (options.body) {
        const parsed = JSON.parse(options.body as string);
        question = parsed.question || '';
      }
    } catch {}

    const answer = `[남양주시 민선9기 공약 AI 알리미]\n질문하신 "${question}" 관련 핵심 공약사항을 안내해 드립니다.\n\n• 추진 배경: 남양주시민의 교통 편익과 삶의 질 향상을 위해 민선9기 중점 과제로 선정되어 적극 추진되고 있습니다.\n• 진행 현황: 2026년 현재 기본계획 및 사전 인허가 절차가 정상추진 중이며, 분기별 이행 점검을 철저히 진행하고 있습니다.\n• 기대 효과: 사업이 완료되면 서울 접근성 개선 및 지역 주민의 통근 시간이 획기적으로 단축될 것으로 기대됩니다.`;

    return new Response(JSON.stringify({
      answer,
      references: [
        { manageNo: '4-01', title: '9호선 조기 착공 및 적기 개통' },
        { manageNo: '4-14', title: '남양주형 똑버스(DRT) 확대 도입' }
      ]
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 기본 성공 응답
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

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
    // 처음 접속하거나 저장값이 없으면 무조건 'public' (시민 공개 대시보드)으로 시작
    return (localStorage.getItem('portal_mode') as 'admin' | 'public') || 'public';
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

    // 시민 모드 상태에서 내부 행정 포털을 누르면, 자연스럽게 교통정책과 담당자로 자동 전환하여 권한 오류 방지
    if (mode === 'admin' && currentUser.role === 'CITIZEN') {
      const defaultOfficer = users.find(u => u.id === 'user_railway_dept') || {
        id: 'user_railway_dept',
        name: '김교통',
        role: 'DEPT_USER' as UserRole,
        departmentId: 'dept_railway',
        departmentName: '교통정책과',
        bureauId: 'bureau_traffic',
        bureauName: '교통국',
        email: 'yang.yh@nyj.go.kr',
        phone: '031-590-4428'
      };
      setCurrentUser(defaultOfficer);
      localStorage.setItem('demo_current_user', JSON.stringify(defaultOfficer));
    }
  };

  // 요청 헤더에 현재 사용자 ID 자동 주입 + Vercel 호스팅 환경을 위한 자동 클라이언트 Fallback
  const apiFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const headers = new Headers(options.headers || {});
    headers.set('x-user-id', currentUser.id);
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    try {
      const res = await fetch(url, { ...options, headers });
      // 만약 404 Not Found이거나 HTML이 반환되면 (Vercel에서 백엔드 없이 프론트만 서빙된 경우)
      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || contentType.includes('text/html')) {
        return handleClientFallback(url, options, currentUser);
      }
      return res;
    } catch (networkError) {
      // 서버 오프라인 또는 Vercel 환경
      return handleClientFallback(url, options, currentUser);
    }
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
