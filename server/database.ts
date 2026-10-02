import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { SEED_USERS, SEED_PROJECTS } from './seed_data.ts';
import { PromiseProject, PublicProjectView } from '../src/types/index.ts';

// 데이터 디렉터리 보장
const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'promise_system.db');
export const db = new DatabaseSync(DB_PATH);

// 외래키 활성화
db.exec('PRAGMA foreign_keys = ON;');

/**
 * 6하원칙 쉬운말 요약 생성기 (내장 규칙/템플릿 엔진)
 */
export function generateEasySummary(project: PromiseProject): PublicProjectView['easySummary'] {
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
 * 데이터베이스 테이블 초기화
 */
export function initDatabase() {
  // 1. 사용자 테이블
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      department_id TEXT,
      department_name TEXT,
      bureau_id TEXT,
      bureau_name TEXT,
      email TEXT,
      phone TEXT
    );
  `);

  // 2. 내부 행정 공약사업 테이블
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      manage_no TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      need_help TEXT,
      is_new TEXT,
      completion_period TEXT,
      period TEXT,
      current_stage TEXT,
      host_agency TEXT,
      bureau_id TEXT,
      bureau_name TEXT,
      department_id TEXT,
      department_name TEXT,
      team_name TEXT,
      manager_name TEXT,
      manager_phone TEXT,
      purpose TEXT,
      overview TEXT,
      investment_plan TEXT,
      issues_and_solutions TEXT,
      targets TEXT,
      schedules TEXT,
      achievements TEXT,
      future_plans TEXT,
      location TEXT,
      execution_status TEXT NOT NULL,
      report_status TEXT NOT NULL,
      public_status TEXT NOT NULL,
      current_version INTEGER DEFAULT 1,
      last_updated TEXT,
      created_at TEXT,
      indicators TEXT,
      photos TEXT
    );
  `);

  // 3. 검토 및 승인 이력 테이블
  db.exec(`
    CREATE TABLE IF NOT EXISTS approval_history (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      version INTEGER NOT NULL,
      step TEXT NOT NULL,
      action TEXT NOT NULL,
      actor_id TEXT NOT NULL,
      actor_name TEXT NOT NULL,
      actor_role TEXT NOT NULL,
      actor_department TEXT,
      comment TEXT,
      reject_reason TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );
  `);

  // 4. 시민 공개용 전용 격리 테이블 (비공개 데이터 배제)
  db.exec(`
    CREATE TABLE IF NOT EXISTS public_projects (
      id TEXT PRIMARY KEY,
      manage_no TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      is_new TEXT,
      completion_period TEXT,
      period TEXT,
      bureau_name TEXT,
      department_name TEXT,
      team_name TEXT,
      easy_summary TEXT NOT NULL,
      purpose TEXT NOT NULL,
      overview_volume TEXT,
      location TEXT NOT NULL,
      execution_status TEXT NOT NULL,
      indicator_achievement_rate REAL DEFAULT 0,
      budget_execution_rate REAL DEFAULT 0,
      total_budget_desc TEXT,
      photos TEXT,
      public_version INTEGER DEFAULT 1,
      published_at TEXT NOT NULL,
      data_base_date TEXT NOT NULL
    );
  `);

  // 5. 감사 로그 테이블
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      actor_id TEXT NOT NULL,
      actor_name TEXT NOT NULL,
      actor_role TEXT NOT NULL,
      action TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      details TEXT,
      timestamp TEXT NOT NULL
    );
  `);

  // 시드 데이터 주입 검사
  const userCount = db.prepare('SELECT COUNT(*) as cnt FROM users').get() as { cnt: number };
  if (userCount.cnt === 0) {
    console.log('[DB] 초기 사용자 데이터 주입 중...');
    const insertUser = db.prepare(`
      INSERT INTO users (id, name, role, department_id, department_name, bureau_id, bureau_name, email, phone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const u of SEED_USERS) {
      insertUser.run(
        u.id, u.name, u.role, u.departmentId, u.departmentName,
        u.bureauId, u.bureauName, u.email, u.phone || null
      );
    }
  }

  const projectCount = db.prepare('SELECT COUNT(*) as cnt FROM projects').get() as { cnt: number };
  if (projectCount.cnt === 0) {
    console.log('[DB] PDF 기반 교통국 16개 핵심 사업 시드 데이터 주입 중...');
    const insertProject = db.prepare(`
      INSERT INTO projects (
        id, manage_no, title, category, need_help, is_new, completion_period, period,
        current_stage, host_agency, bureau_id, bureau_name, department_id, department_name,
        team_name, manager_name, manager_phone, purpose, overview, investment_plan,
        issues_and_solutions, targets, schedules, achievements, future_plans,
        location, execution_status, report_status, public_status, current_version,
        last_updated, created_at, indicators, photos
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const p of SEED_PROJECTS) {
      insertProject.run(
        p.id,
        p.manageNo,
        p.title,
        p.category,
        JSON.stringify(p.needHelp),
        p.isNew,
        p.completionPeriod,
        p.period,
        p.currentStage,
        p.hostAgency,
        p.bureauId,
        p.bureauName,
        p.departmentId,
        p.departmentName,
        p.teamName,
        p.managerName,
        p.managerPhone,
        p.purpose,
        JSON.stringify(p.overview),
        JSON.stringify(p.investmentPlan),
        JSON.stringify(p.issuesAndSolutions),
        JSON.stringify(p.targets),
        JSON.stringify(p.schedules),
        JSON.stringify(p.achievements),
        JSON.stringify(p.futurePlans),
        JSON.stringify(p.location),
        p.executionStatus,
        p.reportStatus,
        p.publicStatus,
        p.currentVersion,
        p.lastUpdated,
        p.createdAt,
        JSON.stringify(p.indicators),
        p.photos ? JSON.stringify(p.photos) : null
      );

      // 이미 '게시' 상태인 사업은 시민 공개 테이블(public_projects)에 초기 동기화
      if (p.publicStatus === '게시') {
        syncToPublicTable(p);
      }
    }

    // 감사 로그 초기 기록
    const auditCount = db.prepare('SELECT COUNT(*) as cnt FROM audit_logs').get() as { cnt: number };
    if (auditCount.cnt === 0) {
      const insertAudit = db.prepare(`
        INSERT INTO audit_logs (id, actor_id, actor_name, actor_role, action, target_type, target_id, details, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insertAudit.run('log_01', 'user_policy', '김정책', 'POLICY_ADMIN', 'PUBLISH', 'PROJECT', 'proj_4_01', '김정책(정책기획과) [4-01 9호선 조기 착공 및 적기 개통] 사업 시민 포털 공식 게시 승인', '2026-09-30T10:15:00.000Z');
      insertAudit.run('log_02', 'user_traffic_bureau', '박교통', 'BUREAU_ADMIN', 'BUREAU_APPROVE', 'PROJECT', 'proj_4_01', '박교통(교통국장) 소관 [4-01] 2026년 추진실적 국 검토 완료 및 정책팀 송부', '2026-09-28T14:30:00.000Z');
      insertAudit.run('log_03', 'user_railway_dept', '김교통', 'DEPT_USER', 'SUBMIT', 'PROJECT', 'proj_4_01', '김교통(교통정책과) [4-01] 2026년 실시설계 착수 실적 입력 및 국 검토 제출', '2026-09-27T09:00:00.000Z');
      insertAudit.run('log_04', 'user_bus_dept', '박대중', 'DEPT_USER', 'UPDATE_PROJECT', 'PROJECT', 'proj_4_14', '박대중(대중교통과) [4-14 남양주형 똑버스 DRT] 1권역 시범운영 계획 실적 수정 저장', '2026-09-26T16:20:00.000Z');
      insertAudit.run('log_05', 'user_admin', '최관리', 'SYS_ADMIN', 'INIT_SYSTEM', 'SYSTEM', 'ALL', '민선9기 공약 실천계획 통합관리 시스템 가동 및 16개 핵심 사업 적재 완료', '2026-09-25T08:00:00.000Z');
    }
  }
}

