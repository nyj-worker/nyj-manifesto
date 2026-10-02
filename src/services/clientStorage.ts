import { PromiseProject, PublicProjectView, ApprovalHistory, User } from '../types/index.ts';
import { SEED_PROJECTS, SEED_USERS } from '../../server/seed_data.ts';

const STORAGE_KEYS = {
  PROJECTS: 'nyj_manifesto_projects',
  PUBLIC_PROJECTS: 'nyj_manifesto_public_projects',
  HISTORY: 'nyj_manifesto_history',
  AUDIT_LOGS: 'nyj_manifesto_audit_logs',
  USERS: 'nyj_manifesto_users'
};

/**
 * 6하원칙 쉬운말 요약 생성기 (클라이언트 전용)
 */
function createEasySummary(project: PromiseProject): PublicProjectView['easySummary'] {
  const what = `${project.title}은(는) ${project.purpose}`;
  let who = '남양주시민 및 대중교통 이용자';
  if (project.manageNo === '4-25') who = '남양주시 관내 초등학생 및 학부모';
  else if (project.manageNo === '5-20') who = '이동이 불편한 장애인 및 교통약자';
  else if (project.manageNo === '4-19') who = '남양주시 거주 만 65세 이상 어르신 및 청소년·어린이';
  else if (project.manageNo === '4-27') who = '화도·호평·평내 출퇴근 차량 운전자';
  else if (project.title.includes('철도') || project.title.includes('선')) who = '서울 및 인접 시군으로 통근·통학하는 대중교통 이용 시민';

  const where = project.location.address || `${project.location.dong} 일원`;
  const when = `${project.period} (임기 목표: ${project.targets.termGoal})`;
  
  const currentProgress = project.schedules && project.schedules.length > 0 
    ? project.schedules[0].progressRate || 20 
    : 20;
  const progress = `${project.currentStage} (누적 추진율 약 ${currentProgress}%)`;
  
  const next = project.futurePlans && project.futurePlans.length > 0
    ? `${project.futurePlans[0].date}: ${project.futurePlans[0].content}`
    : '차기 세부 실시계획 수립 및 인허가 절차 진행 예정';

  return { what, who, where, when, progress, next };
}

/**
 * 프로젝트를 시민 공개용 구조로 변환
 */
function toPublicProjectView(p: PromiseProject): PublicProjectView {
  const easy = createEasySummary(p);
  const achRate = p.indicators && p.indicators.length > 0 ? p.indicators[0].achievementRate : 0;
  const totalBud = p.investmentPlan.totalBudget || 1;
  const budgetRate = Math.min(100, Math.round(((p.investmentPlan.priorInvested || 0) / totalBud) * 100));
  const totalDesc = `${p.investmentPlan.totalBudget.toLocaleString()} ${p.investmentPlan.unit} (${p.investmentPlan.otherNote || '시비/도비/국비 분담'})`;

  return {
    id: p.id,
    manageNo: p.manageNo,
    title: p.title,
    category: p.category,
    isNew: p.isNew,
    completionPeriod: p.completionPeriod,
    period: p.period,
    bureauName: p.bureauName,
    departmentName: p.departmentName,
    teamName: p.teamName,
    easySummary: easy,
    purpose: p.purpose,
    overviewVolume: p.overview.volume || '',
    location: p.location,
    executionStatus: p.executionStatus,
    indicatorAchievementRate: achRate,
    budgetExecutionRate: budgetRate,
    totalBudgetDesc: totalDesc,
    photos: p.photos,
    publicVersion: p.currentVersion,
    publishedAt: p.lastUpdated,
    dataBaseDate: '2026-09-30'
  };
}

/**
 * 클라이언트 로컬스토리지 저장소 초기화 (자가 복구 기능 내장)
 */
