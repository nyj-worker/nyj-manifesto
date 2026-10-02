import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Shield, UserCheck, Eye, Users } from 'lucide-react';

export const RoleSwitcher: React.FC = () => {
  const { currentUser, users, switchUser } = useAuth();

  return (
    <div className="bg-slate-900 text-white px-4 py-2 border-b border-slate-800 text-xs shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* 현재 역할 배지 */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-600 text-white font-medium">
            <Shield className="w-3.5 h-3.5" />
            시연 모드
          </span>
          <span className="text-slate-300">
            현재 접속자: <strong className="text-white text-sm">{currentUser.name}</strong> 
            {currentUser.role !== 'CITIZEN' && (
              <span className="text-slate-400"> ({currentUser.bureauName} {currentUser.departmentName} / <span className="text-amber-400 font-semibold">{currentUser.role}</span>)</span>
            )}
            {currentUser.role === 'CITIZEN' && (
              <span className="text-emerald-400 font-semibold"> (일반 시민 모드)</span>
            )}
          </span>
        </div>

        {/* 역할 원클릭 전환 버튼 목록 */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 mr-1 flex items-center gap-1">
            <UserCheck className="w-3 h-3" /> 역할 빠른 전환:
          </span>

          <button
            type="button"
            onClick={() => switchUser('user_citizen')}
            className={`px-2 py-1 rounded transition-colors ${
              currentUser.id === 'user_citizen'
                ? 'bg-emerald-600 text-white font-bold ring-2 ring-emerald-300'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            시민 모드
          </button>

          <button
            type="button"
            onClick={() => switchUser('user_railway_dept')}
            className={`px-2 py-1 rounded transition-colors ${
              currentUser.id === 'user_railway_dept'
                ? 'bg-blue-600 text-white font-bold ring-2 ring-blue-300'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="교통정책과 (철도·스쿨존 사업 담당)"
          >
            담당자: 교통정책과
          </button>

          <button
            type="button"
            onClick={() => switchUser('user_bus_dept')}
            className={`px-2 py-1 rounded transition-colors ${
              currentUser.id === 'user_bus_dept'
                ? 'bg-blue-600 text-white font-bold ring-2 ring-blue-300'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="대중교통과 (똑버스·G-Pass 담당)"
          >
            담당자: 대중교통과
          </button>

          <button
            type="button"
            onClick={() => switchUser('user_road_dept')}
            className={`px-2 py-1 rounded transition-colors ${
              currentUser.id === 'user_road_dept'
                ? 'bg-blue-600 text-white font-bold ring-2 ring-blue-300'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="도로건설과 (수석대교·도로확장 담당)"
          >
            담당자: 도로건설과
          </button>

          <button
            type="button"
            onClick={() => switchUser('user_traffic_bureau')}
            className={`px-2 py-1 rounded transition-colors ${
              currentUser.id === 'user_traffic_bureau'
                ? 'bg-purple-600 text-white font-bold ring-2 ring-purple-300'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="교통국장실 (교통국 사업 검토/반려 권한)"
          >
            국별관리자: 교통국
          </button>

          <button
            type="button"
            onClick={() => switchUser('user_policy')}
            className={`px-2 py-1 rounded transition-colors ${
              currentUser.id === 'user_policy'
                ? 'bg-amber-600 text-white font-bold ring-2 ring-amber-300'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="정책기획과 (최종승인 / 공개확정 및 게시 권한)"
          >
            정책팀 총괄관리자
          </button>

          <button
            type="button"
            onClick={() => switchUser('user_admin')}
            className={`px-2 py-1 rounded transition-colors ${
              currentUser.id === 'user_admin'
                ? 'bg-rose-600 text-white font-bold ring-2 ring-rose-300'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="시스템 관리자 (감사로그 / 계정·환경설정)"
          >
            시스템 관리자
          </button>
        </div>
      </div>
    </div>
  );
};