/**
 * 내부 사업 데이터를 시민 공개 전용 테이블(public_projects)로 안전하게 격리 동기화
 * (개인 전화번호, 내부 심사의견, 반려사유 등 비공개 필드 원천 배제)
 */
export function syncToPublicTable(project: PromiseProject) {
  const easy = generateEasySummary(project);
  
  // 지표 달성률 계산 (첫 번째 지표 기준 또는 가중 평균)
  const achRate = project.indicators && project.indicators.length > 0
    ? project.indicators[0].achievementRate
    : 0;

  // 예산 집행률 계산 (2026년 기준 실질 집행 또는 기투자 비율)
  const totalBud = project.investmentPlan.totalBudget || 1;
  const budgetRate = Math.min(100, Math.round(((project.investmentPlan.priorInvested || 0) / totalBud) * 100));

  const totalDesc = `${project.investmentPlan.totalBudget.toLocaleString()} ${project.investmentPlan.unit} (${project.investmentPlan.otherNote || '시비/도비/국비 분담'})`;

  const deleteExisting = db.prepare('DELETE FROM public_projects WHERE id = ?');
  deleteExisting.run(project.id);

  const insertPublic = db.prepare(`
    INSERT INTO public_projects (
      id, manage_no, title, category, is_new, completion_period, period,
      bureau_name, department_name, team_name, easy_summary, purpose, overview_volume,
      location, execution_status, indicator_achievement_rate, budget_execution_rate,
      total_budget_desc, photos, public_version, published_at, data_base_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertPublic.run(
    project.id,
    project.manageNo || project.manage_no || '',
    project.title || '',
    project.category || '공약사업',
    project.isNew || project.is_new || '계속',
    project.completionPeriod || project.completion_period || '임기내',
    project.period || '',
    project.bureauName || project.bureau_name || '',
    project.departmentName || project.department_name || '',
    project.teamName || project.team_name || '',
    JSON.stringify(easy),
    project.purpose || '',
    project.overview?.volume || project.overview_volume || '',
    JSON.stringify(project.location),
    project.executionStatus || project.execution_status || '정상추진',
    achRate,
    budgetRate,
    totalDesc,
    project.photos ? JSON.stringify(project.photos) : null,
    project.currentVersion || project.current_version || 1,
    new Date().toISOString().split('T')[0],
    '2026-09-30'
  );
}

/**
 * 공개 철회 처리 (시민 테이블에서 즉시 삭제)
 */
export function withdrawFromPublicTable(projectId: string) {
  const stmt = db.prepare('DELETE FROM public_projects WHERE id = ?');
  stmt.run(projectId);
}
