import React from 'react';
import { ProjectExecutionStatus, ReportProcessingStatus, PublicReleaseStatus } from '../../types/index.ts';

interface StatusBadgeProps {
  type: 'execution' | 'report' | 'public';
  status: ProjectExecutionStatus | ReportProcessingStatus | PublicReleaseStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-sm font-semibold'
  }[size];

  // 1. 사업 이행 상태
  if (type === 'execution') {
    switch (status) {
      case '완료':
        return <span className={`inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 ${sizeClasses}`}>● 완료</span>;
      case '정상추진':
        return <span className={`inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-800 border border-blue-300 ${sizeClasses}`}>● 정상추진</span>;
      case '지연':
        return <span className={`inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 ${sizeClasses}`}>▲ 지연 (대책수립)</span>;
      case '보류':
        return <span className={`inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300 ${sizeClasses}`}>■ 보류</span>;
      case '추진전':
      default:
        return <span className={`inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 border border-slate-300 ${sizeClasses}`}>○ 추진전</span>;
    }
  }

  // 2. 보고자료 처리 상태
  if (type === 'report') {
    switch (status) {
      case '최종승인':
        return <span className={`inline-flex items-center gap-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 ${sizeClasses}`}>✓ 최종승인</span>;
      case '국검토대기':
        return <span className={`inline-flex items-center gap-1 rounded-md bg-purple-50 text-purple-700 border border-purple-200 ${sizeClasses}`}>⏳ 국 검토 대기</span>;
      case '정책팀검토대기':
        return <span className={`inline-flex items-center gap-1 rounded-md bg-sky-50 text-sky-700 border border-sky-200 ${sizeClasses}`}>⏳ 정책팀 검토 대기</span>;
      case '보완요청':
        return <span className={`inline-flex items-center gap-1 rounded-md bg-red-50 text-red-700 border border-red-200 ${sizeClasses}`}>↩ 보완요청 (반려)</span>;
      case '작성중':
      default:
        return <span className={`inline-flex items-center gap-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200 ${sizeClasses}`}>✎ 작성중</span>;
    }
  }

  // 3. 공개 상태
  switch (status) {
    case '게시':
      return <span className={`inline-flex items-center gap-1 rounded-full bg-teal-100 text-teal-800 border border-teal-300 ${sizeClasses}`}>🌐 시민공개 게시</span>;
    case '공개확정':
      return <span className={`inline-flex items-center gap-1 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-300 ${sizeClasses}`}>★ 공개 확정</span>;
    case '공개자료작성중':
      return <span className={`inline-flex items-center gap-1 rounded-full bg-orange-100 text-orange-800 border border-orange-200 ${sizeClasses}`}>✎ 공개안 작성중</span>;
    case '공개철회':
      return <span className={`inline-flex items-center gap-1 rounded-full bg-gray-200 text-gray-700 border border-gray-400 ${sizeClasses}`}>✕ 공개 철회</span>;
    case '미공개':
    default:
      return <span className={`inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-500 border border-slate-300 ${sizeClasses}`}>🔒 내부 비공개</span>;
  }
};
