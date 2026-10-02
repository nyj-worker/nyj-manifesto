import React, { useEffect, useRef } from 'react';
import { PublicProjectView } from '../../types/index.ts';
import L from 'leaflet';

interface PublicMapProps {
  projects: PublicProjectView[];
  selectedProject: PublicProjectView | null;
  onSelectProject: (project: PublicProjectView) => void;
  center?: [number, number];
  zoom?: number;
  radiusMeters?: number;
  userLocation?: [number, number] | null;
}

export const PublicMap: React.FC<PublicMapProps> = ({
  projects,
  selectedProject,
  onSelectProject,
  center = [37.6360, 127.2081], // 남양주시 중심 (금곡/시청 부근)
  zoom = 12,
  radiusMeters,
  userLocation
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const circleRef = useRef<L.Circle | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // 지도 인스턴스가 없으면 생성
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView(center, zoom);

      // OpenStreetMap 타일 레이어
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // 기존 마커 초기화
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    if (circleRef.current) {
      circleRef.current.remove();
      circleRef.current = null;
    }

    // 사용자 위치 및 반경 원 표시
    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `<div style="background-color:#2563eb; width:16px; height:16px; border-radius:50%; border:3px solid #ffffff; box-shadow:0 0 10px rgba(37,99,235,0.8);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      const userMarker = L.marker(userLocation, { icon: userIcon }).addTo(map);
      userMarker.bindTooltip('현재 사용자 위치 / 검색 기준점', { permanent: false });
      markersRef.current.push(userMarker);

      if (radiusMeters) {
        circleRef.current = L.circle(userLocation, {
          radius: radiusMeters,
          color: '#2563eb',
          fillColor: '#3b82f6',
          fillOpacity: 0.1,
          weight: 2
        }).addTo(map);
      }
    }

    // 공약사업 마커 표시 (좌표가 있는 사업만)
    const validProjects = projects.filter(p => p.location.lat && p.location.lng && p.location.type !== '시전체');

    validProjects.forEach(p => {
      const isSelected = selectedProject?.id === p.id;
      const markerColor = p.executionStatus === '완료' ? '#059669' : p.executionStatus === '지연' ? '#d97706' : '#2563eb';

      const customIcon = L.divIcon({
        className: 'custom-promise-marker',
        html: `
          <div style="
            background-color: ${isSelected ? '#dc2626' : markerColor};
            color: #ffffff;
            font-weight: bold;
            font-size: 11px;
            padding: 4px 8px;
            border-radius: 9999px;
            border: 2px solid #ffffff;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 4px;
            cursor: pointer;
            transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
            transition: transform 0.2s;
          ">
            <span>[${p.manageNo}]</span>
            <span>${p.title.length > 10 ? p.title.substring(0, 10) + '...' : p.title}</span>
          </div>
        `,
        iconSize: [120, 28],
        iconAnchor: [60, 14]
      });

      const marker = L.marker([p.location.lat!, p.location.lng!], { icon: customIcon }).addTo(map);

      marker.on('click', () => {
        onSelectProject(p);
      });

      // 팝업 내용
      marker.bindPopup(`
        <div style="font-family: inherit; min-width: 220px;">
          <div style="font-size: 11px; font-weight: bold; color: #2563eb; margin-bottom: 2px;">
            [${p.manageNo}] ${p.bureauName} ${p.departmentName}
          </div>
          <div style="font-size: 14px; font-weight: bold; color: #0f172a; margin-bottom: 6px;">
            ${p.title}
          </div>
          <div style="font-size: 12px; color: #475569; margin-bottom: 4px;">
            📍 ${p.location.address || p.location.dong}
          </div>
          <div style="display: flex; gap: 8px; font-size: 11px; color: #334155; margin-top: 6px; padding-top: 6px; border-top: 1px solid #e2e8f0;">
            <span>이행: <strong>${p.executionStatus}</strong></span>
            <span>진척률: <strong>${p.indicatorAchievementRate}%</strong></span>
          </div>
        </div>
      `);

      markersRef.current.push(marker);
    });

    // 선택된 프로젝트가 있으면 지도를 해당 위치로 이동
    if (selectedProject && selectedProject.location.lat && selectedProject.location.lng) {
      map.setView([selectedProject.location.lat, selectedProject.location.lng], 14, { animate: true });
    }
  }, [projects, selectedProject, userLocation, radiusMeters]);

  return (
    <div className="relative w-full h-full min-h-[450px] rounded-2xl overflow-hidden shadow-inner border border-slate-200">
      <div ref={mapContainerRef} className="w-full h-full min-h-[450px]" />
      
      {/* 범례 표시 박스 */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-xs p-3 rounded-xl shadow-md border border-slate-200 text-xs">
        <p className="font-bold text-slate-800 mb-1.5">지도 마커 범례</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-600"></span>
            <span className="text-slate-600">정상추진 공약</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span className="text-slate-600">지연 (중점관리)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
            <span className="text-slate-600">이행 완료</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-600"></span>
            <span className="text-slate-600">현재 선택된 공약</span>
          </div>
        </div>
      </div>
    </div>
  );
};
