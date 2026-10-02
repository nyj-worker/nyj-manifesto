import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { History, Shield, Clock, UserCheck, Search, Filter } from 'lucide-react';

interface AuditLogItem {
  id: string;
  actor_id: string;
  actor_name: string;
  actor_role: string;
  action: string;
  target_type: string;
  target_id: string;
  details: string;
  timestamp: string;
}

export const AuditLogs: React.FC = () => {
  const { apiFetch } = useAuth();
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/admin/audit-logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('감사로그 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(l => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      l.actor_name.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q) ||
      l.details.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* 상단 헤더 */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">시스템 감사 및 변경·승인 이력</h2>
            <p className="text-xs text-slate-500">
              책임행정 구현을 위해 모든 실적 수정, 국 검토, 정책팀 최종승인, 반려, 시민 공개 내역이 기록됩니다.
            </p>
          </div>
        </div>

        <div className="relative w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="사용자명, 액션, 내용 검색..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 타임라인 로그 테이블 */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase">
              <tr>
                <th className="py-3 px-4 w-40">발생 시각</th>
                <th className="py-3 px-4 w-32">작업자</th>
                <th className="py-3 px-4 w-28 text-center">역할</th>
                <th className="py-3 px-4 w-36 text-center">액션 유형</th>
                <th className="py-3 px-4">상세 변경 내역</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    기록된 감사 로그가 없습니다.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  const actionColor = log.action.includes('REJECT')
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : log.action.includes('APPROVE') || log.action.includes('PUBLISH')
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-blue-100 text-blue-800 border-blue-300';

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-500">
                        {log.timestamp.replace('T', ' ').substring(0, 19)}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">{log.actor_name}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                          {log.actor_role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${actionColor}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 leading-relaxed">{log.details}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
