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

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* 1. 최상단 데모 역할 빠른 전환 바 */}
      <RoleSwitcher />

      {/* 2. 남양주시 메인 헤더 (지자체 브랜딩 및 포털 모드 전환) */}
      <Header />

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
