import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { RoleSwitcher } from './components/common/RoleSwitcher.tsx';
import { Header } from './components/layout/Header.tsx';
import { AdminLayout } from './components/layout/AdminLayout.tsx';
import { PublicLayout } from './components/layout/PublicLayout.tsx';

// 내부 행정 페이지
import { Dashboard } from './pages/admin/Dashboard.tsx';
import { ProjectList } from './pages/admin/ProjectList.tsx';
import { ReportForm } from './pages/admin/ReportForm.tsx';
import { ApprovalInbox } from './pages/admin/ApprovalInbox.tsx';
import { PublicPublish } from './pages/admin/PublicPublish.tsx';
import { ReportsExport } from './pages/admin/ReportsExport.tsx';
import { AuditLogs } from './pages/admin/AuditLogs.tsx';

// 시민 공개 페이지
import { PublicHome } from './pages/public/PublicHome.tsx';
import { PublicMapPage } from './pages/public/PublicMapPage.tsx';
import { PublicList } from './pages/public/PublicList.tsx';
import { PublicDetail } from './pages/public/PublicDetail.tsx';
import { PublicAiSearch } from './pages/public/PublicAiSearch.tsx';

const AppContent: React.FC = () => {
  const { portalMode, currentUser, apiFetch } = useAuth();
  
  // 내부 행정 포털 탭
  const [adminTab, setAdminTab] = useState<string>('dashboard');
  const [adminSelectedProjectId, setAdminSelectedProjectId] = useState<string | undefined>();
  const [pendingCount, setPendingCount] = useState<number>(0);

  // 시민 공개 포털 탭
  const [publicTab, setPublicTab] = useState<string>('public-home');
  const [publicSelectedProjectId, setPublicSelectedProjectId] = useState<string>('proj_4_01');

  // 전환 완료 피드백 알림 배너 상태
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  // 대기 건수 배지 주기적 로드
  useEffect(() => {
    if (portalMode === 'admin') {
      apiFetch('/api/admin/dashboard-stats')
        .then(res => res.json())
        .then(data => {
          if (data.pendingApprovals) {
            setPendingCount(data.pendingApprovals.length);
          }
        })
        .catch(() => {});
    }
  }, [portalMode, currentUser, adminTab]);

  const handleAdminNavigate = (tab: string, projectId?: string) => {
    setAdminTab(tab);
    if (projectId) setAdminSelectedProjectId(projectId);
  };

  const handlePublicNavigate = (tab: string, projectId?: string) => {
    setPublicTab(tab);
    if (projectId) setPublicSelectedProjectId(projectId);
  };

  // 역할 빠른 전환 시연 성공 콜백 처리
  const handleRoleSwitchSuccess = (userId: string, targetTab: string, defaultProjectId?: string) => {
    if (userId === 'user_citizen') {
      setPublicTab(targetTab || 'public-home');
      setNoticeMessage('일반 시민 모드로 전환되었습니다. 공개된 공약사업을 자유롭게 열람하실 수 있습니다.');
    } else {
      setAdminTab(targetTab || 'projects');
      if (defaultProjectId) {
        setAdminSelectedProjectId(defaultProjectId);
      }
      setNoticeMessage(`시연 모드 접속 성공: 해당 담당자(${targetTab === 'projects' ? '공약사업 관리' : targetTab === 'approvals' ? '검토·승인함' : '관리'}) 기능이 즉시 활성화되었습니다.`);
    }

    // 4초 후 알림 자동 숨김
    setTimeout(() => {
      setNoticeMessage(null);
    }, 4000);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans relative">
      {/* 1. 최상단 데모 역할 빠른 전환 바 */}
      <RoleSwitcher onRoleSwitchSuccess={handleRoleSwitchSuccess} />

      {/* 2. 남양주시 메인 헤더 (지자체 브랜딩 및 포털 모드 전환) */}
      <Header />

      {/* 시연 기능 작동 안내 토스트 알림 */}
      {noticeMessage && (
        <div className="bg-emerald-600 text-white text-xs font-bold py-2.5 px-4 shadow-md flex items-center justify-between animate-in slide-in-from-top duration-300">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              {noticeMessage}
            </span>
            <button
              type="button"
              onClick={() => setNoticeMessage(null)}
              className="text-white/80 hover:text-white text-xs ml-4"
            >
              ✕ 닫기
            </button>
          </div>
        </div>
      )}

      {/* 3. 모드별 메인 콘텐츠 */}
      {portalMode === 'admin' ? (
        <AdminLayout
          currentTab={adminTab}
          onTabChange={tab => setAdminTab(tab)}
          pendingCount={pendingCount}
        >
          {adminTab === 'dashboard' && <Dashboard onNavigate={handleAdminNavigate} />}
          {adminTab === 'projects' && (
            <ProjectList onNavigate={handleAdminNavigate} initialSelectedId={adminSelectedProjectId} />
          )}
          {adminTab === 'report' && (
            <ReportForm projectId={adminSelectedProjectId} onNavigate={handleAdminNavigate} />
          )}
          {adminTab === 'approvals' && (
            <ApprovalInbox onNavigate={handleAdminNavigate} initialProjectId={adminSelectedProjectId} />
          )}
          {adminTab === 'publish' && <PublicPublish onNavigate={handleAdminNavigate} />}
          {adminTab === 'reports-export' && <ReportsExport />}
          {adminTab === 'audit-logs' && <AuditLogs />}
        </AdminLayout>
      ) : (
        <PublicLayout currentTab={publicTab} onTabChange={tab => setPublicTab(tab)}>
          {publicTab === 'public-home' && <PublicHome onNavigate={handlePublicNavigate} />}
          {publicTab === 'public-map' && <PublicMapPage onNavigate={handlePublicNavigate} />}
          {publicTab === 'public-list' && <PublicList onNavigate={handlePublicNavigate} />}
          {publicTab === 'public-detail' && (
            <PublicDetail projectId={publicSelectedProjectId} onNavigate={handlePublicNavigate} />
          )}
          {publicTab === 'public-ai' && <PublicAiSearch onNavigate={handlePublicNavigate} />}
        </PublicLayout>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
