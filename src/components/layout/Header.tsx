import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Building2, Globe, Lock, AlertCircle } from 'lucide-react';

export const Header: React.FC = () => {
  const { portalMode, setPortalMode, currentUser } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* 법적 및 시연용 데이터 경고 배너 */}
      <div className="bg-blue-50 text-blue-900 border-b border-blue-100 px-4 py-1 text-xs text-center flex items-center justify-center gap-1.5">
        <AlertCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
        <span>본 화면은 <strong>시연용 가상 데이터</strong>를 활용한 민선9기 공약 통합관리 시스템 데모이며, 남양주시 공식 통계나 확정 공약과 다를 수 있습니다.</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* 브랜드 로고 및 시스템 타이틀 */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 flex items-center justify-center text-white shadow-md">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">남양주시</span>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">민선9기 공약사업 통합관리 시스템</h1>
            </div>
            <p className="text-xs text-slate-500">부서별 입력부터 국 검토, 정책팀 승인 및 투명한 시민 공개까지</p>
          </div>
        </div>

        {/* 내부 행정 ↔ 시민 대시보드 전환 탭 */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setPortalMode('public')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                portalMode === 'public'
                  ? 'bg-white text-blue-700 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-4 h-4 text-emerald-600" />
              시민 공개 대시보드
            </button>

            <button
              type="button"
              onClick={() => setPortalMode('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                portalMode === 'admin'
                  ? 'bg-white text-blue-700 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Lock className="w-4 h-4 text-blue-600" />
              내부 행정관리 포털
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
