import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { StatusBadge } from '../../components/common/StatusBadge.tsx';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  ShieldCheck,
  Building
} from 'lucide-react';

import { getClientDashboardStats } from '../../services/clientStorage.ts';

interface DashboardStats {
  totalCount: number;
  executionStats: Record<string, number>;
  reportStats: Record<string, number>;
  publicStats: Record<string, number>;
  departments: Array<{
    name: string;
    bureau: string;
    total: number;
    delayed: number;
    completed: number;
    pendingReview: number;
  }>;
  delayedProjects: Array<{
    id: string;
    manageNo: string;
    title: string;
    departmentName: string;
    issues: string;
    lastUpdated: string;
  }>;
  pendingApprovals: Array<{
    id: string;
    manageNo: string;
    title: string;
    bureauId: string;
    departmentName: string;
    reportStatus: string;
    managerName: string;
    lastUpdated: string;
  }>;
  recentLogs: Array<{
    id: string;
    actor_name: string;
    actor_role: string;
    action: string;
    details: string;
    timestamp: string;
  }>;
}

export const Dashboard: React.FC<{ onNavigate: (tab: string, projectId?: string) => void }> = ({ onNavigate }) => {
  const { apiFetch, currentUser } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [currentUser]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/admin/dashboard-stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        // Vercel 등 백엔드 통신 오류 시 즉시 클라이언트 데이터로 안전 복구
        setStats(getClientDashboardStats());
      }
    } catch (err) {
      console.warn('백엔드 대시보드 통계 로드 실패, 클라이언트 스토리지로 복구합니다:', err);
      setStats(getClientDashboardStats());
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <Clock className="w-6 h-6 animate-spin mr-2 text-blue-600" /> 통계 데이터 집계 중...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 최상단 환영 및 요약 헤더 */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
              민선9기 종합상황실
            </span>
            <span className="text-xs text-slate-400">최종 데이터 기준일: 2026.09.30</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {currentUser.name} {currentUser.role !== 'CITIZEN' ? `(${currentUser.departmentName})` : ''} 님, 환영합니다.
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            남양주시 총 {stats.totalCount}개 공약과제의 추진 현황과 검토·승인 업무를 한눈에 파악하세요.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onNavigate('approvals')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-xs transition-colors"
          >
            <ShieldCheck className="w-4 h-4" />
            검토·승인함 바로가기
            {stats.pendingApprovals.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 text-xs font-extrabold">
                {stats.pendingApprovals.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 4대 핵심 KPI 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 전체 공약 */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-500">총 관리 공약</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{stats.totalCount}</span>
            <span className="text-xs text-slate-500">건</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>시민 공개 게시:</span>
            <strong className="text-teal-600">{stats.publicStats['게시'] || 0}건</strong>
          </div>
        </div>

        {/* 정상 추진 */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-500">정상 추진</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-blue-600">{stats.executionStats['정상추진'] || 0}</span>
            <span className="text-xs text-slate-500">건</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>추진율:</span>
            <strong className="text-blue-600">
              {Math.round(((stats.executionStats['정상추진'] || 0) / stats.totalCount) * 100)}%
            </strong>
          </div>
        </div>

        {/* 지연 및 쟁점 */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-500">지연 / 중점관리</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600">{stats.executionStats['지연'] || 0}</span>
            <span className="text-xs text-slate-500">건</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>대책 수립 중:</span>
            <strong className="text-amber-600">{stats.delayedProjects.length}건</strong>
          </div>
        </div>

        {/* 완료 */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-500">이행 완료</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600">{stats.executionStats['완료'] || 0}</span>
            <span className="text-xs text-slate-500">건</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>완료율:</span>
            <strong className="text-emerald-600">
              {Math.round(((stats.executionStats['완료'] || 0) / stats.totalCount) * 100)}%
            </strong>
          </div>
        </div>
      </div>

      {/* 중단 2단 그리드: 검토 대기 및 지연 사업 경보 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. 검토·승인 대기 건 */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900">검토·승인 대기 목록</h3>
            </div>
            <button
              onClick={() => onNavigate('approvals')}
              className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
            >
              전체보기 <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {stats.pendingApprovals.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              현재 대기 중인 검토·승인 문서가 없습니다.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {stats.pendingApprovals.map(item => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-600">[{item.manageNo}]</span>
                      <h4 className="text-sm font-semibold text-slate-800 line-clamp-1">{item.title}</h4>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.departmentName} · 담당: {item.managerName} · {item.lastUpdated}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <StatusBadge type="report" status={item.reportStatus as any} size="sm" />
                    <button
                      onClick={() => onNavigate('approvals', item.id)}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                    >
                      검토
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. 지연 사업 현황 및 쟁점사항 경보 */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-slate-900">지연 사업 및 쟁점사항 관리</h3>
            </div>
            <button
              onClick={() => onNavigate('projects')}
              className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
            >
              사업목록 <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {stats.delayedProjects.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              지연된 공약사업이 없습니다.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {stats.delayedProjects.map(item => (
                <div key={item.id} className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-600">[{item.manageNo}]</span>
                      <h4 className="text-sm font-semibold text-slate-800">{item.title}</h4>
                    </div>
                    <span className="text-xs text-slate-400">{item.departmentName}</span>
                  </div>
                  <p className="text-xs text-slate-600 bg-amber-50/70 p-2.5 rounded-lg mt-2 border border-amber-200/50">
                    <strong>쟁점:</strong> {item.issues}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 부서별 공약 추진 현황 표 */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-slate-700" />
            <h3 className="font-bold text-slate-900">부서별 공약과제 추진 현황</h3>
          </div>
          <span className="text-xs text-slate-500">교통국 산하 4개 과 중심</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">소관 부서</th>
                <th className="py-3 px-4">실국</th>
                <th className="py-3 px-4 text-center">총 과제수</th>
                <th className="py-3 px-4 text-center">정상추진</th>
                <th className="py-3 px-4 text-center">지연(중점)</th>
                <th className="py-3 px-4 text-center">완료</th>
                <th className="py-3 px-4 text-center">검토대기</th>
                <th className="py-3 px-4 text-center">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.departments.map(dept => {
                const normal = dept.total - dept.delayed - dept.completed;
                return (
                  <tr key={dept.name} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800">{dept.name}</td>
                    <td className="py-3 px-4 text-slate-500 text-xs">{dept.bureau}</td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-900">{dept.total}건</td>
                    <td className="py-3 px-4 text-center text-blue-600 font-semibold">{normal}건</td>
                    <td className="py-3 px-4 text-center text-amber-600 font-semibold">{dept.delayed}건</td>
                    <td className="py-3 px-4 text-center text-emerald-600 font-semibold">{dept.completed}건</td>
                    <td className="py-3 px-4 text-center">
                      {dept.pendingReview > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
                          {dept.pendingReview}건
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onNavigate('projects')}
                        className="text-xs text-blue-600 hover:underline font-medium"
                      >
                        사업조회
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
