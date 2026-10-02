import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { PromiseProject, YearlyFunding } from '../../types/index.ts';
import { StatusBadge } from '../../components/common/StatusBadge.tsx';
import {
  Save,
  Send,
  Copy,
  AlertCircle,
  CheckCircle,
  FileCheck,
  Calculator,
  ArrowLeft,
  Calendar,
  DollarSign
} from 'lucide-react';

interface ReportFormProps {
  projectId?: string;
  onNavigate: (tab: string, projectId?: string) => void;
}

export const ReportForm: React.FC<ReportFormProps> = ({ projectId, onNavigate }) => {
  const { apiFetch, currentUser } = useAuth();
  const [projects, setProjects] = useState<PromiseProject[]>([]);
  const [selectedId, setSelectedId] = useState<string>(projectId || '');
  const [project, setProject] = useState<PromiseProject | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // 폼 입력 상태
  const [currentStage, setCurrentStage] = useState('');
  const [executionStatus, setExecutionStatus] = useState<any>('정상추진');
  const [issues, setIssues] = useState('');
  const [solutions, setSolutions] = useState('');
  const [recentActual, setRecentActual] = useState('');
  const [progressRate, setProgressRate] = useState<number>(0);
  const [priorInvested, setPriorInvested] = useState<number>(0);

  // 내 부서 사업인지 여부
  const isMyDepartment = project
    ? currentUser.role === 'SYS_ADMIN' || currentUser.role === 'POLICY_ADMIN' || currentUser.departmentId === project.departmentId
    : true;

  // 검토 중으로 수정 잠김 상태인지 여부
  const isLocked = project
    ? currentUser.role === 'DEPT_USER' && (project.reportStatus === '국검토대기' || project.reportStatus === '정책팀검토대기')
    : false;

  useEffect(() => {
    loadMyProjects();
  }, [currentUser]);

  useEffect(() => {
    if (selectedId) {
      loadProject(selectedId);
    }
  }, [selectedId]);

  const loadMyProjects = async () => {
    try {
      const res = await apiFetch('/api/admin/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects);
        if (!selectedId && data.projects.length > 0) {
          // 내 부서 사업 우선 선택
          const my = data.projects.find((p: PromiseProject) => p.departmentId === currentUser.departmentId);
          setSelectedId(my ? my.id : data.projects[0].id);
        }
      }
    } catch (err) {
      console.error('목록 로드 실패:', err);
    }
  };

  const loadProject = async (id: string) => {
    try {
      setLoading(true);
      const res = await apiFetch(`/api/admin/projects/${id}`);
      if (res.ok) {
        const data = await res.json();
        const p: PromiseProject = data.project;
        setProject(p);
        setCurrentStage(p.currentStage || '');
        setExecutionStatus(p.executionStatus);
        setIssues(p.issuesAndSolutions?.issues || '');
        setSolutions(p.issuesAndSolutions?.solutions || '');
        setPriorInvested(p.investmentPlan?.priorInvested || 0);

        const currentSchedule = p.schedules?.find(s => s.year === 2026);
        setRecentActual(currentSchedule?.actual || '');
        setProgressRate(currentSchedule?.progressRate || 0);
      }
    } catch (err) {
      console.error('프로젝트 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  // 기존 기간 자료 복사
  const handleCopyPreviousData = () => {
    if (!project) return;
    const schedule2026 = project.schedules?.find(s => s.year === 2026);
    if (schedule2026) {
      setRecentActual(schedule2026.plan || '');
      setNotice({
        type: 'success',
        message: '2026년도 당초 계획 내용을 실적 입력란으로 복사하였습니다.'
      });
    }
  };

  // 1. 임시저장
  const handleSaveDraft = async () => {
    if (!project) return;
    if (!isMyDepartment) {
      setNotice({
        type: 'error',
        message: `[수정 불가] 타 부서(${project.departmentName})의 공약사업은 수정할 수 없습니다.`
      });
      return;
    }

    try {
      setSaving(true);
      setNotice(null);

      // 스케줄 배열 복제 후 2026년 실적 갱신
      const updatedSchedules = project.schedules.map(s => {
        if (s.year === 2026) {
          return { ...s, actual: recentActual, progressRate };
        }
        return s;
      });

      const payload = {
        currentStage,
        executionStatus,
        issuesAndSolutions: {
          issues,
          solutions
        },
        investmentPlan: {
          ...project.investmentPlan,
          priorInvested
        },
        schedules: updatedSchedules
      };

      const res = await apiFetch(`/api/admin/projects/${project.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        setProject(data.project);
        setNotice({ type: 'success', message: '추진실적 및 현안 대책이 안전하게 임시저장되었습니다.' });
      } else {
        setNotice({ type: 'error', message: data.error || '저장에 실패하였습니다.' });
      }
    } catch (err) {
      setNotice({ type: 'error', message: '네트워크 통신 중 오류가 발생했습니다.' });
    } finally {
      setSaving(false);
    }
  };

  // 2. 국 검토 제출
  const handleSubmitToBureau = async () => {
    if (!project) return;
    if (!isMyDepartment) {
      setNotice({ type: 'error', message: '소속 부서 사업만 제출이 가능합니다.' });
      return;
    }

    // 필수 유효성 검사
    if (!recentActual || recentActual.trim() === '') {
      setNotice({ type: 'error', message: '제출 전 [2026년 추진실적] 내용을 입력해야 합니다.' });
      return;
    }

    if (executionStatus === '지연' && (!issues || issues.trim() === '')) {
      setNotice({ type: 'error', message: '지연 사업의 경우 구체적인 [쟁점사항(문제점)]을 필수로 입력해야 합니다.' });
      return;
    }

    try {
      setSaving(true);
      // 1) 내용 먼저 저장
      await handleSaveDraft();

      // 2) 상태 전이 호출 (SUBMIT -> 국검토대기)
      const res = await apiFetch(`/api/admin/projects/${project.id}/transition`, {
        method: 'POST',
        body: JSON.stringify({
          action: 'SUBMIT',
          comment: `${currentUser.name}(${currentUser.departmentName}) 2026년도 추진실적 국 검토 요청 제출`
        })
      });

      const data = await res.json();
      if (res.ok) {
        setProject(data.project);
        setNotice({
          type: 'success',
          message: '소관 국(교통국장실)으로 검토 제출이 완료되었습니다. (상태: 국 검토 대기)'
        });
      } else {
        setNotice({ type: 'error', message: data.error || '제출 처리에 실패하였습니다.' });
      }
    } catch (err) {
      setNotice({ type: 'error', message: '제출 중 오류가 발생했습니다.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 상단 네비게이션 헤더 */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('projects', selectedId)}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> 공약 목록으로 돌아가기
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">입력 대상 사업 선택:</span>
          <select
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900 shadow-xs focus:ring-2 focus:ring-blue-500"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                [{p.manageNo}] {p.title} ({p.departmentName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 안내 알림 메시지 */}
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

      {/* 타 부서 또는 수정 잠김 경고 배너 */}
      {!isMyDepartment && project && (
        <div className="p-4 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            [주의] 현재 로그인한 부서({currentUser.departmentName})와 사업 주관부서({project.departmentName})가 다릅니다. 조회는 가능하나 서버에서 저장이 차단됩니다.
          </span>
        </div>
      )}

      {isLocked && project && (
        <div className="p-4 bg-purple-50 text-purple-900 border border-purple-200 rounded-xl text-xs flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-purple-600 shrink-0" />
          <span>
            [검토 중 잠금] 현재 상급기관({project.reportStatus})에서 검토 중인 보고자료입니다. 검토가 완료되거나 보완 요청된 후 수정할 수 있습니다.
          </span>
        </div>
      )}

      {/* 메인 폼 카드 */}
      {project && (
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
          {/* 사업 기본정보 요약 헤더 */}
          <div className="p-5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-700 text-white font-bold text-xs">
                  {project.manageNo}
                </span>
                <h3 className="text-base font-bold text-slate-900">{project.title}</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {project.bureauName} {project.departmentName} {project.teamName} · 담당: {project.managerName} (내선 {project.managerPhone})
              </p>
            </div>

            <div className="flex items-center gap-2">
              <StatusBadge type="execution" status={project.executionStatus} />
              <StatusBadge type="report" status={project.reportStatus} />
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* 1. 이행 상태 및 현재 추진상황 요약 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  사업 이행 상태 <span className="text-red-500">*</span>
                </label>
                <select
                  value={executionStatus}
                  disabled={!isMyDepartment || isLocked}
                  onChange={e => setExecutionStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
                >
                  <option value="정상추진">● 정상추진</option>
                  <option value="지연">▲ 지연 (대책수립 대상)</option>
                  <option value="완료">● 완료</option>
                  <option value="보류">■ 보류</option>
                  <option value="추진전">○ 추진전</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  추진상황 요약문 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={currentStage}
                  disabled={!isMyDepartment || isLocked}
                  onChange={e => setCurrentStage(e.target.value)}
                  placeholder="예: 실시설계 추진 중, 공사 착공 등"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 2. 2026년도 당기 추진실적 및 누적 추진율 */}
            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  2026년도 당기 추진실적 입력
                </span>
                <button
                  type="button"
                  onClick={handleCopyPreviousData}
                  disabled={!isMyDepartment || isLocked}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-blue-300 text-blue-700 text-xs font-semibold"
                >
                  <Copy className="w-3.5 h-3.5" /> 당초 계획 복사
                </button>
              </div>

              <div>
                <textarea
                  rows={3}
                  value={recentActual}
                  disabled={!isMyDepartment || isLocked}
                  onChange={e => setRecentActual(e.target.value)}
                  placeholder="2026년도에 실제 추진한 세부 업무 실적을 구체적으로 입력하세요..."
                  className="w-full p-3 rounded-xl bg-white border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    현재 누적 추진율 (%)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={progressRate}
                      disabled={!isMyDepartment || isLocked}
                      onChange={e => setProgressRate(Number(e.target.value))}
                      className="w-24 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-sm font-bold text-blue-700"
                    />
                    <div className="flex-1 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, Math.max(0, progressRate))}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    기투자액 집행 실적 ({project.investmentPlan.unit})
                  </label>
                  <input
                    type="number"
                    value={priorInvested}
                    disabled={!isMyDepartment || isLocked}
                    onChange={e => setPriorInvested(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-sm font-bold text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* 3. 쟁점사항(문제점) 및 해소방안 */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  주요 쟁점사항 (문제점)
                  {executionStatus === '지연' && <span className="text-red-500 font-bold">(지연 시 필수입력)</span>}
                </label>
                <textarea
                  rows={3}
                  value={issues}
                  disabled={!isMyDepartment || isLocked}
                  onChange={e => setIssues(e.target.value)}
                  placeholder="예타 통과 지연, 협약 갱신 이견, 토지보상 유찰 등 추진상 애로사항..."
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  해소방안 및 향후 대책
                </label>
                <textarea
                  rows={3}
                  value={solutions}
                  disabled={!isMyDepartment || isLocked}
                  onChange={e => setSolutions(e.target.value)}
                  placeholder="관계기관(국토부, LH, 경기도)과의 TF 협의, 시비 우선 편성 등 구체적 대응책..."
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 하단 저장 및 제출 버튼 바 */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                작성자: <strong>{currentUser.name}</strong> ({currentUser.departmentName})
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={!isMyDepartment || isLocked || saving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? '저장 중...' : '임시저장'}
                </button>

                <button
                  type="button"
                  onClick={handleSubmitToBureau}
                  disabled={!isMyDepartment || isLocked || saving}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {saving ? '제출 중...' : '국 검토 요청 제출'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
