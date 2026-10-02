import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { PromiseProject, ApprovalHistory } from '../../types/index.ts';
import { StatusBadge } from '../../components/common/StatusBadge.tsx';
import {
  Inbox,
  CheckCircle,
  XCircle,
  FileText,
  AlertCircle,
  UserCheck,
  ArrowRight,
  MessageSquare,
  Clock,
  Sparkles
} from 'lucide-react';

interface ApprovalInboxProps {
  onNavigate: (tab: string, projectId?: string) => void;
  initialProjectId?: string;
}

export const ApprovalInbox: React.FC<ApprovalInboxProps> = ({ onNavigate, initialProjectId }) => {
  const { apiFetch, currentUser } = useAuth();
  const [projects, setProjects] = useState<PromiseProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<PromiseProject | null>(null);
  const [history, setHistory] = useState<ApprovalHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionProcessing, setActionProcessing] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // 모달 상태
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [comment, setComment] = useState('');

  useEffect(() => {
    loadInbox();
  }, [currentUser]);

  const loadInbox = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/admin/projects');
      if (res.ok) {
        const data = await res.json();
        // 검토 대기 중인 프로젝트 필터링
        const pending = data.projects.filter((p: PromiseProject) => {
          if (currentUser.role === 'BUREAU_ADMIN') {
            return p.bureauId === currentUser.bureauId && p.reportStatus === '국검토대기';
          }
          if (currentUser.role === 'POLICY_ADMIN') {
            return p.reportStatus === '정책팀검토대기';
          }
          if (currentUser.role === 'SYS_ADMIN') {
            return p.reportStatus === '국검토대기' || p.reportStatus === '정책팀검토대기';
          }
          // 기타 역할은 대기 문서 전체 목록 확인 가능
          return p.reportStatus === '국검토대기' || p.reportStatus === '정책팀검토대기';
        });

        setProjects(pending);

        if (initialProjectId) {
          const found = pending.find((p: PromiseProject) => p.id === initialProjectId);
          if (found) loadDetail(found.id);
          else if (pending.length > 0) loadDetail(pending[0].id);
        } else if (pending.length > 0) {
          loadDetail(pending[0].id);
        } else {
          setSelectedProject(null);
        }
      }
    } catch (err) {
      console.error('검토함 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (id: string) => {
    try {
      const res = await apiFetch(`/api/admin/projects/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedProject(data.project);
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error('상세 로드 실패:', err);
    }
  };

  // 승인 처리 (국 승인 or 정책팀 최종승인)
  const handleApprove = async () => {
    if (!selectedProject) return;
    try {
      setActionProcessing(true);
      setNotice(null);

      const action = selectedProject.reportStatus === '국검토대기' ? 'BUREAU_APPROVE' : 'POLICY_APPROVE';

      const res = await apiFetch(`/api/admin/projects/${selectedProject.id}/transition`, {
        method: 'POST',
        body: JSON.stringify({
          action,
          comment: comment || `${currentUser.name}(${currentUser.role}) 승인 완료`
        })
      });

      const data = await res.json();
      if (res.ok) {
        setNotice({
          type: 'success',
          message: action === 'BUREAU_APPROVE'
            ? '국 검토가 완료되어 정책팀으로 송부되었습니다.'
            : '정책팀 최종 승인이 완료되었습니다. [공개자료 관리]에서 시민 공개를 확정할 수 있습니다.'
        });
        setComment('');
        loadInbox();
      } else {
        setNotice({ type: 'error', message: data.error || '승인 처리 실패' });
      }
    } catch (err) {
      setNotice({ type: 'error', message: '승인 중 오류 발생' });
    } finally {
      setActionProcessing(false);
    }
  };

  // 반려 처리 (사유 필수)
  const handleRejectConfirm = async () => {
    if (!selectedProject) return;
    if (!rejectReason || rejectReason.trim() === '') {
      alert('보완 요청(반려) 사유를 반드시 입력해야 합니다.');
      return;
    }

    try {
      setActionProcessing(true);
      setNotice(null);

      const action = selectedProject.reportStatus === '국검토대기' ? 'BUREAU_REJECT' : 'POLICY_REJECT';

      const res = await apiFetch(`/api/admin/projects/${selectedProject.id}/transition`, {
        method: 'POST',
        body: JSON.stringify({
          action,
          comment: comment || '보완 요청 후 재제출 지시',
          rejectReason
        })
      });

      const data = await res.json();
      if (res.ok) {
        setNotice({
          type: 'success',
          message: `담당 부서로 보완 요청(반려) 처리되었습니다. (반려사유 기록 완료)`
        });
        setRejectModalOpen(false);
        setRejectReason('');
        setComment('');
        loadInbox();
      } else {
        setNotice({ type: 'error', message: data.error || '반려 처리 실패' });
      }
    } catch (err) {
      setNotice({ type: 'error', message: '반려 처리 중 오류 발생' });
    } finally {
      setActionProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 상단 안내 바 */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">공약 추진실적 검토·승인함</h2>
            <p className="text-xs text-slate-500">
              현재 접속자 권한: <strong className="text-purple-700 font-bold">{currentUser.role}</strong> ({currentUser.departmentName}) · 대기 건수 <strong>{projects.length}</strong>건
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 font-semibold border border-purple-200">
            1단계: 국 관리자 검토
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="px-2.5 py-1 rounded-md bg-sky-50 text-sky-700 font-semibold border border-sky-200">
            2단계: 정책팀 최종 승인
          </span>
        </div>
      </div>

      {/* 알림 메시지 */}
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
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span>{notice.message}</span>
        </div>
      )}

      {/* 대기 목록 및 심사/승인 뷰어 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 좌측 대기 리스트 */}
        <div className="lg:col-span-4 bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden flex flex-col h-[700px]">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>검토 대기 문서 ({projects.length})</span>
            <span>최신 제출순</span>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
            {projects.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                현재 대기 중인 검토 문서가 없습니다.
              </div>
            ) : (
              projects.map(p => {
                const isSelected = selectedProject?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => loadDetail(p.id)}
                    className={`p-3.5 cursor-pointer transition-all ${
                      isSelected ? 'bg-purple-50/80 border-l-4 border-purple-600 pl-3' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-purple-700">[{p.manageNo}]</span>
                      <StatusBadge type="report" status={p.reportStatus} size="sm" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1 mb-1">{p.title}</h4>
                    <p className="text-xs text-slate-500 mb-2">
                      {p.departmentName} · 담당: {p.managerName}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>최종수정: {p.lastUpdated}</span>
                      <span className="font-semibold text-slate-700">버전 v{p.currentVersion}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 우측 검토 및 승인 처리 패널 */}
        <div className="lg:col-span-8 bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden flex flex-col min-h-[700px]">
          {selectedProject ? (
            <div>
              {/* 상단 검토 대상 요약 */}
              <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded bg-purple-600 font-bold text-xs">
                      {selectedProject.manageNo}
                    </span>
                    <span className="text-xs text-purple-200">
                      현재 단계: {selectedProject.reportStatus}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{selectedProject.title}</h3>
                </div>

                <div className="text-right text-xs text-slate-300">
                  <p>주관: {selectedProject.bureauName} {selectedProject.departmentName}</p>
                  <p>제출 담당자: <strong>{selectedProject.managerName}</strong> (내선 {selectedProject.managerPhone})</p>
                </div>
              </div>

              {/* 검토 내용 본문 */}
              <div className="p-6 space-y-6 text-sm">
                {/* 1. 제출된 2026년도 추진실적 내용 */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-600" />
                    제출된 당기 실적 내용
                  </h4>
                  <div className="p-3 bg-white rounded-lg border border-slate-200 text-slate-800 font-medium">
                    {selectedProject.schedules.find(s => s.year === 2026)?.actual || selectedProject.currentStage || '입력된 실적 내용이 없습니다.'}
                  </div>
                  <div className="flex items-center gap-6 pt-2 text-xs">
                    <span>누적 추진율: <strong className="text-blue-600 font-bold">{selectedProject.schedules.find(s => s.year === 2026)?.progressRate || 0}%</strong></span>
                    <span>이행 상태: <strong>{selectedProject.executionStatus}</strong></span>
                    <span>기투자 집행액: <strong>{selectedProject.investmentPlan.priorInvested.toLocaleString()} {selectedProject.investmentPlan.unit}</strong></span>
                  </div>
                </div>

                {/* 2. 쟁점사항 및 해소방안 검토 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl">
                    <p className="text-xs font-bold text-amber-900 mb-1">쟁점사항 (문제점)</p>
                    <p className="text-xs text-slate-800 whitespace-pre-line">
                      {selectedProject.issuesAndSolutions.issues || '특이 쟁점 없음'}
                    </p>
                  </div>
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                    <p className="text-xs font-bold text-emerald-900 mb-1">해소방안 및 대책</p>
                    <p className="text-xs text-slate-800 whitespace-pre-line">
                      {selectedProject.issuesAndSolutions.solutions || '정상 추진 대책 적용'}
                    </p>
                  </div>
                </div>

                {/* 3. 승인/반려 심사 의견 입력란 */}
                <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-200 space-y-4">
                  <h4 className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-purple-600" />
                    검토자 심사 의견 및 처리
                  </h4>

                  <textarea
                    rows={2}
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="검토 의견 또는 지시사항을 입력하세요..."
                    className="w-full p-3 rounded-xl bg-white border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500"
                  />

                  {/* 승인 / 반려 액션 버튼 */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setRejectModalOpen(true)}
                      disabled={actionProcessing}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 text-xs font-bold transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      보완 요청 (반려)
                    </button>

                    <button
                      type="button"
                      onClick={handleApprove}
                      disabled={actionProcessing}
                      className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {selectedProject.reportStatus === '국검토대기' ? '국 검토 완료 (정책팀 송부)' : '정책팀 최종 승인'}
                    </button>
                  </div>
                </div>

                {/* 4. 과거 심사 및 승인 이력 타임라인 */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 mb-2">과거 처리 이력</h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                    {history.length === 0 ? (
                      <div className="p-3 text-slate-400 text-center">등록된 처리 이력이 없습니다.</div>
                    ) : (
                      history.map(h => (
                        <div key={h.id} className="p-3 flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800">{h.actorName} ({h.actorDepartment})</span>
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">{h.step}</span>
                            </div>
                            <p className="text-slate-600 mt-1">{h.comment}</p>
                            {h.rejectReason && (
                              <p className="text-rose-600 font-bold mt-0.5">※ 반려 사유: {h.rejectReason}</p>
                            )}
                          </div>
                          <span className="text-slate-400 shrink-0">{h.createdAt.substring(0, 16)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm">
              왼쪽 목록에서 검토할 문서를 선택하세요.
            </div>
          )}
        </div>
      </div>

      {/* 반려 사유 입력 모달 */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-base">
              <XCircle className="w-5 h-5" />
              <span>보완 요청 (반려) 사유 입력</span>
            </div>

            <p className="text-xs text-slate-600">
              반려된 문서는 담당 부서({selectedProject?.departmentName})로 반환되며, 아래 입력한 사유가 담당자에게 전달되고 감사 이력에 영구 보존됩니다.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                구체적 보완 요청 사유 <span className="text-red-500">* (필수)</span>
              </label>
              <textarea
                rows={4}
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="예: 2026년 턴키 입찰 유찰에 따른 구체적인 수의계약 대책과 LH 분담금 집행 일정을 명시하여 보완 후 재제출 바랍니다."
                className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleRejectConfirm}
                disabled={actionProcessing}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs"
              >
                {actionProcessing ? '처리 중...' : '보완 요청 전송'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
