import React from 'react';
import { Home, MapPin, Search, Sparkles } from 'lucide-react';

interface PublicLayoutProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({
  currentTab,
  onTabChange,
  children
}) => {
  const navItems = [
    { id: 'public-home', label: '공약 이행 현황', icon: Home },
    { id: 'public-map', label: '우리 동네 공약 지도', icon: MapPin },
    { id: 'public-list', label: '공약 검색 및 목록', icon: Search },
    { id: 'public-ai', label: '쉬운말 AI 맞춤 안내', icon: Sparkles }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* 시민 포털 비주얼 헤더 */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white py-5 sm:py-8 px-3 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-full bg-blue-500/30 text-blue-200 text-[11px] sm:text-xs font-semibold mb-1.5 sm:mb-2 border border-blue-400/30">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300" /> 투명하고 알기 쉬운 시민 소통
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight leading-tight">
              남양주시 민선9기 시민 공약 대시보드
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 leading-relaxed">
              시민과의 약속을 투명하게 공개하고, 우리 동네 사업의 추진 과정을 지도와 쉬운말로 안내합니다.
            </p>
          </div>

          <div className="flex items-center gap-3 text-[11px] sm:text-xs text-slate-300 bg-white/10 px-3 py-2 rounded-xl backdrop-blur-xs border border-white/15 w-fit">
            <div>
              <p className="text-slate-400">데이터 기준일</p>
              <p className="font-semibold text-white">2026년 9월 30일 기준</p>
            </div>
            <div className="h-6 w-px bg-white/20"></div>
            <div>
              <p className="text-slate-400">제공 데이터</p>
              <p className="font-semibold text-emerald-300">공식 승인 확정 자료</p>
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 (모바일 가로 스와이프 지원 및 스크롤바 숨김) */}
        <div className="max-w-7xl mx-auto mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-white/10 flex space-x-1.5 sm:space-x-4 overflow-x-auto no-scrollbar">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap shrink-0 transition-all ${
                  isActive
                    ? 'bg-white text-blue-900 font-bold shadow-lg scale-102'
                    : 'text-slate-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-blue-700' : 'text-slate-300'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 시민 메인 콘텐츠 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* 푸터 */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>남양주시 민선9기 공약사업 통합관리 시스템 | 본 포털에 수록된 모든 정보는 최종 승인을 거쳐 게시된 공식 자료입니다.</p>
        <p className="mt-1">© 2026 Namyangju City. All rights reserved.</p>
      </footer>
    </div>
  );
};
