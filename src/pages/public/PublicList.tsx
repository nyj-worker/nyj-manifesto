import React, { useState, useEffect } from 'react';
import { PublicProjectView } from '../../types/index.ts';
import { StatusBadge } from '../../components/common/StatusBadge.tsx';
import { Search, Filter, ArrowRight, MapPin, Calendar, CheckCircle } from 'lucide-react';

interface PublicListProps {
  onNavigate: (tab: string, projectId?: string) => void;
}

export const PublicList: React.FC<PublicListProps> = ({ onNavigate }) => {
  const [projects, setProjects] = useState<PublicProjectView[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDong, setSelectedDong] = useState('전체');
  const [selectedStatus, setSelectedStatus] = useState('전체');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, [selectedDong, selectedStatus]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      let url = `/api/public/projects?dong=${encodeURIComponent(selectedDong)}&status=${encodeURIComponent(selectedStatus)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.error('공개 공약 목록 로드 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = projects.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.title.toLowerCase().includes(q) || p.manageNo.toLowerCase().includes(q) || p.purpose.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* 검색 및 필터 바 */}
      <div className="bg-white p-5 rounded-3xl shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="공약 이름, 번호, 목적(예: 9호선, 똑버스, 주차장) 검색..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedDong}
            onChange={e => setSelectedDong(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700"
          >
            <option value="전체">행정동 전체</option>
            <option value="다산동">다산동</option>
            <option value="별내동">별내동</option>
            <option value="진접읍">진접읍</option>
            <option value="와부읍">와부읍</option>
            <option value="화도읍">화도읍</option>
            <option value="호평동">호평동 / 평내동</option>
            <option value="퇴계원읍">퇴계원읍</option>
          </select>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700"
          >
            <option value="전체">추진상태 전체</option>
            <option value="정상추진">정상추진</option>
            <option value="지연">지연 (중점관리)</option>
            <option value="완료">완료</option>
            <option value="보류">보류</option>
          </select>
        </div>
      </div>

      {/* 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(p => (
          <div
            key={p.id}
            onClick={() => onNavigate('public-detail', p.id)}
            className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 hover:shadow-md hover:border-blue-300 cursor-pointer transition-all flex flex-col justify-between group space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
                  {p.manageNo}
                </span>
                <StatusBadge type="execution" status={p.executionStatus} size="sm" />
              </div>

              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                {p.title}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                {p.easySummary.what}
              </p>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {p.location.dong}
                </span>
                <span className="font-semibold text-slate-700">{p.period}</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl flex items-center justify-between">
                <span className="text-slate-500">성과 달성률</span>
                <span className="font-extrabold text-blue-600">{p.indicatorAchievementRate}%</span>
              </div>

              <div className="flex items-center justify-between text-blue-600 font-bold text-xs pt-1 group-hover:translate-x-1 transition-transform">
                <span>쉬운말 상세 설명 보기</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
