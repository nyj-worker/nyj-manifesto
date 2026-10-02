import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { PromiseProject } from '../../types/index.ts';
import { FileSpreadsheet, Printer, Download, Filter, FileText } from 'lucide-react';

export const ReportsExport: React.FC = () => {
  const { apiFetch } = useAuth();
  const [projects, setProjects] = useState<PromiseProject[]>([]);
  const [selectedDept, setSelectedDept] = useState('전체');
  const [selectedStatus, setSelectedStatus] = useState('전체');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await apiFetch('/api/admin/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects);
      }
    } catch (err) {
      console.error('보고서 데이터 로드 오류:', err);
    }
  };

  const filtered = projects.filter(p => {
    if (selectedDept !== '전체' && p.departmentName !== selectedDept) return false;
    if (selectedStatus !== '전체' && p.executionStatus !== selectedStatus) return false;
    return true;
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    window.open('/api/admin/export-csv', '_blank');
  };

  return (
    <div className="space-y-6">
      {/* 상단 툴바 (인쇄 시 숨김) */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            공약사업 통계 및 공식 보고서 출력
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            지자체 공식 보고용 서식 출력 및 엑셀(CSV) 다운로드를 지원합니다.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold"
          >
            <option value="전체">부서 전체</option>
            <option value="교통정책과">교통정책과</option>
            <option value="대중교통과">대중교통과</option>
            <option value="주차관리과">주차관리과</option>
            <option value="도로건설과">도로건설과</option>
          </select>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold"
          >
            <option value="전체">상태 전체</option>
            <option value="정상추진">정상추진</option>
            <option value="지연">지연</option>
            <option value="완료">완료</option>
            <option value="보류">보류</option>
          </select>

          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" /> 엑셀/CSV 다운로드
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" /> 인쇄용 보고서 출력
          </button>
        </div>
      </div>

      {/* 공식 인쇄용 공약사업 관리 총괄표 서식 */}
      <div className="bg-white p-8 rounded-2xl shadow-xs border border-slate-200 space-y-6 print:p-0 print:border-none print:shadow-none">
        {/* 인쇄 헤더 */}
        <div className="text-center pb-6 border-b-2 border-slate-900">
          <p className="text-xs text-slate-500 mb-1">남양주시 민선9기 행정관리 시스템 공식 출력물</p>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">민선 9기 공약과제 실천계획 총괄 보고서</h1>
          <div className="flex items-center justify-between text-xs text-slate-600 mt-4">
            <span>출력일시: 2026.09.30</span>
            <span>조회조건: {selectedDept} / {selectedStatus} (총 {filtered.length}건)</span>
            <span>데이터 기준일: 2026.09.30</span>
          </div>
        </div>

        {/* 총괄 통계 요약표 */}
        <div className="grid grid-cols-4 gap-4 text-center text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500">총 대상 공약</span>
            <p className="text-lg font-black text-slate-900 mt-1">{filtered.length}건</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500">정상추진</span>
            <p className="text-lg font-black text-blue-600 mt-1">
              {filtered.filter(p => p.executionStatus === '정상추진').length}건
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500">지연(중점관리)</span>
            <p className="text-lg font-black text-amber-600 mt-1">
              {filtered.filter(p => p.executionStatus === '지연').length}건
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500">완료</span>
            <p className="text-lg font-black text-emerald-600 mt-1">
              {filtered.filter(p => p.executionStatus === '완료').length}건
            </p>
          </div>
        </div>

        {/* 상세 목록 테이블 */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-300 border-collapse">
            <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 text-center">
              <tr>
                <th className="py-2.5 px-2 border-r border-slate-300 w-14">관리번호</th>
                <th className="py-2.5 px-3 border-r border-slate-300">과제명(사업명)</th>
                <th className="py-2.5 px-2 border-r border-slate-300 w-24">담당부서</th>
                <th className="py-2.5 px-2 border-r border-slate-300 w-16">담당자</th>
                <th className="py-2.5 px-2 border-r border-slate-300 w-16">이행상태</th>
                <th className="py-2.5 px-2 border-r border-slate-300 w-24">총사업비</th>
                <th className="py-2.5 px-2 border-r border-slate-300 w-20">사업기간</th>
                <th className="py-2.5 px-2 border-r border-slate-300 w-16">보고상태</th>
                <th className="py-2.5 px-2 w-16">공개상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="py-2 px-2 text-center font-bold text-blue-700 border-r border-slate-300">{p.manageNo}</td>
                  <td className="py-2 px-3 font-semibold text-slate-900 border-r border-slate-300">{p.title}</td>
                  <td className="py-2 px-2 text-center text-slate-600 border-r border-slate-300">{p.departmentName}</td>
                  <td className="py-2 px-2 text-center text-slate-600 border-r border-slate-300">{p.managerName}</td>
                  <td className="py-2 px-2 text-center font-bold border-r border-slate-300">
                    <span className={p.executionStatus === '완료' ? 'text-emerald-600' : p.executionStatus === '지연' ? 'text-amber-600' : 'text-blue-600'}>
                      {p.executionStatus}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-right text-slate-700 font-mono border-r border-slate-300">
                    {p.investmentPlan.totalBudget.toLocaleString()} {p.investmentPlan.unit}
                  </td>
                  <td className="py-2 px-2 text-center text-slate-500 border-r border-slate-300">{p.period}</td>
                  <td className="py-2 px-2 text-center text-slate-700 border-r border-slate-300">{p.reportStatus}</td>
                  <td className="py-2 px-2 text-center text-slate-700 font-medium">{p.publicStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 인쇄 바닥글 */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
          <span>남양주시청 교통국 / 기획조정실 정책기획과</span>
          <span>공약사업 통합관리 시스템 v1.0</span>
        </div>
      </div>
    </div>
  );
};
