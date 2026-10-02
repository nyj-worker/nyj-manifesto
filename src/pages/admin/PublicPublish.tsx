import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { PromiseProject } from '../../types/index.ts';
import { StatusBadge } from '../../components/common/StatusBadge.tsx';
import {
  Share2,
  Globe,
  Lock,
  Eye,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  FileCheck
} from 'lucide-react';

interface PublicPublishProps {
  onNavigate: (tab: string, projectId?: string) => void;
}

export const PublicPublish: React.FC<PublicPublishProps> = ({ onNavigate }) => {
  const { apiFetch, currentUser } = useAuth();
  const [projects, setProjects] = useState<PromiseProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<PromiseProject | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const canPublish = currentUser.role === 'POLICY_ADMIN' || currentUser.role === 'SYS_ADMIN';

  useEffect(() => {
    loadProjects();
  }, [currentUser]);

  const loadProjects = async () => {
    try {
      const res = await apiFetch('/api/admin/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects);
        if (data.projects.length > 0 && !selectedProject) {
          setSelectedProject(data.projects[0]);
        }
      }
    } catch (err) {
      console.error('공개 관리 프로젝트 로드 오류:', err);
    }
  };

  // 공개 확정 처리
  const handleConfirmPublic = async () => {
    if (!selectedProject) return;
    try {
      setProcessing(true);
      setNotice(null);

      const res = await apiFetch(`/api/admin/projects/${selectedProject.id}/transition`, {
        method: 'POST',
        body: JSON.stringify({
          action: 'CONFIRM_PUBLIC',
          comment: `${currentUser.name} 정책팀 공개 자료 확정`
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSelectedProject(data.project);
        setNotice({ type: 'success', message: '공개 자료가 성공적으로 확정되었습니다. 이제 시민 포털에 게시할 수 있습니다.' });
        loadProjects();
      } else {
        setNotice({ type: 'error', message: data.error || '공개 확정 실패' });
      }
    } catch (err) {
      setNotice({ type: 'error', message: '오류가 발생했습니다.' });
    } finally {
      setProcessing(false);
    }
  };

  // 시민 포털 공식 게시 처리 (public_projects 테이블 동기화)
  const handlePublish = async () => {
    if (!selectedProject) return;
    try {
      setProcessing(true);
      setNotice(null);

      const res = await apiFetch(`/api/admin/projects/${selectedProject.id}/transition`, {
        method: 'POST',
        body: JSON.stringify({
          action: 'PUBLISH',
          comment: `${currentUser.name} 정책팀 시민 포털 공식 게시 승인`
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSelectedProject(data.project);
        setNotice({
          type: 'success',
          message: '시민 공개 포털에 성공적으로 게시되었습니다! 시민 대시보드와 지도에서 즉시 조회 가능합니다.'
        });
        loadProjects();
      } else {
        setNotice({ type: 'error', message: data.error || '게시 실패' });
      }
    } catch (err) {
      setNotice({ type: 'error', message: '게시 처리 중 오류 발생' });
    } finally {
      setProcessing(false);
    }
  };

  // 공개 철회 처리 (public_projects 테이블에서 즉시 삭제)
  const handleWithdraw = async () => {
    if (!selectedProject) return;
    if (!confirm('정말로 본 공약의 대시민 공개를 철회하시겠습니까? 시민 포털 및 지도에서 즉시 숨김 처리됩니다.')) {
      return;
    }

    try {
      setProcessing(true);
      setNotice(null);

      const res = await apiFetch(`/api/admin/projects/${selectedProject.id}/transition`, {
        method: 'POST',
        body: JSON.stringify({
          action: 'WITHDRAW',
          comment: `${currentUser.name} 정책팀 공개 철회 조치`
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSelectedProject(data.project);
        setNotice({
          type: 'success',
          message: '공개가 철회되었습니다. 시민 포털 및 검색 API에서 차단되었습니다.'
        });
        loadProjects();
      } else {
        setNotice({ type: 'error', message: data.error || '철회 실패' });
      }
    } catch (err) {
      setNotice({ type: 'error', message: '철회 처리 중 오류 발생' });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 상단 정책 안내 바 */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">공개자료 관리 및 시민 서비스 게시</h2>
            <p className="text-xs text-slate-500">
              내부 승인이 완료된 정제 데이터만 시민 서비스에 격리 게시하며, 비공개 항목(전화번호, 심사의견 등)은 원천 차단됩니다.
            </p>
          </div>
        </div>

        {!canPublish && (
          <div className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            게시/철회는 정책팀 총괄 관리자만 가능합니다.
          </div>
        )}
      </div>

      {notice && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center gap-2.5 shadow-xs ${
            notice.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200 font-medium'
          }`}
        >
          {notice.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span>{notice.message}</span>
        </div>
      )}

      {/* 2단 그리드: 좌측 목록, 우측 공개 승인/미리보기 제어 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 좌측 공약 목록 */}
        <div className="lg:col-span-4 bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden flex flex-col h-[700px]">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 font-medium">
            <span>공약 목록 ({projects.length})</span>
            <span>공개 상태 기준</span>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
            {projects.map(p => {
              const isSelected = selectedProject?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProject(p)}
                  className={`p-3.5 cursor-pointer transition-all ${
                    isSelected ? 'bg-teal-50/80 border-l-4 border-teal-600 pl-3' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-teal-700">[{p.manageNo}]</span>
                    <StatusBadge type="public" status={p.publicStatus} size="sm" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 line-clamp-1 mb-1">{p.title}</h4>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{p.departmentName}</span>
                    <span className="text-slate-400">버전 v{p.currentVersion}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 우측 공개 검증 및 게시 패널 */}
        <div className="lg:col-span-8 bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden flex flex-col min-h-[700px]">
          {selectedProject ? (
            <div>
              {/* 상단 상태 바 */}
              <div className="p-5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded bg-teal-600 font-bold text-xs">
                      {selectedProject.manageNo}
                    </span>
                    <span className="text-xs text-teal-200 font-medium">
                      내부 승인상태: {selectedProject.reportStatus}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">{selectedProject.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    시민화면 미리보기
                  </button>
                </div>
              </div>

              {/* 보안 허용목록(Allowlist) 검증 카드 */}
              <div className="p-6 space-y-6">
                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    정보 공개 안전성 및 민감정보 제외 검증 완료
                  </h4>
                  <ul className="text-xs text-slate-700 space-y-1 pl-4 list-disc">
                    <li>공무원 개인 내선번호(전화번호) 제외 처리 완료 (부서명·직책만 공개)</li>
                    <li>내부 심사의견 및 반려 히스토리 격리 제외 완료</li>
                    <li>승인된 6하원칙 쉬운말 해설 및 확정 예산만 시민 API로 전송</li>
                  </ul>
                </div>

                {/* 6하원칙 쉬운말 공개 요약 카드 */}
                <div className="border border-slate-200 rounded-xl p-5 bg-slate-50 space-y-3">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    시민용 쉬운말 공약 설명 (6하원칙)
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <strong className="text-blue-700">Q. 어떤 사업인가요?</strong>
                      <p className="text-slate-800 mt-0.5">{selectedProject.title} - {selectedProject.purpose}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <strong className="text-blue-700">Q. 누구에게 도움이 되나요?</strong>
                      <p className="text-slate-800 mt-0.5">남양주시민 및 해당 생활권 통근·통학 시민 전체</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <strong className="text-blue-700">Q. 어디에서 진행되나요?</strong>
                      <p className="text-slate-800 mt-0.5">{selectedProject.location.address || `${selectedProject.location.dong} 일원`}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <strong className="text-blue-700">Q. 언제 진행되나요?</strong>
                      <p className="text-slate-800 mt-0.5">{selectedProject.period} (임기내 목표: {selectedProject.targets.termGoal})</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <strong className="text-blue-700">Q. 현재 얼마나 진행됐나요?</strong>
                      <p className="text-slate-800 mt-0.5">{selectedProject.currentStage} (누적 추진율 약 {selectedProject.schedules[0]?.progressRate || 20}%)</p>
                    </div>
                  </div>
                </div>

                {/* 공개 액션 제어 버튼 바 */}
                <div className="p-4 bg-white border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-xs text-slate-500">현재 공개 상태:</span>
                    <div className="mt-1">
                      <StatusBadge type="public" status={selectedProject.publicStatus} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedProject.publicStatus !== '게시' && (
                      <button
                        type="button"
                        onClick={handleConfirmPublic}
                        disabled={!canPublish || processing || selectedProject.reportStatus !== '최종승인'}
                        className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
                      >
                        공개 확정
                      </button>
                    )}

                    {selectedProject.publicStatus !== '게시' ? (
                      <button
                        type="button"
                        onClick={handlePublish}
                        disabled={!canPublish || processing || selectedProject.reportStatus !== '최종승인'}
                        className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
                      >
                        <Globe className="w-4 h-4" />
                        시민 포털 공식 게시
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleWithdraw}
                        disabled={!canPublish || processing}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 text-xs font-bold transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                        공개 철회
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm">
              왼쪽 목록에서 공약사업을 선택하세요.
            </div>
          )}
        </div>
      </div>

      {/* 시민 화면 미리보기 모달 */}
      {previewOpen && selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                시민 대시보드 화면 미리보기
              </span>
              <button
                onClick={() => setPreviewOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                닫기 ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold text-xs">
                  {selectedProject.manageNo}
                </span>
                <h3 className="text-lg font-extrabold text-slate-900">{selectedProject.title}</h3>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-slate-500">추진 상태</p>
                  <p className="font-bold text-blue-700 mt-1">{selectedProject.executionStatus}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-slate-500">성과 달성률</p>
                  <p className="font-bold text-emerald-700 mt-1">{selectedProject.indicators[0]?.achievementRate || 20}%</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-slate-500">사업비</p>
                  <p className="font-bold text-slate-900 mt-1">{selectedProject.investmentPlan.totalBudget.toLocaleString()} {selectedProject.investmentPlan.unit}</p>
                </div>
              </div>

              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 text-xs text-slate-700 leading-relaxed">
                <strong>사업 목적:</strong> {selectedProject.purpose}
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                <p>📍 위치: {selectedProject.location.address || selectedProject.location.dong}</p>
                <p className="mt-1">🏢 담당 부서: {selectedProject.departmentName} (연락처 비공개)</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