export function initClientStorage(force = false) {
  // 1. 내부 관리용 프로젝트 목록
  const projsRaw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
  let needProjs = force || !projsRaw || projsRaw === '[]';
  if (!needProjs && projsRaw) {
    try {
      const parsed = JSON.parse(projsRaw);
      if (!Array.isArray(parsed) || parsed.length === 0) needProjs = true;
    } catch {
      needProjs = true;
    }
  }
  if (needProjs) {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(SEED_PROJECTS));
  }

  // 2. 사용자 목록
  const usersRaw = localStorage.getItem(STORAGE_KEYS.USERS);
  let needUsers = force || !usersRaw || usersRaw === '[]';
  if (needUsers) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
  }

  // 3. 시민 공개용 프로젝트 목록 (핵심: 빈 배열인 경우 즉시 12개 공개 공약으로 자동 복구)
  const publicRaw = localStorage.getItem(STORAGE_KEYS.PUBLIC_PROJECTS);
  let needPublic = force || !publicRaw || publicRaw === '[]';
  if (!needPublic && publicRaw) {
    try {
      const parsed = JSON.parse(publicRaw);
      if (!Array.isArray(parsed) || parsed.length === 0) needPublic = true;
    } catch {
      needPublic = true;
    }
  }
  if (needPublic) {
    const published = SEED_PROJECTS.filter(p => p.publicStatus === '게시').map(toPublicProjectView);
    localStorage.setItem(STORAGE_KEYS.PUBLIC_PROJECTS, JSON.stringify(published));
  }

  // 4. 이력 및 감사 로그
  if (!localStorage.getItem(STORAGE_KEYS.HISTORY)) {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([]));
  }
  const auditRaw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
  if (!auditRaw || auditRaw === '[]') {
    localStorage.setItem(
      STORAGE_KEYS.AUDIT_LOGS,
      JSON.stringify([
        {
          id: 'log_01',
          actor_name: '김정책',
          actor_role: 'POLICY_ADMIN',
          action: 'PUBLISH',
          target_type: 'PROJECT',
          target_id: 'proj_4_01',
          details: '김정책(정책기획과) [4-01 9호선 조기 착공 및 적기 개통] 사업 시민 포털 공식 게시 승인',
          timestamp: '2026-09-30T10:15:00.000Z'
        },
        {
          id: 'log_02',
          actor_name: '박교통',
          actor_role: 'BUREAU_ADMIN',
          action: 'BUREAU_APPROVE',
          target_type: 'PROJECT',
          target_id: 'proj_4_01',
          details: '박교통(교통국장) 소관 [4-01] 2026년 추진실적 국 검토 완료 및 정책팀 송부',
          timestamp: '2026-09-28T14:30:00.000Z'
        },
        {
          id: 'log_03',
          actor_name: '김교통',
          actor_role: 'DEPT_USER',
          action: 'SUBMIT',
          target_type: 'PROJECT',
          target_id: 'proj_4_01',
          details: '김교통(교통정책과) [4-01] 2026년 실시설계 착수 실적 입력 및 국 검토 제출',
          timestamp: '2026-09-27T09:00:00.000Z'
        },
        {
          id: 'log_04',
          actor_name: '박대중',
          actor_role: 'DEPT_USER',
          action: 'UPDATE_PROJECT',
          target_type: 'PROJECT',
          target_id: 'proj_4_14',
          details: '박대중(대중교통과) [4-14 남양주형 똑버스 DRT] 1권역 시범운영 계획 실적 수정 저장',
          timestamp: '2026-09-26T16:20:00.000Z'
        },
        {
          id: 'log_05',
          actor_name: '최관리',
          actor_role: 'SYS_ADMIN',
          action: 'INIT_SYSTEM',
          target_type: 'SYSTEM',
          target_id: 'ALL',
          details: '민선9기 공약 실천계획 통합관리 시스템 가동 및 16개 핵심 사업 적재 완료',
          timestamp: '2026-09-25T08:00:00.000Z'
        }
      ])
    );
  }
}

export function getClientAuditLogs() {
  initClientStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
  return raw ? JSON.parse(raw) : [];
}

/**
 * 클라이언트 전용 공약 목록 조회
 */
export function getClientProjects(): PromiseProject[] {
  initClientStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
  return raw ? JSON.parse(raw) : SEED_PROJECTS;
}

/**
 * 대시보드 종합 통계 산출
 */
