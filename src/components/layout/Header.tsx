import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Building2, Globe, Lock, AlertCircle } from 'lucide-react';

export const Header: React.FC = () => {
  const { portalMode, setPortalMode } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* 법적 및 시연용 데이터 경고 배너 */}
      <div className="bg-blue-50 text-blue-900 border-b border-blue-100 px-3 py-1.5 text-[11px] sm:text-xs text-center flex items-center justify-center gap-1.5 leading-tight">
        <AlertCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
        <span>본 화면은 <strong>시연용 가상 데이터</strong>를 활용한 민선9기 공약 통합관리 시스템 데모입니다.</span>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
        {/* 브랜드 로고 및 시스템 타이틀 */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 flex items-center justify-center text-white shadow-md shrink-0">
            <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 shrink-0">남양주시</span>
              <h1 className="text-sm sm:text-base lg:text-lg font-bold text-slate-900 tracking-tight truncate leading-tight">
                민선9기 공약사업 통합관리 시스템
              </h1>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 hidden sm:block mt-0.5">
              부서별 입력부터 국 검토, 정책팀 승인 및 투명한 시민 공개까지
            </p>
          </div>
        </div>

        {/* 내부 행정 ↔ 시민 대시보드 전환 탭 (모바일에서는 2칸 균등 분할) */}
        <div className="w-full sm:w-auto shrink-0">
          <div className="bg-slate-100 p-1 rounded-xl grid grid-cols-2 sm:flex sm:items-center gap-1 border border-slate-200">
            <button
              type="button"
              id="header-tab-public"
              onClick={() => setPortalMode('public')}
              className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                portalMode === 'public'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
              <span>시민 공개 대시보드</span>
            </button>

            <button
              type="button"
              id="header-tab-admin"
              onClick={() => setPortalMode('admin')}
              className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                portalMode === 'admin'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
              <span>내부 행정관리 포털</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
