import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { PromiseProject, ApprovalHistory } from '../../types/index.ts';
import { StatusBadge } from '../../components/common/StatusBadge.tsx';
import {
  Search,
  Filter,
  FileText,
  Calendar,
  Building,
  DollarSign,
  AlertCircle,
  Clock,
  Edit3,
  CheckCircle,
  Eye,
  MapPin,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface ProjectListProps {
  onNavigate: (tab: string, projectId?: string) => void;
  initialSelectedId?: string;
}

export const ProjectList: React.FC<ProjectListProps> = ({ onNavigate, initialSelectedId }) => {
  const { apiFetch, currentUser } = useAuth();
  const [projects, setProjects] = useState<PromiseProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<PromiseProject | null>(null);
  const [history, setHistory] = useState<ApprovalHistory[]>([]);
  const [loading, setLoading] = useState(true);

  // 필터 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('전체');
  const [selectedStatus, setSelectedStatus] = useState('전체');
  const [selectedReportStatus, setSelectedReportStatus] = useState('전체');

  // 상세 탭
  const [detailTab, setDetailTab] = useState<'overview' | 'finance' | 'issues' | 'schedule' | 'history'>('overview');

  useEffect(() => {
    loadProjects();
  }, [currentUser]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/admin/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects);

        // 초기 선택 프로젝트 지정
        if (initialSelectedId) {
          const found = data.projects.find((p: PromiseProject) => p.id === initialSelectedId);
          if (found) loadProjectDetail(found.id);
        } else if (data.projects.length > 0) {
          loadProjectDetail(data.projects[0].id);
        }
      }
    } catch (err) {
      console.error('공약사업 목록 로드 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectDetail = async (id: string) => {
    try {
      const res = await apiFetch(`/api/admin/projects/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedProject(data.project);
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error('상세 로드 오류:', err);
    }
  };

  // 필터링 적용
  const filteredProjects = projects.filter(p => {
    if (selectedDept !== '전체' && p.departmentName !== selectedDept) return false;
    if (selectedStatus !== '전체' && p.executionStatus !== selectedStatus) return false;
    if (selectedReportStatus !== '전체' && p.reportStatus !== selectedReportStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.manageNo.toLowerCase().includes(q) || p.purpose.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 상단 검색 및 필터 헤더 바 */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="사업명, 관리번호(4-01), 목적 검색..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-sm">
          {/* 부서 필터 */}
          <select
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="전체">소관 부서 전체</option>
            <option value="교통정책과">교통정책과 (철도·스쿨존)</option>
            <option value="대중교통과">대중교통과 (버스·DRT)</option>
            <option value="주차관리과">주차관리과 (공영주차장)</option>
            <option value="도로건설과">도로건설과 (도로·교량)</option>
          </select>

          {/* 이행 상태 필터 */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="전체">이행상태 전체</option>
            <option value="정상추진">정상추진</option>
            <option value="지연">지연 (중점관리)</option>
            <option value="완료">완료</option>
            <option value="보류">보류</option>
            <option value="추진전">추진전</option>
          </select>

          {/* 보고 처리 상태 필터 */}
          <select
            value={selectedReportStatus}
            onChange={e => setSelectedReportStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="전체">보고상태 전체</option>
            <option value="작성중">작성중</option>
            <option value="국검토대기">국 검토 대기</option>
            <option value="정책팀검토대기">정책팀 검토 대기</option>
            <option value="보완요청">보완요청 (반려)</option>
            <option value="최종승인">최종승인</option>
          </select>
        </div>
      </div>

      {/* 2단 분할 레이아웃: 좌측 목록, 우측 PDF 서식 완벽 뷰어 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 좌측 사업 목록 (5단) */}
        <div className="lg:col-span-4 bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden flex flex-col h-[750px]">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>총 <strong>{filteredProjects.length}</strong>개 사업</span>
            <span>PDF 실천계획서 수록</span>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
            {filteredProjects.map(p => {
              const isSelected = selectedProject?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => loadProjectDetail(p.id)}
                  className={`p-3.5 cursor-pointer transition-all ${
                    isSelected ? 'bg-blue-50/80 border-l-4 border-blue-600 pl-3' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-blue-700">[{p.manageNo}]</span>
                    <StatusBadge type="execution" status={p.executionStatus} size="sm" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 line-clamp-1 mb-1">{p.title}</h4>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{p.departmentName}</span>
                    <span className="font-semibold text-slate-700">
                      {p.investmentPlan.totalBudget.toLocaleString()} {p.investmentPlan.unit}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-1 pt-1.5 border-t border-slate-100 text-[11px]">
                    <StatusBadge type="report" status={p.reportStatus} size="sm" />
                    <StatusBadge type="public" status={p.publicStatus} size="sm" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 우측 공약과제 실천계획서 공식 서식 재현 뷰어 (7단) */}
        <div className="lg:col-span-8 bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden flex flex-col min-h-[750px]">
          {selectedProject ? (
            <div>
              {/* 상단 툴바: 편집/실적입력/승인 이동 버튼 */}
              <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-600 font-bold text-xs">
                    {selectedProject.manageNo}
                  </span>
                  <h3 className="text-base font-bold tracking-tight text-white line-clamp-1">
                    {selectedProject.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('report', selectedProject.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    추진실적 입력/수정
                  </button>

                  <button
                    onClick={() => onNavigate('approvals', selectedProject.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    검토·승인함
                  </button>
                </div>
              </div>

              {/* 탭 네비게이션 */}
              <div className="flex border-b border-slate-200 bg-slate-50 px-4 text-xs font-semibold overflow-x-auto">
                <button
                  onClick={() => setDetailTab('overview')}
                  className={`py-3 px-3 border-b-2 transition-colors ${
                    detailTab === 'overview'
                      ? 'border-blue-600 text-blue-700 font-bold bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  기본정보 및 개요
                </button>
                <button
                  onClick={() => setDetailTab('finance')}
                  className={`py-3 px-3 border-b-2 transition-colors ${
                    detailTab === 'finance'
                      ? 'border-blue-600 text-blue-700 font-bold bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  재원투자계획 (예산)
                </button>
                <button
                  onClick={() => setDetailTab('issues')}
                  className={`py-3 px-3 border-b-2 transition-colors ${
                    detailTab === 'issues'
                      ? 'border-blue-600 text-blue-700 font-bold bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  쟁점사항 및 대책
                </button>
                <button
                  onClick={() => setDetailTab('schedule')}
                  className={`py-3 px-3 border-b-2 transition-colors ${
                    detailTab === 'schedule'
                      ? 'border-blue-600 text-blue-700 font-bold bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  연도별 계획·실적
                </button>
                <button
                  onClick={() => setDetailTab('history')}
                  className={`py-3 px-3 border-b-2 transition-colors ${
                    detailTab === 'history'
                      ? 'border-blue-600 text-blue-700 font-bold bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  추진실적 및 승인이력
                </button>
              </div>

              {/* 탭 본문 영역: PDF 서식 완벽 구현 */}
              <div className="p-6 space-y-6 text-sm">
                {/* 1. 기본정보 및 개요 탭 */}
                {detailTab === 'overview' && (
                  <div className="space-y-6">
                    {/* PDF 표준 헤더 테이블 재현 */}
                    <div className="border border-slate-300 rounded-xl overflow-hidden shadow-xs">
                      <table className="w-full text-xs border-collapse">
                        <tbody>
                          <tr className="border-b border-slate-300">
                            <th className="w-24 bg-slate-100 py-2.5 px-3 font-bold text-slate-800 border-r border-slate-300">관리번호</th>
                            <td className="w-28 py-2.5 px-3 font-extrabold text-blue-700 border-r border-slate-300">{selectedProject.manageNo}</td>
                            <th className="w-24 bg-slate-100 py-2.5 px-3 font-bold text-slate-800 border-r border-slate-300">사업구분</th>
                            <td className="py-2.5 px-3 border-r border-slate-300">{selectedProject.category}</td>
                            <th className="w-24 bg-slate-100 py-2.5 px-3 font-bold text-slate-800 border-r border-slate-300">도움필요성</th>
                            <td className="py-2.5 px-3">{selectedProject.needHelp.join(', ') || '해당없음'}</td>
                          </tr>
                          <tr className="border-b border-slate-300">
                            <th className="bg-slate-100 py-2.5 px-3 font-bold text-slate-800 border-r border-slate-300">신규/계속</th>
                            <td className="py-2.5 px-3 border-r border-slate-300">{selectedProject.isNew}</td>
                            <th className="bg-slate-100 py-2.5 px-3 font-bold text-slate-800 border-r border-slate-300">완료시기</th>
                            <td className="py-2.5 px-3 border-r border-slate-300">{selectedProject.completionPeriod}</td>
                            <th className="bg-slate-100 py-2.5 px-3 font-bold text-slate-800 border-r border-slate-300">총사업비</th>
                            <td className="py-2.5 px-3 font-bold text-slate-900">
                              {selectedProject.investmentPlan.totalBudget.toLocaleString()} {selectedProject.investmentPlan.unit}
                            </td>
                          </tr>
                          <tr className="border-b border-slate-300">
                            <th className="bg-slate-100 py-2.5 px-3 font-bold text-slate-800 border-r border-slate-300">사업기간</th>
                            <td className="py-2.5 px-3 border-r border-slate-300">{selectedProject.period}</td>
                            <th className="bg-slate-100 py-2.5 px-3 font-bold text-slate-800 border-r border-slate-300">추진상황</th>
                            <td colSpan={3} className="py-2.5 px-3 font-medium text-slate-800">{selectedProject.currentStage}</td>
                          </tr>
                          <tr>
                            <th className="bg-slate-100 py-2.5 px-3 font-bold text-slate-800 border-r border-slate-300">사업주체</th>
                            <td className="py-2.5 px-3 border-r border-slate-300">{selectedProject.hostAgency}</td>
                            <th className="bg-slate-100 py-2.5 px-3 font-bold text-slate-800 border-r border-slate-300">주관부서</th>
                            <td colSpan={3} className="py-2.5 px-3 text-slate-800">
                              {selectedProject.bureauName} {selectedProject.departmentName} {selectedProject.teamName} / 담당: <strong>{selectedProject.managerName}</strong> (내선 {selectedProject.managerPhone})
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* 사업목적 */}
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mb-2">
                        <span className="w-2 h-2 rounded-xs bg-blue-600"></span> 사업목적
                      </h4>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-700 leading-relaxed">
                        {selectedProject.purpose}
                      </div>
                    </div>

                    {/* 사업개요 */}
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mb-2">
                        <span className="w-2 h-2 rounded-xs bg-blue-600"></span> 사업개요
                      </h4>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 text-slate-700">
                        {selectedProject.overview.section && (
                          <p><strong>• 사업구간:</strong> {selectedProject.overview.section}</p>
                        )}
                        {selectedProject.overview.volume && (
                          <p><strong>• 사 업 량:</strong> {selectedProject.overview.volume}</p>
                        )}
                        {selectedProject.overview.totalCostDesc && (
                          <p><strong>• 사업비 산출:</strong> {selectedProject.overview.totalCostDesc}</p>
                        )}
                        <p><strong>• 대상위치:</strong> {selectedProject.location.address} ({selectedProject.location.dong})</p>
                      </div>
                    </div>

                    {/* 사업목표 */}
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mb-2">
                        <span className="w-2 h-2 rounded-xs bg-blue-600"></span> 사업목표
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200">
                          <p className="text-xs font-semibold text-blue-700 mb-1">최종 목표</p>
                          <p className="font-bold text-slate-900">{selectedProject.targets.finalGoal}</p>
                        </div>
                        <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-200">
                          <p className="text-xs font-semibold text-indigo-700 mb-1">임기내 목표</p>
                          <p className="font-bold text-slate-900">{selectedProject.targets.termGoal}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. 재원투자계획 탭 */}
                {detailTab === 'finance' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-xs bg-blue-600"></span> 재원투자 계획 (단위: {selectedProject.investmentPlan.unit})
                      </h4>
                      {selectedProject.investmentPlan.otherNote && (
                        <span className="text-xs text-slate-500">※ {selectedProject.investmentPlan.otherNote}</span>
                      )}
                    </div>

                    <div className="border border-slate-300 rounded-xl overflow-hidden shadow-xs">
                      <table className="w-full text-xs text-center border-collapse">
                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                          <tr>
                            <th rowSpan={2} className="py-2.5 px-3 border-r border-slate-300">구분</th>
                            <th rowSpan={2} className="py-2.5 px-3 border-r border-slate-300">총액</th>
                            <th rowSpan={2} className="py-2.5 px-3 border-r border-slate-300">기투자</th>
                            <th colSpan={5} className="py-1.5 px-3 border-r border-slate-300">임기내 투자</th>
                            <th rowSpan={2} className="py-2.5 px-3">향후</th>
                          </tr>
                          <tr className="border-t border-slate-200 text-[11px]">
                            <th className="py-1 px-2 border-r border-slate-300">2026년</th>
                            <th className="py-1 px-2 border-r border-slate-300">2027년</th>
                            <th className="py-1 px-2 border-r border-slate-300">2028년</th>
                            <th className="py-1 px-2 border-r border-slate-300">2029년</th>
                            <th className="py-1 px-2 border-r border-slate-300">2030년</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {/* 계 */}
                          <tr className="bg-blue-50/40 font-bold text-slate-900">
                            <td className="py-2 px-3 border-r border-slate-300">계</td>
                            <td className="py-2 px-3 border-r border-slate-300">{selectedProject.investmentPlan.totalBudget.toLocaleString()}</td>
                            <td className="py-2 px-3 border-r border-slate-300">{selectedProject.investmentPlan.priorInvested.toLocaleString()}</td>
                            {[2026, 2027, 2028, 2029, 2030].map(yr => {
                              const yData = selectedProject.investmentPlan.yearly.find(y => y.year === yr);
                              return (
                                <td key={yr} className="py-2 px-2 border-r border-slate-300">
                                  {yData ? yData.total.toLocaleString() : '0'}
                                </td>
                              );
                            })}
                            <td className="py-2 px-3">
                              {(selectedProject.investmentPlan.yearly.find(y => y.year === 9999)?.total || 0).toLocaleString()}
                            </td>
                          </tr>

                          {/* 국비 */}
                          <tr>
                            <td className="py-2 px-3 font-medium bg-slate-50 border-r border-slate-300">국비</td>
                            <td className="py-2 px-3 border-r border-slate-300">-</td>
                            <td className="py-2 px-3 border-r border-slate-300">0</td>
                            {[2026, 2027, 2028, 2029, 2030].map(yr => {
                              const yData = selectedProject.investmentPlan.yearly.find(y => y.year === yr);
                              return (
                                <td key={yr} className="py-2 px-2 border-r border-slate-300">
                                  {yData?.national ? yData.national.toLocaleString() : '0'}
                                </td>
                              );
                            })}
                            <td className="py-2 px-3">
                              {(selectedProject.investmentPlan.yearly.find(y => y.year === 9999)?.national || 0).toLocaleString()}
                            </td>
                          </tr>

                          {/* 도비 */}
                          <tr>
                            <td className="py-2 px-3 font-medium bg-slate-50 border-r border-slate-300">도비</td>
                            <td className="py-2 px-3 border-r border-slate-300">-</td>
                            <td className="py-2 px-3 border-r border-slate-300">0</td>
                            {[2026, 2027, 2028, 2029, 2030].map(yr => {
                              const yData = selectedProject.investmentPlan.yearly.find(y => y.year === yr);
                              return (
                                <td key={yr} className="py-2 px-2 border-r border-slate-300">
                                  {yData?.provincial ? yData.provincial.toLocaleString() : '0'}
                                </td>
                              );
                            })}
                            <td className="py-2 px-3">
                              {(selectedProject.investmentPlan.yearly.find(y => y.year === 9999)?.provincial || 0).toLocaleString()}
                            </td>
                          </tr>

                          {/* 시비 */}
                          <tr>
                            <td className="py-2 px-3 font-medium bg-slate-50 border-r border-slate-300">시비</td>
                            <td className="py-2 px-3 border-r border-slate-300">-</td>
                            <td className="py-2 px-3 border-r border-slate-300">0</td>
                            {[2026, 2027, 2028, 2029, 2030].map(yr => {
                              const yData = selectedProject.investmentPlan.yearly.find(y => y.year === yr);
                              return (
                                <td key={yr} className="py-2 px-2 border-r border-slate-300 font-semibold text-blue-700">
                                  {yData?.municipal ? yData.municipal.toLocaleString() : '0'}
                                </td>
                              );
                            })}
                            <td className="py-2 px-3">
                              {(selectedProject.investmentPlan.yearly.find(y => y.year === 9999)?.municipal || 0).toLocaleString()}
                            </td>
                          </tr>

                          {/* 기타 */}
                          <tr>
                            <td className="py-2 px-3 font-medium bg-slate-50 border-r border-slate-300">기타</td>
                            <td className="py-2 px-3 border-r border-slate-300">-</td>
                            <td className="py-2 px-3 border-r border-slate-300">0</td>
                            {[2026, 2027, 2028, 2029, 2030].map(yr => {
                              const yData = selectedProject.investmentPlan.yearly.find(y => y.year === yr);
                              return (
                                <td key={yr} className="py-2 px-2 border-r border-slate-300">
                                  {yData?.other ? yData.other.toLocaleString() : '0'}
                                </td>
                              );
                            })}
                            <td className="py-2 px-3">
                              {(selectedProject.investmentPlan.yearly.find(y => y.year === 9999)?.other || 0).toLocaleString()}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 3. 쟁점사항 및 해소방안 탭 */}
                {detailTab === 'issues' && (
                  <div className="space-y-6">
                    <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl">
                      <h4 className="text-sm font-bold text-amber-900 flex items-center gap-1.5 mb-2">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        주요 쟁점사항 (문제점)
                      </h4>
                      <p className="text-slate-800 leading-relaxed whitespace-pre-line">
                        {selectedProject.issuesAndSolutions.issues || '현재 특별한 쟁점사항이 없습니다.'}
                      </p>
                    </div>

                    <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                      <h4 className="text-sm font-bold text-emerald-900 flex items-center gap-1.5 mb-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        해소방안 및 대응계획
                      </h4>
                      <p className="text-slate-800 leading-relaxed whitespace-pre-line">
                        {selectedProject.issuesAndSolutions.solutions || '정상 추진 계획에 따라 차질 없이 진행 중입니다.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* 4. 연도별 추진계획 및 실적 탭 */}
                {detailTab === 'schedule' && (
                  <div className="space-y-6">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-xs bg-blue-600"></span> 연도별 추진계획 및 실적
                    </h4>

                    <div className="border border-slate-300 rounded-xl overflow-hidden shadow-xs">
                      <table className="w-full text-xs border-collapse">
                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 text-center">
                          <tr>
                            <th className="py-2.5 px-3 w-20 border-r border-slate-300">구분</th>
                            <th className="py-2.5 px-3 border-r border-slate-300">2026년</th>
                            <th className="py-2.5 px-3 border-r border-slate-300">2027년</th>
                            <th className="py-2.5 px-3 border-r border-slate-300">2028년</th>
                            <th className="py-2.5 px-3 border-r border-slate-300">2029년</th>
                            <th className="py-2.5 px-3 border-r border-slate-300">2030년</th>
                            <th className="py-2.5 px-3">향후</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {/* 계획 */}
                          <tr>
                            <td className="py-3 px-3 font-bold bg-slate-50 text-center border-r border-slate-300">계획</td>
                            {[2026, 2027, 2028, 2029, 2030, 9999].map(yr => {
                              const s = selectedProject.schedules.find(x => x.year === yr);
                              return (
                                <td key={yr} className="py-2.5 px-2 border-r border-slate-300 text-slate-700 align-top">
                                  {s?.plan || '-'}
                                </td>
                              );
                            })}
                          </tr>

                          {/* 실적 */}
                          <tr>
                            <td className="py-3 px-3 font-bold bg-slate-50 text-center border-r border-slate-300">실적</td>
                            {[2026, 2027, 2028, 2029, 2030, 9999].map(yr => {
                              const s = selectedProject.schedules.find(x => x.year === yr);
                              return (
                                <td key={yr} className="py-2.5 px-2 border-r border-slate-300 text-blue-700 font-semibold align-top">
                                  {s?.actual || '-'}
                                </td>
                              );
                            })}
                          </tr>

                          {/* 추진율 */}
                          <tr className="bg-blue-50/30">
                            <td className="py-2 px-3 font-bold text-center border-r border-slate-300">누적추진율</td>
                            {[2026, 2027, 2028, 2029, 2030, 9999].map(yr => {
                              const s = selectedProject.schedules.find(x => x.year === yr);
                              return (
                                <td key={yr} className="py-2 px-2 border-r border-slate-300 text-center font-bold text-blue-800">
                                  {s ? `${s.progressRate}%` : '-'}
                                </td>
                              );
                            })}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 5. 추진실적 및 승인이력 탭 */}
                {detailTab === 'history' && (
                  <div className="space-y-6">
                    {/* 일자별 추진실적 히스토리 */}
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mb-3">
                        <Clock className="w-4 h-4 text-blue-600" />
                        일자별 추진실적 상세 내역
                      </h4>
                      <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2">
                        {selectedProject.achievements.length === 0 ? (
                          <p className="text-xs text-slate-400">등록된 추진실적 이력이 없습니다.</p>
                        ) : (
                          selectedProject.achievements.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-3 text-xs">
                              <span className="font-bold text-blue-700 shrink-0 mt-0.5">○ {item.date}:</span>
                              <span className="text-slate-800">{item.content}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* 승인 및 검토 이력 */}
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mb-3">
                        <FileText className="w-4 h-4 text-indigo-600" />
                        검토·승인 처리 히스토리
                      </h4>
                      <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                        {history.length === 0 ? (
                          <div className="p-4 text-xs text-slate-400 text-center">승인 이력이 아직 없습니다.</div>
                        ) : (
                          history.map(h => (
                            <div key={h.id} className="p-3 text-xs flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-800">{h.actorName} ({h.actorDepartment})</span>
                                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">{h.step}</span>
                                </div>
                                <p className="text-slate-600 mt-1">{h.comment || '의견 없음'}</p>
                                {h.rejectReason && (
                                  <p className="text-red-600 font-bold mt-0.5">※ 반려 사유: {h.rejectReason}</p>
                                )}
                              </div>
                              <span className="text-slate-400 shrink-0">{h.createdAt.substring(0, 16)}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm">
              왼쪽 목록에서 공약사업을 선택하세요.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
