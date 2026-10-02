import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  FileEdit,
  Inbox,
  Share2,
  FileSpreadsheet,
  History
} from 'lucide-react';

interface AdminLayoutProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  pendingCount?: number;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onTabChange,
  pendingCount = 0,
  children
}) => {
  const navItems = [
    { id: 'dashboard', label: '통합 현황', icon: LayoutDashboard },
    { id: 'projects', label: '공약사업 관리', icon: FolderKanban },
    { id: 'report', label: '추진실적 입력', icon: FileEdit },
    { id: 'approvals', label: '검토·승인함', icon: Inbox, badge: pendingCount },
    { id: 'publish', label: '공개자료 관리', icon: Share2 },
    { id: 'reports-export', label: '통계·보고서', icon: FileSpreadsheet },
    { id: 'audit-logs', label: '변경·승인 이력', icon: History }
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* 서브 네비게이션 바 */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-bold border-b-2 border-blue-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
};
