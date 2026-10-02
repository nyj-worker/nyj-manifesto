import React, { useState, useEffect } from 'react';
import { PublicProjectView } from '../../types/index.ts';
import { StatusBadge } from '../../components/common/StatusBadge.tsx';
import {
  CheckCircle2,
  TrendingUp,
  Coins,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Layers
} from 'lucide-react';

interface PublicHomeProps {
  onNavigate: (tab: string, projectId?: string) => void;
}

export const PublicHome: React.FC<PublicHomeProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<any>(null);
  const [recentProjects, setRecentProjects] = useState<PublicProjectView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPublicData();
  }, []);

  const loadPublicData = async () => {
    try {
      setLoading(true);
      const [statsRes, projectsRes] = await Promise.all([
        fetch('/api/public/stats'),
        fetch('/api/public/projects')
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      if (projectsRes.ok) {
        const projData = await projectsRes.json();
        setRecentProjects(projData.projects.slice(0, 4));
      }
    } catch (err) {
      console.error('시민 데이터 로드 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 3대 핵심 지표 엄격 분리 안내 배너 */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              데이터 기준일: 2026년 9월 30일
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
              남양주시 민선 9기 공약 이행 3대 종합지표
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              시민과의 신뢰를 위해 <strong>공약 완료율</strong>, <strong>성과목표 달성률</strong>, <strong>예산 집행률</strong>을 분리하여 투명하게 공개합니다.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('public-map')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all scale-100 hover:scale-102"
            >
              <MapPin className="w-4 h-4" />
              우리 동네 공약 지도 보기
            </button>
          </div>
        </div>

        {/* 3대 핵심 지표 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. 완료 공약 비율 */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/40 border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800">지표 ① 완료 공약 비율</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-emerald-700">{stats?.completionRate ?? 0}%</span>
              <span className="text-xs text-slate-500">
                ({stats?.completedCount ?? 0}건 / 총 {stats?.totalCount ?? 0}건)
              </span>
            </div>
            <div className="w-full bg-emerald-200/60 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all"
                style={{ width: `${stats?.completionRate ?? 0}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-600">
              전체 공약사업 중 최종 완료 판정을 받은 사업의 건수 비율입니다.
            </p>
          </div>

          {/* 2. 성과목표 달성률 */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/40 border border-blue-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-800">지표 ② 평균 성과 달성률</span>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-blue-700">{stats?.avgIndicatorAchievementRate ?? 0}%</span>
              <span className="text-xs text-slate-500">지표 산출 기준</span>
            </div>
            <div className="w-full bg-blue-200/60 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all"
                style={{ width: `${stats?.avgIndicatorAchievementRate ?? 0}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-600">
              사업별 구체적인 수치 지표(착공률, 개소수 등)의 목표 대비 진척도 평균입니다.
            </p>
          </div>

          {/* 3. 예산 집행률 */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50/40 border border-purple-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-800">지표 ③ 예산 집행률</span>
              <Coins className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-purple-700">{stats?.avgBudgetExecutionRate ?? 0}%</span>
              <span className="text-xs text-slate-500">기투자 집행 기준</span>
            </div>
            <div className="w-full bg-purple-200/60 h-2 rounded-full overflow-hidden">
              <div
                className="bg-purple-600 h-full rounded-full transition-all"
                style={{ width: `${stats?.avgBudgetExecutionRate ?? 0}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-600">
              총 계획 사업비 대비 현재까지 실제로 투입·집행된 재원의 비율입니다.
            </p>
          </div>
        </div>
      </div>

      {/* 2단 배너: 우리 동네 지도 & 쉬운말 AI 안내 바로가기 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 지도 카드 */}
        <div
          onClick={() => onNavigate('public-map')}
          className="bg-gradient-to-br from-blue-700 to-indigo-800 text-white rounded-3xl p-6 sm:p-8 cursor-pointer shadow-md hover:shadow-xl transition-all group relative overflow-hidden"
        >
          <div className="relative z-10 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <MapPin className="w-6 h-6 text-amber-300" />
            </div>
            <h3 className="text-xl font-bold">우리 동네 공약 지도</h3>
            <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
              별내동, 다산동, 진접읍, 화도읍 등 내 위치 반경(500m~5km) 안에서 펼쳐지는 공약사업을 지도에서 직관적으로 확인하세요.
            </p>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 pt-2 group-hover:translate-x-1 transition-transform">
              지도로 찾아보기 <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* 쉬운말 AI 설명 카드 */}
        <div
          onClick={() => onNavigate('public-ai')}
          className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 cursor-pointer shadow-md hover:shadow-xl transition-all group relative overflow-hidden"
        >
          <div className="relative z-10 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-cyan-300" />
            </div>
            <h3 className="text-xl font-bold">쉬운말 공약 AI 맞춤 안내</h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              어려운 행정 용어 대신 6하원칙 쉬운말로 설명해 드립니다. "아이를 위한 시설", "어르신 교통비 지원" 등 관심사별로 질문해 보세요.
            </p>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-cyan-300 pt-2 group-hover:translate-x-1 transition-transform">
              쉬운말 AI 질의하기 <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* 최근 공식 승인되어 게시된 주요 공약 */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">최근 게시된 주요 공약사업</h3>
          </div>
          <button
            onClick={() => onNavigate('public-list')}
            className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
          >
            전체 공약 보기 <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentProjects.map(p => (
            <div
              key={p.id}
              onClick={() => onNavigate('public-detail', p.id)}
              className="p-5 rounded-2xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 cursor-pointer transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                  [{p.manageNo}]
                </span>
                <StatusBadge type="execution" status={p.executionStatus} size="sm" />
              </div>
              <h4 className="text-base font-bold text-slate-900 line-clamp-1">{p.title}</h4>
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {p.easySummary.what}
              </p>
              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200/60">
                <span>📍 {p.location.dong}</span>
                <span className="font-semibold text-slate-700">진척도 {p.indicatorAchievementRate}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