export function getClientDashboardStats() {
  const projects = getClientProjects();
  const totalCount = projects.length;

  const executionStats = {
    정상추진: projects.filter(p => p.executionStatus === '정상추진').length,
    지연: projects.filter(p => p.executionStatus === '지연').length,
    완료: projects.filter(p => p.executionStatus === '완료').length,
    보류: projects.filter(p => p.executionStatus === '보류').length,
    추진전: projects.filter(p => p.executionStatus === '추진전').length
  };

  const reportStats = {
    작성중: projects.filter(p => p.reportStatus === '작성중').length,
    국검토대기: projects.filter(p => p.reportStatus === '국검토대기').length,
    정책팀검토대기: projects.filter(p => p.reportStatus === '정책팀검토대기').length,
    보완요청: projects.filter(p => p.reportStatus === '보완요청').length,
    최종승인: projects.filter(p => p.reportStatus === '최종승인').length
  };

  const publicStats = {
    게시: projects.filter(p => p.publicStatus === '게시').length,
    공개확정: projects.filter(p => p.publicStatus === '공개확정').length,
    공개자료작성중: projects.filter(p => p.publicStatus === '공개자료작성중').length,
    미공개: projects.filter(p => p.publicStatus === '미공개').length,
    공개철회: projects.filter(p => p.publicStatus === '공개철회').length
  };

  const deptMap: Record<string, any> = {};
  for (const p of projects) {
    if (!deptMap[p.departmentId]) {
      deptMap[p.departmentId] = {
        name: p.departmentName,
        bureau: p.bureauName,
        total: 0,
        delayed: 0,
        completed: 0,
        pendingReview: 0
      };
    }
    deptMap[p.departmentId].total += 1;
    if (p.executionStatus === '지연') deptMap[p.departmentId].delayed += 1;
    if (p.executionStatus === '완료') deptMap[p.departmentId].completed += 1;
    if (p.reportStatus === '국검토대기' || p.reportStatus === '정책팀검토대기') {
      deptMap[p.departmentId].pendingReview += 1;
    }
  }

  const delayedProjects = projects
    .filter(p => p.executionStatus === '지연')
    .map(p => ({
      id: p.id,
      manageNo: p.manageNo,
      title: p.title,
      departmentName: p.departmentName,
      issues: p.issuesAndSolutions?.issues || '',
      lastUpdated: p.lastUpdated
    }));

  const pendingApprovals = projects
    .filter(p => p.reportStatus === '국검토대기' || p.reportStatus === '정책팀검토대기')
    .map(p => ({
      id: p.id,
      manageNo: p.manageNo,
      title: p.title,
      bureauId: p.bureauId,
      departmentName: p.departmentName,
      reportStatus: p.reportStatus,
      managerName: p.managerName,
      lastUpdated: p.lastUpdated
    }));

  const rawLogs = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
  const recentLogs = rawLogs ? JSON.parse(rawLogs) : [];

  return {
    totalCount,
    executionStats,
    reportStats,
    publicStats,
    departments: Object.values(deptMap),
    delayedProjects,
    pendingApprovals,
    recentLogs
  };
}

/**
 * 클라이언트 프로젝트 단건 조회
 */
export function getClientProjectById(id: string) {
  const projects = getClientProjects();
  const project = projects.find(p => p.id === id);
  const rawHist = localStorage.getItem(STORAGE_KEYS.HISTORY);
  const allHist: ApprovalHistory[] = rawHist ? JSON.parse(rawHist) : [];
  const history = allHist.filter(h => h.projectId === id);

  return { project, history };
}

/**
 * 클라이언트 프로젝트 실적 수정/저장
 */
export function updateClientProject(id: string, updates: any, currentUser: User) {
  const projects = getClientProjects();
  const index = projects.findIndex(p => p.id === id);
  if (index === -1) return null;

  const existing = projects[index];
  const updated: PromiseProject = {
    ...existing,
    ...updates,
    issuesAndSolutions: {
      ...existing.issuesAndSolutions,
      ...(updates.issuesAndSolutions || {})
    },
    investmentPlan: {
      ...existing.investmentPlan,
      ...(updates.investmentPlan || {})
    },
    lastUpdated: new Date().toISOString().split('T')[0]
  };

  projects[index] = updated;
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));

  // 감사 로그
  addClientAuditLog(
    currentUser,
    'UPDATE_PROJECT',
    id,
    `${currentUser.name}(${currentUser.departmentName}) 실적 수정 저장`
  );

  return updated;
}

/**
 * 클라이언트 상태 전이 (승인/반려/게시/철회)
 */
