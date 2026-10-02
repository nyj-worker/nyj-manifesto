import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { PublicProjectView } from '../../types/index.ts';
import { StatusBadge } from '../../components/common/StatusBadge.tsx';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Building,
  Coins,
  Sparkles,
  Camera,
  AlertCircle,
  CheckCircle2,
  Clock,
  Share2
} from 'lucide-react';

interface PublicDetailProps {
  projectId: string;
  onNavigate: (tab: string, projectId?: string) => void;
}

export const PublicDetail: React.FC<PublicDetailProps> = ({ projectId, onNavigate }) => {
  const { apiFetch } = useAuth();
  const [project, setProject] = useState<PublicProjectView | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhotoTab, setActivePhotoTab] = useState<'after' | 'before' | 'plan'>('after');

  useEffect(() => {
    loadDetail();
  }, [projectId]);

  const loadDetail = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/api/public/projects/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data.project);
      }
    } catch (err) {
      console.error('상세 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !project) {
    return (
      <div className="py-20 text-center text-slate-400">
        <Clock className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
        공약 상세정보를 불러오는 중입니다...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 상단 뒤로가기 버튼 */}
      <button
        onClick={() => onNavigate('public-list')}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> 전체 공약 목록으로 돌아가기
      </button>

      {/* 메인 헤더 카드 */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 font-extrabold text-xs border border-blue-200">
            관리번호 {project.manageNo}
          </span>
          <div className="flex items-center gap-2">
            <StatusBadge type="execution" status={project.executionStatus} />
            <span className="text-xs text-slate-400">공식 게시일: {project.publishedAt}</span>
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {project.title}
        </h2>

        {/* 3대 핵심 지표 요약 바 */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-center">
          <div className="p-3 bg-slate-50 rounded-2xl">
            <span className="text-xs text-slate-500">성과목표 달성률</span>
            <p className="text-lg font-black text-blue-700 mt-0.5">{project.indicatorAchievementRate}%</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl">
            <span className="text-xs text-slate-500">예산 집행률</span>
            <p className="text-lg font-black text-purple-700 mt-0.5">{project.budgetExecutionRate}%</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl">
            <span className="text-xs text-slate-500">추진 상태</span>
            <p className="text-lg font-black text-emerald-700 mt-0.5">{project.executionStatus}</p>
          </div>
        </div>
      </div>

      {/* 6하원칙 쉬운말 공약 설명 (핵심 UX) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200 space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">시민을 위한 쉬운말 공약 안내</h3>
            <p className="text-xs text-slate-500">어려운 행정 용어를 알기 쉽게 6가지 질문으로 풀어 설명합니다.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-1">
            <strong className="text-blue-900 text-sm">Q. 어떤 사업인가요?</strong>
            <p className="text-slate-800 leading-relaxed">{project.easySummary.what}</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-1">
            <strong className="text-emerald-900 text-sm">Q. 누구에게 도움이 되나요?</strong>
            <p className="text-slate-800 leading-relaxed">{project.easySummary.who}</p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-1">
            <strong className="text-purple-900 text-sm">Q. 어디에서 진행되나요?</strong>
            <p className="text-slate-800 leading-relaxed">{project.easySummary.where}</p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 space-y-1">
            <strong className="text-amber-900 text-sm">Q. 언제 진행되나요?</strong>
            <p className="text-slate-800 leading-relaxed">{project.easySummary.when}</p>
          </div>

          <div className="p-4 rounded-2xl bg-cyan-50/60 border border-cyan-100 space-y-1">
            <strong className="text-cyan-900 text-sm">Q. 현재 얼마나 진행됐나요?</strong>
            <p className="text-slate-800 leading-relaxed">{project.easySummary.progress}</p>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-1">
            <strong className="text-indigo-900 text-sm">Q. 앞으로 무엇이 남았나요?</strong>
            <p className="text-slate-800 leading-relaxed">{project.easySummary.next}</p>
          </div>
        </div>
      </div>

      {/* 공사 현장 전후 사진 및 조감도 비교 뷰어 */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">현장 사진 및 계획도면 비교</h3>
          </div>

          {project.photos && (
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
              {project.photos.afterUrl && (
                <button
                  onClick={() => setActivePhotoTab('after')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    activePhotoTab === 'after' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  현재/완공 모습
                </button>
              )}
              {project.photos.beforeUrl && (
                <button
                  onClick={() => setActivePhotoTab('before')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    activePhotoTab === 'before' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  착공 전 모습
                </button>
              )}
              {project.photos.planUrl && (
                <button
                  onClick={() => setActivePhotoTab('plan')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    activePhotoTab === 'plan' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  조감도/노선도
                </button>
              )}
            </div>
          )}
        </div>

        {project.photos ? (
          <div className="space-y-3">
            <div className="w-full h-80 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={
                  activePhotoTab === 'after'
                    ? project.photos.afterUrl || project.photos.planUrl
                    : activePhotoTab === 'before'
                    ? project.photos.beforeUrl
                    : project.photos.planUrl
                }
                alt={project.photos.caption || project.title}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-xs text-slate-500 text-center">
              📷 {project.photos.caption || `${project.title} 공식 제공 사진`} (공식 승인 자료)
            </p>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            등록된 공식 현장 사진이나 조감도가 없습니다.
          </div>
        )}
      </div>

      {/* 사업 기본정보 및 예산 상세 */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100">
          사업 상세 및 예산 안내
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl space-y-2 border border-slate-200">
            <p><strong>• 소관 조직:</strong> {project.bureauName} {project.departmentName} {project.teamName}</p>
            <p><strong>• 사업 기간:</strong> {project.period}</p>
            <p><strong>• 대상 지역:</strong> {project.location.address || project.location.dong}</p>
            {project.overviewVolume && <p><strong>• 사업 규모:</strong> {project.overviewVolume}</p>}
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl space-y-2 border border-slate-200">
            <p><strong>• 총 사업비:</strong> {project.totalBudgetDesc}</p>
            <p><strong>• 데이터 기준일:</strong> {project.dataBaseDate}</p>
            <p><strong>• 공개 버전:</strong> v{project.publicVersion}</p>
            <p className="text-slate-400">※ 내부 심사 의견 및 개인 연락처는 비공개 처리됩니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
