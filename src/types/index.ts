// ==========================================
// 사용자 및 권한 (RBAC) 정의
// ==========================================
export type UserRole =
  | 'SYS_ADMIN'      // 시스템 관리자
  | 'POLICY_ADMIN'   // 정책팀 총괄관리자
  | 'BUREAU_ADMIN'   // 국별 관리자
  | 'DEPT_USER'      // 부서별 업무담당자
  | 'INTERNAL_VIEWER'// 내부 열람 사용자
  | 'CITIZEN';       // 일반 시민

export interface User {
  id: string;
  name: string;
  role: UserRole;
  departmentId: string;
  departmentName: string;
  bureauId: string;
  bureauName: string;
  email: string;
  phone?: string;
}

// ==========================================
// 공약사업 기본정보 (PDF 실천계획서 서식 100% 반영)
// ==========================================
export type ProjectCategory = '공약사업' | '장기(지역)사업' | '현안(지역)사업';
export type NeedHelpType = '제도' | '재정' | '권한' | '해당없음';
export type CompletionPeriod = '임기내' | '임기후';
export type NewOrContinuing = '신규' | '계속';

// 3가지 상태 필드 분리 관리 (요구사항 제6조)
export type ProjectExecutionStatus = '추진전' | '정상추진' | '지연' | '완료' | '보류';
export type ReportProcessingStatus = '작성중' | '국검토대기' | '정책팀검토대기' | '보완요청' | '최종승인';
export type PublicReleaseStatus = '미공개' | '공개자료작성중' | '공개확정' | '게시' | '공개철회';

export type LocationType = '단일지점' | '복수지점' | '구역' | '시전체';

// 재원투자 계획 행
export interface YearlyFunding {
  year: number; // 2026, 2027, 2028, 2029, 2030, 9999(향후)
  total: number; // 계
  national: number; // 국비
  provincial: number; // 도비
  municipal: number; // 시비
  other: number; // 기타 (LH, 민자 등)
}

export interface InvestmentPlan {
  totalBudget: number; // 총사업비 (백만원 또는 억원)
  unit: '백만원' | '억원';
  priorInvested: number; // 기투자액
  otherNote?: string; // 기타 재원 설명 (예: LH 광역교통부담금 등)
  yearly: YearlyFunding[];
}

// 연도별 추진계획 및 실적
export interface YearlyScheduleProgress {
  year: number;
  plan: string;
  actual?: string;
  progressRate: number; // 누적 추진율(%)
}

// 일자별 추진실적 히스토리
export interface HistoryRecord {
  date: string; // YYYY.MM.DD 또는 YYYY.MM
  content: string;
}

// 성과지표
export interface PerformanceIndicator {
  id: string;
  projectId: string;
  name: string; // 지표명
  unit: string; // 단위 (개소, km, 대, %, 명 등)
  targetValue: number; // 목표값
  currentValue: number; // 실적값
  baselineValue: number; // 기준값
  calcType: '증가형' | '감소형' | '단계형' | '정성형';
  achievementRate: number; // 달성률(%)
}

// 공약사업 전체 구조 (내부 행정용)
export interface PromiseProject {
  id: string;
  manageNo: string; // 관리번호 (예: 4-01)
  title: string; // 과제명/사업명
  category: ProjectCategory;
  needHelp: NeedHelpType[]; // 상급기관 도움 필요성
  isNew: NewOrContinuing;
  completionPeriod: CompletionPeriod;
  period: string; // 사업기간 (예: 2020~2031)
  currentStage: string; // 추진상황 요약
  hostAgency: string; // 사업주체 (국토부, LH, 경기도 등)
  bureauId: string;
  bureauName: string; // 소관 실국 (예: 교통국)
  departmentId: string;
  departmentName: string; // 담당부서 (예: 교통정책과)
  teamName: string; // 담당팀 (예: 철도기획팀)
  managerName: string; // 담당자 이름
  managerPhone: string; // 담당자 내선번호 (내부 비공개)
  
  // 사업목적 및 개요
  purpose: string; // 사업목적
  overview: {
    section?: string; // 사업구간
    volume?: string; // 사업량
    totalCostDesc?: string; // 총사업비 설명
    locationDesc?: string; // 위치 상세
  };

  // 재원투자계획
  investmentPlan: InvestmentPlan;

  // 쟁점사항 및 해소방안
  issuesAndSolutions: {
    issues: string; // 문제점 / 쟁점사항
    solutions: string; // 해소방안 / 대책
  };

  // 사업목표
  targets: {
    finalGoal: string; // 최종 목표
    termGoal: string; // 임기내 목표
  };

  // 연도별 추진계획 및 실적
  schedules: YearlyScheduleProgress[];

  // 일자별 추진실적 및 향후계획
  achievements: HistoryRecord[];
  futurePlans: HistoryRecord[];

  // 위치 및 지도 정보
  location: {
    type: LocationType;
    address: string;
    dong: string; // 행정동 (예: 다산동, 진접읍, 별내동, 와부읍 등)
    lat?: number;
    lng?: number;
  };

  // 상태 관리
  executionStatus: ProjectExecutionStatus;
  reportStatus: ReportProcessingStatus;
  publicStatus: PublicReleaseStatus;

  currentVersion: number;
  lastUpdated: string;
  createdAt: string;

  // 성과지표
  indicators: PerformanceIndicator[];
  
  // 사진 및 증빙
  photos?: {
    beforeUrl?: string;
    afterUrl?: string;
    planUrl?: string; // 조감도/노선도
    caption?: string;
  };
}

// ==========================================
// 검토 및 승인 이력
// ==========================================
export interface ApprovalHistory {
  id: string;
  projectId: string;
  version: number;
  step: '부서제출' | '국검토' | '정책팀최종승인' | '공개확정' | '반려';
  action: 'SUBMIT' | 'APPROVE' | 'REJECT' | 'PUBLISH' | 'WITHDRAW';
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  actorDepartment: string;
  comment: string;
  rejectReason?: string;
  createdAt: string;
}

// ==========================================
// 시민 공개용 데이터 구조 (격리된 별도 데이터 - 민감정보 배제)
// ==========================================
export interface PublicProjectView {
  id: string;
  manageNo: string;
  title: string;
  category: ProjectCategory;
  isNew: NewOrContinuing;
  completionPeriod: CompletionPeriod;
  period: string;
  bureauName: string;
  departmentName: string;
  teamName: string;
  
  // 쉬운말 설명 (시민 눈높이 맞춤)
  easySummary: {
    what: string;       // 어떤 사업인가요?
    who: string;        // 누구에게 도움이 되나요?
    where: string;      // 어디에서 진행되나요?
    when: string;       // 언제 진행되나요?
    progress: string;   // 현재 얼마나 진행됐나요?
    next: string;       // 앞으로 무엇이 남았나요?
  };

  purpose: string;
  overviewVolume?: string;
  location: {
    type: LocationType;
    address: string;
    dong: string;
    lat?: number;
    lng?: number;
  };
  
  // 3대 지표 분리
  executionStatus: ProjectExecutionStatus;
  indicatorAchievementRate: number; // 성과지표 달성률 (%)
  budgetExecutionRate: number;      // 예산 집행률 (%)
  totalBudgetDesc: string;          // 공개 총사업비 설명

  // 공개 사진
  photos?: {
    beforeUrl?: string;
    afterUrl?: string;
    planUrl?: string;
    caption?: string;
  };

  publicVersion: number;
  publishedAt: string;
  dataBaseDate: string; // 데이터 기준일
}

// 감사 로그
export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  timestamp: string;
}
