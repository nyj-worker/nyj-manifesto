import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { PublicProjectView } from '../../types/index.ts';
import { StatusBadge } from './StatusBadge.tsx';
import {
  X,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Camera,
  Clock,
  AlertCircle
} from 'lucide-react';

interface PublicDetailModalProps {
  projectId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PublicDetailModal: React.FC<PublicDetailModalProps> = ({
  projectId,
  isOpen,
  onClose
}) => {
  const { apiFetch } = useAuth();
  const [project, setProject] = useState<PublicProjectView | null>(null);
  const [loading, setLoading] = useState(false);
  const [activePhotoTab, setActivePhotoTab] = useState<'after' | 'before' | 'plan'>('after');
  
  // 전체화면 및 확대/축소 상태
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100); // 100%, 115%, 130%, 150%

  useEffect(() => {
    if (isOpen && projectId) {
      loadDetail(projectId);
      // 모달이 열릴 때 기본 배율 및 일반 크기로 초기화
      setZoomLevel(100);
      setIsFullscreen(false);
    } else {
      setProject(null);
    }
  }, [isOpen, projectId]);

  // ESC 키로 모달 닫기 지원
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const loadDetail = async (id: string) => {
    try {
      setLoading(true);
      const res = await apiFetch(`/api/public/projects/${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.project) {
          const p = data.project;
          const safeSummary = p.easySummary || {
            what: p.purpose || `${p.title} 사업입니다.`,
            who: '남양주시민 및 대중교통 이용자',
            where: p.location?.address || `${p.location?.dong || '남양주시'} 일원`,
            when: p.period || '민선9기 임기 내',
            progress: p.executionStatus || '정상추진 중',
            next: '세부 계획 수립 및 공정별 단계적 추진 예정'
          };
          setProject({
            ...p,
            easySummary: safeSummary
          });
        } else {
          setProject(null);
        }
      } else {
        setProject(null);
      }
    } catch (err) {
      console.error('공약 상세 모달 로드 실패:', err);
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 15, 150));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 15, 85));
  };

  const handleZoomReset = () => {
    setZoomLevel(100);
  };

  // 배율에 따른 스타일 클래스 및 스케일 스타일 적용
  const zoomStyle: React.CSSProperties = {
    zoom: `${zoomLevel}%`
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={e => {
        // 백드롭 클릭 시 닫기 (내부 클릭 제외)
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`bg-white shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isFullscreen
            ? 'w-full h-full rounded-none fixed inset-0'
            : 'w-full max-w-4xl max-h-[92vh] rounded-3xl border border-slate-200'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* 모달 상단 컨트롤 툴바 */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white shrink-0 select-none">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-100 truncate max-w-[200px] sm:max-w-md">
              {project ? `[${project.manageNo}] ${project.title}` : '공약 상세 정보'}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* 확대/축소 줌 컨트롤러 */}
            <div className="flex items-center bg-white/10 rounded-xl px-1.5 py-1 text-xs border border-white/15">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 85}
                title="글자 및 화면 축소"
                className="p-1 text-slate-300 hover:text-white disabled:opacity-40 transition-colors"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleZoomReset}
                title="기본 배율(100%)로 복원"
                className="px-1.5 py-0.5 text-[11px] font-bold text-cyan-300 hover:text-white transition-colors flex items-center gap-0.5"
              >
                <span>{zoomLevel}%</span>
                <RotateCcw className="w-2.5 h-2.5 opacity-60" />
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 150}
                title="글자 및 화면 확대"
                className="p-1 text-slate-300 hover:text-white disabled:opacity-40 transition-colors"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 전체화면 토글 버튼 */}
            <button
              type="button"
              onClick={() => setIsFullscreen(prev => !prev)}
              title={isFullscreen ? '일반 창 크기로 복원' : '전체화면 모드로 보기'}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* 닫기 버튼 */}
            <button
              type="button"
              onClick={onClose}
              title="창 닫기 (ESC)"
              className="p-2 rounded-xl bg-white/10 hover:bg-rose-600 text-slate-200 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 모달 스크롤 본문 */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 bg-slate-50 space-y-6">
          {loading ? (
            <div className="py-24 text-center text-slate-400">
              <Clock className="w-9 h-9 animate-spin mx-auto text-blue-600 mb-2.5" />
              <p className="text-sm font-semibold">공약 상세정보를 불러오는 중입니다...</p>
            </div>
          ) : !project ? (
            <div className="py-20 text-center space-y-4 max-w-md mx-auto">
              <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">공약 정보를 불러올 수 없습니다</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                해당 사업이 아직 시민 포털에 공식 게시되지 않았거나, 일시적인 데이터 조회 지연일 수 있습니다.
              </p>
            </div>
          ) : (
            <div style={zoomStyle} className="space-y-6 transition-all duration-200">
              {/* 1. 메인 타이틀 및 3대 지표 카드 */}
              <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 font-extrabold text-xs border border-blue-200">
                    관리번호 {project.manageNo}
                  </span>
                  <div className="flex items-center gap-2">
                    <StatusBadge type="execution" status={project.executionStatus} />
                    <span className="text-xs text-slate-400">공식 게시일: {project.publishedAt || '2026-09-30'}</span>
                  </div>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {project.title}
                </h2>

                {/* 3대 핵심 지표 요약 바 */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-center">
                  <div className="p-3 bg-slate-50 rounded-2xl">
                    <span className="text-xs text-slate-500">성과목표 달성률</span>
                    <p className="text-lg font-black text-blue-700 mt-0.5">
                      {project.indicatorAchievementRate ?? 0}%
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl">
                    <span className="text-xs text-slate-500">예산 집행률</span>
                    <p className="text-lg font-black text-purple-700 mt-0.5">
                      {project.budgetExecutionRate ?? 0}%
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl">
                    <span className="text-xs text-slate-500">추진 상태</span>
                    <p className="text-lg font-black text-emerald-700 mt-0.5">{project.executionStatus}</p>
                  </div>
                </div>
              </div>

              {/* 2. 6하원칙 쉬운말 공약 설명 */}
              <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">시민을 위한 쉬운말 공약 안내</h3>
                    <p className="text-xs text-slate-500">어려운 행정 용어를 알기 쉽게 6가지 질문으로 풀어 설명합니다.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                  <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-1">
                    <strong className="text-blue-900 text-sm">Q. 어떤 사업인가요?</strong>
                    <p className="text-slate-800 leading-relaxed">{project.easySummary?.what || project.purpose}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-1">
                    <strong className="text-emerald-900 text-sm">Q. 누구에게 도움이 되나요?</strong>
                    <p className="text-slate-800 leading-relaxed">{project.easySummary?.who || '남양주시민'}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-1">
                    <strong className="text-purple-900 text-sm">Q. 어디에서 진행되나요?</strong>
                    <p className="text-slate-800 leading-relaxed">
                      {project.easySummary?.where || project.location?.address || `${project.location?.dong || '남양주시'} 일원`}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 space-y-1">
                    <strong className="text-amber-900 text-sm">Q. 언제 진행되나요?</strong>
                    <p className="text-slate-800 leading-relaxed">{project.easySummary?.when || project.period}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-cyan-50/60 border border-cyan-100 space-y-1">
                    <strong className="text-cyan-900 text-sm">Q. 현재 얼마나 진행됐나요?</strong>
                    <p className="text-slate-800 leading-relaxed">{project.easySummary?.progress || project.executionStatus}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-1">
                    <strong className="text-indigo-900 text-sm">Q. 앞으로 무엇이 남았나요?</strong>
                    <p className="text-slate-800 leading-relaxed">{project.easySummary?.next || '향후 세부 계획 추진'}</p>
                  </div>
                </div>
              </div>

              {/* 3. 현장 사진 및 계획도면 비교 */}
              <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-blue-600" />
                    <h3 className="text-base font-bold text-slate-900">현장 사진 및 계획도면 비교</h3>
                  </div>

                  {project.photos && (
                    <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
                      {project.photos.afterUrl && (
                        <button
                          type="button"
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
                          type="button"
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
                          type="button"
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
                    <div className="w-full h-72 sm:h-80 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
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
                      📷 {project.photos.caption || `${project.title} 공식 제공 사진`} (데모 자료)
                    </p>
                  </div>
                ) : (
                  <div className="py-10 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    등록된 공식 현장 사진이나 조감도가 없습니다.
                  </div>
                )}
              </div>

              {/* 4. 사업 상세 및 예산 안내 */}
              <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-4">
                <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
                  사업 상세 및 예산 안내
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-slate-50 rounded-2xl space-y-2 border border-slate-200">
                    <p><strong>• 소관 조직:</strong> {project.bureauName} {project.departmentName} {project.teamName}</p>
                    <p><strong>• 사업 기간:</strong> {project.period}</p>
                    <p><strong>• 대상 지역:</strong> {project.location?.address || project.location?.dong || '남양주시 일원'}</p>
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
          )}
        </div>

        {/* 모달 하단 닫기 바 */}
        <div className="px-5 py-3 bg-white border-t border-slate-200 flex items-center justify-between shrink-0 text-xs">
          <span className="text-slate-400">
            {isFullscreen ? '🖥️ 전체화면 모드 작동 중' : '💡 상단 도구 모음에서 확대 및 전체화면 가능'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition-colors shadow-xs"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
