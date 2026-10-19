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
export function toPublicProjectView(p: PromiseProject): PublicProjectView {
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
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;

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

/**
 * 시민 공개용 공약사업 단건 조회 (6하원칙 쉬운말 해설 및 지표 보장)
 */
export function getClientPublicProjectById(id: string): PublicProjectView | null {
  initClientStorage();

  // 1. 이미 공개 저장소에 저장된 프로젝트 목록에서 검색 (id 또는 manageNo)
  const raw = localStorage.getItem(STORAGE_KEYS.PUBLIC_PROJECTS);
  const publicList: PublicProjectView[] = raw ? JSON.parse(raw) : [];
  const foundInPublic = publicList.find(p => p.id === id || p.manageNo === id);
  if (foundInPublic && foundInPublic.easySummary) {
    return foundInPublic;
  }

  // 2. 내부 행정 프로젝트 저장소에서 검색 후 시민 공개용 구조(PublicProjectView)로 변환
  const adminProjects = getClientProjects();
  const rawProject = adminProjects.find(p => p.id === id || p.manageNo === id);
  if (rawProject) {
    return toPublicProjectView(rawProject);
  }

  // 3. 시드(기본) 데이터에서 검색 후 시민 공개용 구조로 변환
  const seedProject = SEED_PROJECTS.find(p => p.id === id || p.manageNo === id);
  if (seedProject) {
    return toPublicProjectView(seedProject);
  }

  return null;
}

/**
 * 시민 맞춤형 쉬운말 AI 질의응답 엔진 (클라이언트 자연어 분석 & 6하원칙 매칭)
 */
export function answerClientAiQuestion(question: string, dong?: string, topic?: string) {
  initClientStorage();

  // 1. 시민 공개용 프로젝트 목록 확보 (SSR 및 비브라우저 환경 안전 지원)
  let projects: PublicProjectView[] = [];
  if (typeof localStorage !== 'undefined') {
    const raw = localStorage.getItem(STORAGE_KEYS.PUBLIC_PROJECTS);
    if (raw) {
      try {
        projects = JSON.parse(raw);
      } catch {}
    }
  }
  if (!projects || projects.length === 0) {
    projects = SEED_PROJECTS.filter(p => p.publicStatus === '게시').map(toPublicProjectView);
  }

  const q = (question || '').trim().toLowerCase();

  // 2. 질의어 기반 가중치 점수 산출
  interface ScoredProject {
    project: PublicProjectView;
    score: number;
  }

  const scored: ScoredProject[] = projects.map(p => {
    let score = 0;
    const title = p.title.toLowerCase();
    const purpose = (p.purpose || '').toLowerCase();
    const dongName = (p.location?.dong || '').toLowerCase();
    const address = (p.location?.address || '').toLowerCase();
    const what = (p.easySummary?.what || '').toLowerCase();

    // 2-1. 지역 일치 가중치
    if (dong && dong !== '전체') {
      if (dongName.includes(dong.toLowerCase()) || address.includes(dong.toLowerCase())) score += 15;
    }
    const dongs = ['다산', '별내', '진접', '화도', '와부', '덕소', '호평', '평내', '퇴계원', '수석', '금곡'];
    for (const d of dongs) {
      if (q.includes(d)) {
        if (dongName.includes(d) || address.includes(d)) score += 15;
      }
    }

    // 2-2. 분야 필터 가중치
    if (topic && topic !== '전체') {
      if (title.includes(topic.toLowerCase()) || p.category.includes(topic)) score += 10;
    }

    // 2-3. 핵심 키워드 가중치 매칭
    // (1) 주차난 / 공영주차장 / 입체형 주차선
    if (q.includes('주차') || q.includes('주차장') || q.includes('주차선') || q.includes('주차난') || q.includes('입체형')) {
      if (p.manageNo === '4-20' || p.manageNo === '4-22' || title.includes('주차')) score += 40;
    }

    // (2) 어린이 / 스마트 스쿨존 / 안심 보행
    if (q.includes('스쿨존') || q.includes('어린이') || q.includes('통학') || q.includes('초등') || q.includes('안심 보행')) {
      if (p.manageNo === '4-25' || title.includes('스쿨존') || title.includes('어린이')) score += 40;
    }

    // (3) 어르신 / 청소년 / G-Pass / 무상 대중교통비 지원
    if (q.includes('어르신') || q.includes('노인') || q.includes('청소년') || q.includes('g-pass') || q.includes('gpass') || q.includes('교통비') || q.includes('무상')) {
      if (p.manageNo === '4-19' || title.includes('g-pass') || title.includes('무상')) score += 40;
    }

    // (4) 지하철 / 철도망 / 9호선 / 8호선 / GTX
    if (q.includes('지하철') || q.includes('철도') || q.includes('전철') || q.includes('9호선') || q.includes('8호선') || q.includes('gtx') || q.includes('환승')) {
      if (title.includes('호선') || title.includes('gtx') || title.includes('철도') || title.includes('환승')) score += 30;
      if (q.includes('9호선') && p.manageNo === '4-01') score += 25;
      if (q.includes('8호선') && p.manageNo === '4-03') score += 25;
      if (q.includes('gtx') && p.manageNo === '4-07-1') score += 25;
      if (q.includes('환승') && p.manageNo === '4-12') score += 25;
    }

    // (5) 똑버스 / DRT / 순환버스
    if (q.includes('똑버스') || q.includes('drt') || q.includes('순환버스') || q.includes('셔틀') || q.includes('버스')) {
      if (p.manageNo === '4-14' || p.manageNo === '4-16' || title.includes('버스')) score += 35;
    }

    // (6) 도로 / 수석대교 / 고속도로 요금 할인
    if (q.includes('도로') || q.includes('수석대교') || q.includes('고속도로') || q.includes('요금') || q.includes('할인') || q.includes('다리') || q.includes('교량')) {
      if (p.manageNo === '4-26' || p.manageNo === '4-27' || title.includes('도로') || title.includes('대교')) score += 35;
    }

    // 2-4. 일반 단어 포함 가중치
    const words = q.split(/\s+/).filter(w => w.length >= 2);
    for (const w of words) {
      if (title.includes(w)) score += 5;
      if (purpose.includes(w)) score += 3;
      if (what.includes(w)) score += 3;
    }

    return { project: p, score };
  });

  // 3. 점수 내림차순 정렬 및 상위 매칭 공약 선별
  scored.sort((a, b) => b.score - a.score);
  let matched = scored.filter(s => s.score >= 5).map(s => s.project);

  // 일치하는 공약이 없으면 대표 주요 공약 3건 제공
  if (matched.length === 0) {
    matched = projects.slice(0, 3);
  }

  // 4. 질의 맥락에 맞춘 맞춤형 서두 작성
  let headerIntro = `질문하신 "${question}" 관련하여 공식 승인된 남양주시 공약사업 **${matched.length}건**의 추진 현황을 6하원칙 쉬운말로 안내해 드립니다.`;
  if (q.includes('주차')) {
    headerIntro = `남양주시의 주차난 해소와 쾌적한 주거환경 조성을 위해 공식 승인되어 추진 중인 **공영주차장 확충 및 주차면 혁신 공약사업 ${matched.length}건**을 안내해 드립니다.`;
  } else if (q.includes('스쿨존') || q.includes('어린이')) {
    headerIntro = `어린이 통학 안전과 안심 보행환경 조성을 위해 추진 중인 **스마트 스쿨존 공약사업 ${matched.length}건**의 세부 진행 상황을 안내해 드립니다.`;
  } else if (q.includes('어르신') || q.includes('청소년') || q.includes('g-pass') || q.includes('교통비')) {
    headerIntro = `어르신과 청소년·아동의 대중교통 이동권 보장을 위한 **남양주 G-Pass 무상 대중교통비 지원 공약사업**의 핵심 내용을 안내해 드립니다.`;
  } else if (q.includes('지하철') || q.includes('철도') || q.includes('9호선') || q.includes('8호선') || q.includes('gtx')) {
    headerIntro = `서울 및 인접 시군으로의 신속한 출퇴근 철도망 확충을 위한 **광역교통 핵심 철도 공약사업 ${matched.length}건**을 안내해 드립니다.`;
  } else if (q.includes('똑버스') || q.includes('버스')) {
    headerIntro = `대중교통 사각지대 해소와 시민 맞춤형 이동 편의 증진을 위한 **똑버스(DRT) 및 순환버스 공약사업**을 안내해 드립니다.`;
  }

  // 5. 6하원칙 기반 상세 답변 문단 조립
  const answerParagraphs: string[] = [headerIntro];

  matched.slice(0, 3).forEach((p, idx) => {
    const summary = p.easySummary;
    answerParagraphs.push(
      `**[사업 ${idx + 1}] [${p.manageNo}] ${p.title}** (${p.executionStatus}, 진척도: ${p.indicatorAchievementRate}%)\n` +
      `• **어떤 사업인가요?** ${summary?.what || p.purpose}\n` +
      `• **누구에게 도움이 되나요?** ${summary?.who || '남양주시민'}\n` +
      `• **어디에서 진행되나요?** ${summary?.where || p.location?.address || `${p.location?.dong || '남양주시'} 일원`}\n` +
      `• **사업 기간 / 총사업비:** ${p.period} (${p.totalBudgetDesc})\n` +
      `• **현재 진행 상황:** ${summary?.progress || p.executionStatus}\n` +
      `• **앞으로의 계획:** ${summary?.next || '세부 실시계획에 따라 단계적 추진 예정'}`
    );
  });

  return {
    question: question || '조건별 맞춤 공약 추천',
    answer: answerParagraphs.join('\n\n'),
    matchedCount: matched.length,
    projects: matched.slice(0, 4).map(p => ({
      id: p.id,
      manageNo: p.manageNo,
      title: p.title,
      status: p.executionStatus,
      achievementRate: p.indicatorAchievementRate,
      dong: p.location?.dong,
      what: p.easySummary?.what || p.purpose
    })),
    dataBaseDate: '2026-09-30',
    disclaimer: '공식 승인된 최신 행정 데이터에 기반하여 답변을 제공하며, 비공개 또는 미확정 예산/일정은 추측하지 않습니다.'
  };
}

