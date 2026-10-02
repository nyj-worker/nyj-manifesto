import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { PublicProjectView } from '../../types/index.ts';
import { PublicMap } from '../../components/map/PublicMap.tsx';
import { StatusBadge } from '../../components/common/StatusBadge.tsx';
import {
  MapPin,
  Navigation,
  Search,
  Filter,
  Layers,
  ArrowRight,
  Info,
  Building,
  CheckCircle2
} from 'lucide-react';
import { getClientPublicProjects } from '../../services/clientStorage.ts';

interface PublicMapPageProps {
  onNavigate: (tab: string, projectId?: string) => void;
}

export const PublicMapPage: React.FC<PublicMapPageProps> = ({ onNavigate }) => {
  const { apiFetch } = useAuth();
  
  // 첫 렌더링 즉시 안전하게 표시될 기본 데이터 주입
  const [initialFallback] = useState(() => getClientPublicProjects());
  const [projects, setProjects] = useState<PublicProjectView[]>(() => initialFallback.projects || []);
  const [mappedProjects, setMappedProjects] = useState<PublicProjectView[]>(() => initialFallback.mappedProjects || []);
  const [cityWideProjects, setCityWideProjects] = useState<PublicProjectView[]>(() => initialFallback.cityWideProjects || []);
  const [selectedProject, setSelectedProject] = useState<PublicProjectView | null>(() => {
    return initialFallback.mappedProjects && initialFallback.mappedProjects.length > 0 
      ? initialFallback.mappedProjects[0] 
      : null;
  });
  const [loading, setLoading] = useState(false);

  // 필터 및 위치 상태
  const [selectedDong, setSelectedDong] = useState('전체');
  const [selectedRadius, setSelectedRadius] = useState<number>(3000); // 기본 3km
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [activeTab, setActiveTab] = useState<'mapped' | 'citywide'>('mapped');

  useEffect(() => {
    loadMapProjects();
  }, [selectedDong, userLocation, selectedRadius]);

  const loadMapProjects = async () => {
    try {
      setLoading(true);
      let url = `/api/public/projects?dong=${encodeURIComponent(selectedDong)}`;

      if (userLocation) {
        url += `&lat=${userLocation[0]}&lng=${userLocation[1]}&radius=${selectedRadius}`;
      }

      const res = await apiFetch(url);
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
        setMappedProjects(data.mappedProjects || []);
        setCityWideProjects(data.cityWideProjects || []);

        if (data.mappedProjects && data.mappedProjects.length > 0 && !selectedProject) {
          setSelectedProject(data.mappedProjects[0]);
        }
      }
    } catch (err) {
      console.error('지도 공약 로드 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  // 브라우저 현 위치 요청
  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('이 브라우저는 위치 정보(GPS)를 지원하지 않습니다.');
      return;
    }

    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLocation([lat, lng]);
      },
      err => {
        // 위치 권한 거부 시에도 남양주시청 기본 좌표로 대체 안내
        setLocationError('위치 권한이 거부되었거나 수신할 수 없어 남양주시청 기준으로 설정되었습니다.');
        setUserLocation([37.6360, 127.2081]);
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* 상단 컨트롤 바 */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* 현 위치 버튼 */}
          <button
            type="button"
            onClick={handleRequestLocation}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition-colors"
          >
            <Navigation className="w-3.5 h-3.5 text-blue-600" />
            내 위치 중심 검색
          </button>

          {/* 반경 선택 */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-500">반경:</span>
            {[500, 1000, 3000, 5000].map(rad => (
              <button
                key={rad}
                type="button"
                onClick={() => setSelectedRadius(rad)}
                className={`px-2.5 py-1.5 rounded-lg font-semibold transition-colors ${
                  selectedRadius === rad
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {rad >= 1000 ? `${rad / 1000}km` : `${rad}m`}
              </button>
            ))}
          </div>

          {/* 행정동 선택 */}
          <select
            value={selectedDong}
            onChange={e => setSelectedDong(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold focus:ring-2 focus:ring-blue-500"
          >
            <option value="전체">행정동 전체</option>
            <option value="다산동">다산동 (다산1·2동)</option>
            <option value="별내동">별내동 (별내면·동)</option>
            <option value="진접읍">진접읍</option>
            <option value="와부읍">와부읍 (덕소)</option>
            <option value="화도읍">화도읍 (마석)</option>
            <option value="호평동">호평동 / 평내동</option>
            <option value="퇴계원읍">퇴계원읍</option>
            <option value="금곡동">금곡동 (시청)</option>
          </select>
        </div>

        {/* 지도 ↔ 목록 뷰 전환 탭 */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'map' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            🗺️ 지도 보기
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'list' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            📋 목록으로 보기
          </button>
        </div>
      </div>

      {locationError && (
        <div className="p-3 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{locationError}</span>
        </div>
      )}

      {/* 메인 뷰: 지도 모드 vs 목록 모드 */}
      {viewMode === 'map' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* 좌측 Leaflet 지도 (8단) */}
          <div className="lg:col-span-8 bg-white rounded-2xl shadow-xs border border-slate-200 p-3 h-[580px]">
            <PublicMap
              projects={projects}
              selectedProject={selectedProject}
              onSelectProject={p => setSelectedProject(p)}
              radiusMeters={selectedRadius}
              userLocation={userLocation}
            />
          </div>

          {/* 우측 선택된 공약 상세 요약 카드 및 탭 (4단) */}
          <div className="lg:col-span-4 space-y-4">
            {/* 시전체/비좌표 사업 분리 탭 (요구사항 필수) */}
            <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setActiveTab('mapped')}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  activeTab === 'mapped' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📍 위치 표시 공약 ({mappedProjects.length})
              </button>
              <button
                onClick={() => setActiveTab('citywide')}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  activeTab === 'citywide' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🌐 시 전체·비좌표 사업 ({cityWideProjects.length})
              </button>
            </div>

            {/* 활성 탭에 따른 카드 뷰 */}
            {activeTab === 'mapped' ? (
              selectedProject ? (
                <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      [{selectedProject.manageNo}]
                    </span>
                    <StatusBadge type="execution" status={selectedProject.executionStatus} size="sm" />
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{selectedProject.title}</h3>

                  <div className="space-y-2 text-xs text-slate-700">
                    <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                      <strong className="text-blue-900">어떤 사업인가요?</strong>
                      <p className="mt-1 leading-relaxed">{selectedProject.easySummary.what}</p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <p><strong>• 대상 위치:</strong> {selectedProject.location.address || selectedProject.location.dong}</p>
                      <p className="mt-1"><strong>• 소요 예산:</strong> {selectedProject.totalBudgetDesc}</p>
                      <p className="mt-1"><strong>• 진척도:</strong> {selectedProject.indicatorAchievementRate}%</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('public-detail', selectedProject.id)}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    공약 상세정보 및 현장사진 보기 <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-8 text-center text-slate-400 text-xs border border-slate-200">
                  지도에서 마커를 클릭하여 공약 정보를 확인하세요.
                </div>
              )
            ) : (
              /* 시 전체 사업 목록 */
              <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 space-y-3 h-[520px] overflow-y-auto">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                  💡 특정 위치가 아닌 <strong>남양주시 전역 대상 사업</strong>(G-Pass 무상교통, 공영주차장 주차선 등)은 임의 좌표에 찍지 않고 여기서 안내합니다.
                </div>

                <div className="divide-y divide-slate-100">
                  {cityWideProjects.map(p => (
                    <div
                      key={p.id}
                      onClick={() => onNavigate('public-detail', p.id)}
                      className="py-3 cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-700">[{p.manageNo}]</span>
                        <StatusBadge type="execution" status={p.executionStatus} size="sm" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{p.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1">{p.easySummary.what}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* 지도 대신 목록 보기 모드 (접근성 및 대체 뷰) */
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900">우리 동네 공약 전체 목록 ({projects.length}건)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map(p => (
              <div
                key={p.id}
                onClick={() => onNavigate('public-detail', p.id)}
                className="p-4 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 cursor-pointer transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-700">[{p.manageNo}]</span>
                  <StatusBadge type="execution" status={p.executionStatus} size="sm" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">{p.title}</h4>
                <p className="text-xs text-slate-600 line-clamp-2">{p.easySummary.what}</p>
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-200">
                  <span>📍 {p.location.dong}</span>
                  <span className="font-semibold text-slate-700">달성률 {p.indicatorAchievementRate}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
