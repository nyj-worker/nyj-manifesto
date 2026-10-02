import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Shield, UserCheck, Key, Lock, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

interface RoleSwitcherProps {
  onRoleSwitchSuccess?: (userId: string, targetTab: string, defaultProjectId?: string) => void;
}

interface TargetRoleInfo {
  id: string;
  label: string;
  roleDesc: string;
  dept: string;
  targetTab: string;
  defaultProjectId?: string;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ onRoleSwitchSuccess }) => {
  const { currentUser, switchUser, setPortalMode } = useAuth();

  // 모달 제어 상태
  const [modalOpen, setModalOpen] = useState(false);
  const [targetUser, setTargetUser] = useState<TargetRoleInfo | null>(null);
  const [password, setPassword] = useState('demo2026');

  // 역할 버튼 클릭 핸들러
  const handleRoleClick = (roleInfo: TargetRoleInfo) => {
    if (roleInfo.id === 'user_citizen') {
      // 시민 모드는 인증 모달 없이 즉시 전환
      switchUser(roleInfo.id);
      setPortalMode('public');
      if (onRoleSwitchSuccess) {
        onRoleSwitchSuccess(roleInfo.id, 'public-home');
      }
      return;
    }

    // 공무원 역할 클릭 시 "시연 모드" 암호 안내 모달창 표시
    setTargetUser(roleInfo);
    setPassword('demo2026');
    setModalOpen(true);
  };

  // 모달에서 확인 및 시연 접속 실행 (해당 기능 실제 작동)
  const handleConfirmAccess = () => {
    if (!targetUser) return;

    // 1. 해당 역할로 사용자 전환
    switchUser(targetUser.id);
    
    // 2. 내부 행정관리 포털로 전환
    setPortalMode('admin');
    
    // 3. 모달 닫기
    setModalOpen(false);

    // 4. 부서별 최적 실무 화면으로 즉시 전환 콜백 실행
    if (onRoleSwitchSuccess) {
      onRoleSwitchSuccess(targetUser.id, targetUser.targetTab, targetUser.defaultProjectId);
    }
  };

  return (
    <>
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

          {/* 역할 빠른 전환 버튼 목록 */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400 mr-1 flex items-center gap-1">
              <UserCheck className="w-3 h-3" /> 역할 빠른 전환:
            </span>

            <button
              type="button"
              id="role-btn-citizen"
              onClick={() => handleRoleClick({
                id: 'user_citizen',
                label: '일반 시민',
                roleDesc: '공식 공개 공약 열람',
                dept: '시민',
                targetTab: 'public-home'
              })}
              className={`px-2.5 py-1 rounded transition-colors ${
                currentUser.id === 'user_citizen'
                  ? 'bg-emerald-600 text-white font-bold ring-2 ring-emerald-300'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              시민 모드
            </button>

            <button
              type="button"
              id="role-btn-traffic-dept"
              onClick={() => handleRoleClick({
                id: 'user_railway_dept',
                label: '담당자: 교통정책과',
                roleDesc: '철도망 확충(GTX 등) 및 스쿨존 공약 실적 관리 및 승인 신청',
                dept: '교통국 교통정책과 (김교통)',
                targetTab: 'projects',
                defaultProjectId: 'proj_4_01'
              })}
              className={`px-2.5 py-1 rounded transition-colors ${
                currentUser.id === 'user_railway_dept'
                  ? 'bg-blue-600 text-white font-bold ring-2 ring-blue-300'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              담당자: 교통정책과
            </button>

            <button
              type="button"
              id="role-btn-bus-dept"
              onClick={() => handleRoleClick({
                id: 'user_bus_dept',
                label: '담당자: 대중교통과',
                roleDesc: '똑버스 DRT, 순환버스, G-Pass 무상교통 실적 관리',
                dept: '교통국 대중교통과 (박대중)',
                targetTab: 'projects',
                defaultProjectId: 'proj_4_06'
              })}
              className={`px-2.5 py-1 rounded transition-colors ${
                currentUser.id === 'user_bus_dept'
                  ? 'bg-blue-600 text-white font-bold ring-2 ring-blue-300'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              담당자: 대중교통과
            </button>

            <button
              type="button"
              id="role-btn-road-dept"
              onClick={() => handleRoleClick({
                id: 'user_road_dept',
                label: '담당자: 도로건설과',
                roleDesc: '수석대교 6차선 직결 및 도로 확장 실적 관리',
                dept: '교통국 도로건설과 (이도로)',
                targetTab: 'projects',
                defaultProjectId: 'proj_4_11'
              })}
              className={`px-2.5 py-1 rounded transition-colors ${
                currentUser.id === 'user_road_dept'
                  ? 'bg-blue-600 text-white font-bold ring-2 ring-blue-300'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              담당자: 도로건설과
            </button>

            <button
              type="button"
              id="role-btn-traffic-bureau"
              onClick={() => handleRoleClick({
                id: 'user_traffic_bureau',
                label: '국별관리자: 교통국',
                roleDesc: '소관 교통국 산하 4개 과 공약 심사 및 1차 승인/반려',
                dept: '교통국장실 (박교통)',
                targetTab: 'approvals'
              })}
              className={`px-2.5 py-1 rounded transition-colors ${
                currentUser.id === 'user_traffic_bureau'
                  ? 'bg-purple-600 text-white font-bold ring-2 ring-purple-300'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              국별관리자: 교통국
            </button>

            <button
              type="button"
              id="role-btn-policy-lead"
              onClick={() => handleRoleClick({
                id: 'user_policy',
                label: '정책팀 총괄관리자',
                roleDesc: '전 부서 공약 최종 승인, 공개자료 확정 및 시민 공식 게시',
                dept: '기획조정실 정책기획과 (김정책)',
                targetTab: 'publish'
              })}
              className={`px-2.5 py-1 rounded transition-colors ${
                currentUser.id === 'user_policy'
                  ? 'bg-amber-600 text-white font-bold ring-2 ring-amber-300'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              정책팀 총괄관리자
            </button>

            <button
              type="button"
              id="role-btn-admin"
              onClick={() => handleRoleClick({
                id: 'user_admin',
                label: '시스템 관리자',
                roleDesc: '시스템 전체 감사 로그, 사용자 권한 및 데이터 백업 관리',
                dept: '정보통신과 (최관리)',
                targetTab: 'audit-logs'
              })}
              className={`px-2.5 py-1 rounded transition-colors ${
                currentUser.id === 'user_admin'
                  ? 'bg-rose-600 text-white font-bold ring-2 ring-rose-300'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              시스템 관리자
            </button>
          </div>
        </div>
      </div>

      {/* 시연 모드 담당자 암호 안내 팝업 모달창 */}
      {modalOpen && targetUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 border border-slate-100">
            {/* 모달 헤더: "시연 모드" */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shadow-xs">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-1.5">
                    시연 모드
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">데모 전용</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">민선9기 공약사업 통합관리 시스템</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 text-sm font-bold transition-colors"
                aria-label="닫기"
              >
                ✕
              </button>
            </div>

            {/* 사용자 요청 핵심 메시지 영역: "향후 담당자 관리를 위한 암호를 입력해야 합니다." */}
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300/80 space-y-2">
              <div className="flex items-start gap-2.5 text-amber-950 font-bold text-sm">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-amber-900 font-extrabold text-sm sm:text-base">
                    향후 담당자 관리를 위한 암호를 입력해야 합니다.
                  </div>
                  <p className="text-xs text-amber-800 font-normal mt-1 leading-relaxed">
                    본 시스템은 남양주시 공약 실무 제안용 <strong>시연 모드(Demo)</strong>입니다. 실제 상용 서비스 운영 시에는 부서 담당자의 행정전자서명(GPKI) 및 2차 보안 암호가 필수입니다.
                  </p>
                </div>
              </div>
            </div>

            {/* 전환 대상 부서 및 권한 정보 */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">접속 대상 직책:</span>
                <strong className="text-blue-700 text-sm font-bold">{targetUser.label}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">소관 부서:</span>
                <strong className="text-slate-800">{targetUser.dept}</strong>
              </div>
              <div className="pt-2 border-t border-slate-200/80 text-slate-600 leading-relaxed flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>{targetUser.roleDesc}</span>
              </div>
            </div>

            {/* 암호 입력 필드 */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                시연용 담당자 암호 (데모 자동 입력됨)
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  id="demo-password-input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleConfirmAccess()}
                  placeholder="암호를 입력하세요"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                💡 시연 편의를 위해 암호가 자동 채워져 있습니다. 아래 버튼을 누르면 즉시 해당 담당자 기능이 작동합니다.
              </p>
            </div>

            {/* 모달 하단 액션 버튼 */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                id="btn-confirm-demo-access"
                onClick={handleConfirmAccess}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all transform active:scale-98"
              >
                <span>시연 모드로 기능 작동하기</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