export function transitionClientProject(
  id: string,
  action: string,
  comment: string,
  rejectReason: string | undefined,
  currentUser: User
) {
  const projects = getClientProjects();
  const index = projects.findIndex(p => p.id === id);
  if (index === -1) return null;

  const project = projects[index];
  let nextReport = project.reportStatus;
  let nextPublic = project.publicStatus;
  let historyStep: any = '부서제출';

  if (action === 'SUBMIT') {
    nextReport = '국검토대기';
    historyStep = '부서제출';
  } else if (action === 'BUREAU_APPROVE') {
    nextReport = '정책팀검토대기';
    historyStep = '국검토';
  } else if (action === 'BUREAU_REJECT' || action === 'POLICY_REJECT') {
    nextReport = '보완요청';
    historyStep = '반려';
  } else if (action === 'POLICY_APPROVE') {
    nextReport = '최종승인';
    historyStep = '정책팀최종승인';
  } else if (action === 'CONFIRM_PUBLIC') {
    nextPublic = '공개확정';
    historyStep = '공개확정';
  } else if (action === 'PUBLISH') {
    nextPublic = '게시';
    historyStep = '공개확정';
  } else if (action === 'WITHDRAW') {
    nextPublic = '공개철회';
    historyStep = '반려';
  }

  const updated: PromiseProject = {
    ...project,
    reportStatus: nextReport,
    publicStatus: nextPublic,
    lastUpdated: new Date().toISOString().split('T')[0]
  };

  projects[index] = updated;
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));

  // 시민 공개 저장소 동기화
  const rawPublic = localStorage.getItem(STORAGE_KEYS.PUBLIC_PROJECTS);
  let publicList: PublicProjectView[] = rawPublic ? JSON.parse(rawPublic) : [];

  if (nextPublic === '게시') {
    publicList = publicList.filter(p => p.id !== id);
    publicList.push(toPublicProjectView(updated));
  } else if (action === 'WITHDRAW') {
    publicList = publicList.filter(p => p.id !== id);
  }
  localStorage.setItem(STORAGE_KEYS.PUBLIC_PROJECTS, JSON.stringify(publicList));

  // 이력 저장
  const rawHist = localStorage.getItem(STORAGE_KEYS.HISTORY);
  const allHist: ApprovalHistory[] = rawHist ? JSON.parse(rawHist) : [];
  allHist.unshift({
    id: `appr_${Date.now()}`,
    projectId: id,
    version: updated.currentVersion,
    step: historyStep,
    action: action as any,
    actorId: currentUser.id,
    actorName: currentUser.name,
    actorRole: currentUser.role,
    actorDepartment: currentUser.departmentName,
    comment: comment || '',
    rejectReason: rejectReason || undefined,
    createdAt: new Date().toISOString()
  });
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(allHist));

  // 감사 로그
  addClientAuditLog(
    currentUser,
    action,
    id,
    `${currentUser.name}(${currentUser.role}) [${project.manageNo}] 사업 상태 변경 (${action})`
  );

  return updated;
}

/**
 * 감사 로그 기록
 */
function addClientAuditLog(user: User, action: string, targetId: string, details: string) {
  const rawLogs = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
  const logs = rawLogs ? JSON.parse(rawLogs) : [];
  logs.unshift({
    id: `log_${Date.now()}`,
    actor_id: user.id,
    actor_name: user.name,
    actor_role: user.role,
    action,
    target_type: 'PROJECT',
    target_id: targetId,
    details,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs.slice(0, 100)));
}

/**
 * 시민 공개 통계 및 목록
 */
export function getClientPublicStats() {
  initClientStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.PUBLIC_PROJECTS);
  const list: PublicProjectView[] = raw ? JSON.parse(raw) : [];

  const totalCount = list.length;
  const completedCount = list.filter(p => p.executionStatus === '완료').length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const totalAch = list.reduce((a, b) => a + (b.indicatorAchievementRate || 0), 0);
  const avgIndicatorAchievementRate = totalCount > 0 ? Math.round(totalAch / totalCount) : 0;
  const totalBud = list.reduce((a, b) => a + (b.budgetExecutionRate || 0), 0);
  const avgBudgetExecutionRate = totalCount > 0 ? Math.round(totalBud / totalCount) : 0;

  return {
    totalCount,
    completedCount,
    completionRate,
    avgIndicatorAchievementRate,
    avgBudgetExecutionRate,
    dataBaseDate: '2026-09-30'
  };
}

export function getClientPublicProjects(dong?: string, status?: string) {
  initClientStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.PUBLIC_PROJECTS);
  let projects: PublicProjectView[] = raw ? JSON.parse(raw) : [];

  if (dong && dong !== '전체') {
    projects = projects.filter(p => p.location.dong === dong || p.location.type === '시전체');
  }
  if (status && status !== '전체') {
    projects = projects.filter(p => p.executionStatus === status);
  }

  const mappedProjects = projects.filter(p => p.location.lat && p.location.lng && p.location.type !== '시전체');
  const cityWideProjects = projects.filter(p => !p.location.lat || !p.location.lng || p.location.type === '시전체');

  return {
    total: projects.length,
    projects,
    mappedProjects,
    cityWideProjects
  };
}
