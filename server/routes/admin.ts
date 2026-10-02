import { Router, Request, Response } from 'express';
import { db, syncToPublicTable, withdrawFromPublicTable } from '../database.ts';
import { requireRoles, checkProjectEditPermission, checkBureauReviewPermission } from '../middleware/auth.ts';
import { PromiseProject, ApprovalHistory, UserRole } from '../../src/types/index.ts';

const router = Router();

// 모든 관리자 API는 시민(CITIZEN)을 제외한 공무원 역할만 접근 가능
router.use(requireRoles(['SYS_ADMIN', 'POLICY_ADMIN', 'BUREAU_ADMIN', 'DEPT_USER', 'INTERNAL_VIEWER']));

/**
 * DB에서 프로젝트 행을 파싱하여 PromiseProject 객체로 변환
 */
function parseProjectRow(row: any): PromiseProject {
  return {
    id: row.id,
    manageNo: row.manage_no,
    title: row.title,
    category: row.category,
    needHelp: row.need_help ? JSON.parse(row.need_help) : [],
    isNew: row.is_new,
    completionPeriod: row.completion_period,
    period: row.period,
    currentStage: row.current_stage,
    hostAgency: row.host_agency,
    bureauId: row.bureau_id,
    bureauName: row.bureau_name,
    departmentId: row.department_id,
    departmentName: row.department_name,
    teamName: row.team_name,
    managerName: row.manager_name,
    managerPhone: row.manager_phone,
    purpose: row.purpose,
    overview: row.overview ? JSON.parse(row.overview) : {},
    investmentPlan: row.investment_plan ? JSON.parse(row.investment_plan) : { totalBudget: 0, unit: '백만원', priorInvested: 0, yearly: [] },
    issuesAndSolutions: row.issues_and_solutions ? JSON.parse(row.issues_and_solutions) : { issues: '', solutions: '' },
    targets: row.targets ? JSON.parse(row.targets) : { finalGoal: '', termGoal: '' },
    schedules: row.schedules ? JSON.parse(row.schedules) : [],
    achievements: row.achievements ? JSON.parse(row.achievements) : [],
    futurePlans: row.future_plans ? JSON.parse(row.future_plans) : [],
    location: row.location ? JSON.parse(row.location) : { type: '시전체', address: '', dong: '' },
    executionStatus: row.execution_status,
    reportStatus: row.report_status,
    publicStatus: row.public_status,
    currentVersion: row.current_version,
    lastUpdated: row.last_updated,
    createdAt: row.created_at,
    indicators: row.indicators ? JSON.parse(row.indicators) : [],
    photos: row.photos ? JSON.parse(row.photos) : undefined
  };
}

/**
 * 1. 통합 대시보드 통계 조회
 */
router.get('/dashboard-stats', (req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM projects').all();
  const projects = rows.map(parseProjectRow);

  const totalCount = projects.length;
  
  // 이행 상태별 집계
  const executionStats = {
    정상추진: projects.filter(p => p.executionStatus === '정상추진').length,
    지연: projects.filter(p => p.executionStatus === '지연').length,
    완료: projects.filter(p => p.executionStatus === '완료').length,
    보류: projects.filter(p => p.executionStatus === '보류').length,
    추진전: projects.filter(p => p.executionStatus === '추진전').length
  };

  // 보고서 처리 상태별 집계
  const reportStats = {
    작성중: projects.filter(p => p.reportStatus === '작성중').length,
    국검토대기: projects.filter(p => p.reportStatus === '국검토대기').length,
    정책팀검토대기: projects.filter(p => p.reportStatus === '정책팀검토대기').length,
    보완요청: projects.filter(p => p.reportStatus === '보완요청').length,
    최종승인: projects.filter(p => p.reportStatus === '최종승인').length
  };

  // 공개 상태별 집계
  const publicStats = {
    게시: projects.filter(p => p.publicStatus === '게시').length,
    공개확정: projects.filter(p => p.publicStatus === '공개확정').length,
    공개자료작성중: projects.filter(p => p.publicStatus === '공개자료작성중').length,
    미공개: projects.filter(p => p.publicStatus === '미공개').length,
    공개철회: projects.filter(p => p.publicStatus === '공개철회').length
  };

  // 국·부서별 현황
  const deptMap: Record<string, { name: string; bureau: string; total: number; delayed: number; completed: number; pendingReview: number }> = {};
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

  // 지연 사업 목록
  const delayedProjects = projects
    .filter(p => p.executionStatus === '지연')
    .map(p => ({
      id: p.id,
      manageNo: p.manageNo,
      title: p.title,
      departmentName: p.departmentName,
      issues: p.issuesAndSolutions.issues,
      lastUpdated: p.lastUpdated
    }));

  // 검토 대기 목록 (내 권한에 해당하는 건 우선)
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

  // 최근 감사 로그 10건
  const recentLogs = db.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 10').all();

  res.json({
    totalCount,
    executionStats,
    reportStats,
    publicStats,
    departments: Object.values(deptMap),
    delayedProjects,
    pendingApprovals,
    recentLogs
  });
});

/**
 * 2. 공약사업 목록 조회 (필터/검색)
 */
router.get('/projects', (req: Request, res: Response) => {
  const { departmentId, bureauId, executionStatus, reportStatus, publicStatus, q } = req.query;

  let query = 'SELECT * FROM projects WHERE 1=1';
  const params: (string | number)[] = [];

  if (departmentId) {
    query += ' AND department_id = ?';
    params.push(departmentId as string);
  }
  if (bureauId) {
    query += ' AND bureau_id = ?';
    params.push(bureauId as string);
  }
  if (executionStatus) {
    query += ' AND execution_status = ?';
    params.push(executionStatus as string);
  }
  if (reportStatus) {
    query += ' AND report_status = ?';
    params.push(reportStatus as string);
  }
  if (publicStatus) {
    query += ' AND public_status = ?';
    params.push(publicStatus as string);
  }
  if (q) {
    query += ' AND (title LIKE ? OR manage_no LIKE ? OR purpose LIKE ?)';
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }

  query += ' ORDER BY manage_no ASC';

  const rows = db.prepare(query).all(...params as any);
  const projects = rows.map(parseProjectRow);
  res.json({ projects });
});

/**
 * 3. 공약사업 상세 및 이력 조회
 */
router.get('/projects/:id', (req: Request, res: Response) => {
  const projectId = req.params.id as string;
  const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId) as any;
  if (!row) {
    return res.status(404).json({ error: '공약사업을 찾을 수 없습니다.' });
  }

  const project = parseProjectRow(row);
  const historyRows = db.prepare('SELECT * FROM approval_history WHERE project_id = ? ORDER BY created_at DESC').all(projectId);

  res.json({ project, history: historyRows });
});

/**
 * 4. 추진실적 입력 및 임시저장/수정 (타 부서 수정 엄격 차단!)
 */
router.put('/projects/:id', (req: Request, res: Response) => {
  const user = req.user!;
  const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id) as any;
  if (!row) {
    return res.status(404).json({ error: '공약사업을 찾을 수 없습니다.' });
  }

  const existingProject = parseProjectRow(row);

  // 타 부서 사업 수정 차단 검증
  if (!checkProjectEditPermission(user, existingProject)) {
    return res.status(403).json({
      error: `[접근 거부] ${user.departmentName} 소속 담당자는 타 부서(${existingProject.departmentName})의 공약사업을 수정할 수 없습니다.`
    });
  }

  // 검토 중인 자료의 임의 수정 방지
  if (user.role === 'DEPT_USER' && (existingProject.reportStatus === '국검토대기' || existingProject.reportStatus === '정책팀검토대기')) {
    return res.status(400).json({
      error: `현재 상급기관(${existingProject.reportStatus})에서 검토 중인 보고자료는 수정할 수 없습니다. 보완요청 후 수정하세요.`
    });
  }

  const updates = req.body;
  const now = new Date().toISOString().split('T')[0];

  const updateStmt = db.prepare(`
    UPDATE projects SET
      title = ?,
      category = ?,
      need_help = ?,
      is_new = ?,
      completion_period = ?,
      period = ?,
      current_stage = ?,
      host_agency = ?,
      team_name = ?,
      manager_name = ?,
      purpose = ?,
      overview = ?,
      investment_plan = ?,
      issues_and_solutions = ?,
      targets = ?,
      schedules = ?,
      achievements = ?,
      future_plans = ?,
      location = ?,
      execution_status = ?,
      indicators = ?,
      photos = ?,
      last_updated = ?
    WHERE id = ?
  `);

  updateStmt.run(
    updates.title ?? existingProject.title,
    updates.category ?? existingProject.category,
    JSON.stringify(updates.needHelp ?? existingProject.needHelp),
    updates.isNew ?? existingProject.isNew,
    updates.completionPeriod ?? existingProject.completionPeriod,
    updates.period ?? existingProject.period,
    updates.currentStage ?? existingProject.currentStage,
    updates.hostAgency ?? existingProject.hostAgency,
    updates.teamName ?? existingProject.teamName,
    updates.managerName ?? existingProject.managerName,
    updates.purpose ?? existingProject.purpose,
    JSON.stringify(updates.overview ?? existingProject.overview),
    JSON.stringify(updates.investmentPlan ?? existingProject.investmentPlan),
    JSON.stringify(updates.issuesAndSolutions ?? existingProject.issuesAndSolutions),
    JSON.stringify(updates.targets ?? existingProject.targets),
    JSON.stringify(updates.schedules ?? existingProject.schedules),
    JSON.stringify(updates.achievements ?? existingProject.achievements),
    JSON.stringify(updates.futurePlans ?? existingProject.futurePlans),
    JSON.stringify(updates.location ?? existingProject.location),
    updates.executionStatus ?? existingProject.executionStatus,
    JSON.stringify(updates.indicators ?? existingProject.indicators),
    updates.photos ? JSON.stringify(updates.photos) : (existingProject.photos ? JSON.stringify(existingProject.photos) : null),
    now,
    req.params.id
  );

  // 감사 로그 기록
  db.prepare(`
    INSERT INTO audit_logs (id, actor_id, actor_name, actor_role, action, target_type, target_id, details, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    `log_${Date.now()}`,
    user.id,
    user.name,
    user.role,
    'UPDATE_PROJECT',
    'PROJECT',
    req.params.id,
    `${user.name}(${user.departmentName}) 공약 실적 및 정보 수정 저장`,
    new Date().toISOString()
  );

  const updatedRow = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  res.json({ success: true, project: parseProjectRow(updatedRow) });
});

/**
 * 5. 검토/승인/반려/공개 상태 전이 워크플로우 처리
 */
router.post('/projects/:id/transition', (req: Request, res: Response) => {
  const user = req.user!;
  const { action, comment, rejectReason } = req.body;
  // action 목록: 'SUBMIT', 'BUREAU_APPROVE', 'BUREAU_REJECT', 'POLICY_APPROVE', 'POLICY_REJECT', 'CONFIRM_PUBLIC', 'PUBLISH', 'WITHDRAW'

  const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id) as any;
  if (!row) {
    return res.status(404).json({ error: '공약사업을 찾을 수 없습니다.' });
  }

  const project = parseProjectRow(row);
  const now = new Date().toISOString();

  let nextReportStatus = project.reportStatus;
  let nextPublicStatus = project.publicStatus;
  let historyStep = '';

  // 1) 담당 부서 제출 (DRAFT/REVISION_REQUIRED -> 국검토대기)
  if (action === 'SUBMIT') {
    if (!checkProjectEditPermission(user, project)) {
      return res.status(403).json({ error: '소속 부서 사업만 국 검토 제출이 가능합니다.' });
    }
    nextReportStatus = '국검토대기';
    historyStep = '부서제출';
  }
  // 2) 국별 관리자 검토 승인 (국검토대기 -> 정책팀검토대기)
  else if (action === 'BUREAU_APPROVE') {
    if (!checkBureauReviewPermission(user, project)) {
      return res.status(403).json({ error: `소관 국(${project.bureauName})의 사업만 검토 승인할 수 있습니다.` });
    }
    if (project.reportStatus !== '국검토대기') {
      return res.status(400).json({ error: '국 검토 대기 상태인 자료만 검토 승인할 수 있습니다.' });
    }
    nextReportStatus = '정책팀검토대기';
    historyStep = '국검토';
  }
  // 3) 국별 관리자 반려 (국검토대기 -> 보완요청, 사유 필수!)
  else if (action === 'BUREAU_REJECT') {
    if (!checkBureauReviewPermission(user, project)) {
      return res.status(403).json({ error: `소관 국(${project.bureauName})의 사업만 반려할 수 있습니다.` });
    }
    if (!rejectReason || rejectReason.trim() === '') {
      return res.status(400).json({ error: '반려 시에는 구체적인 보완 요청 사유를 필수로 입력해야 합니다.' });
    }
    nextReportStatus = '보완요청';
    historyStep = '반려';
  }
  // 4) 정책팀 최종 승인 (정책팀검토대기 -> 최종승인)
  else if (action === 'POLICY_APPROVE') {
    if (user.role !== 'POLICY_ADMIN' && user.role !== 'SYS_ADMIN') {
      return res.status(403).json({ error: '최종 승인 권한은 정책팀 총괄관리자에게만 있습니다.' });
    }
    if (project.reportStatus !== '정책팀검토대기') {
      return res.status(400).json({ error: '정책팀 검토 대기 상태인 자료만 최종 승인할 수 있습니다.' });
    }
    nextReportStatus = '최종승인';
    historyStep = '정책팀최종승인';
  }
  // 5) 정책팀 보완 요청 (정책팀검토대기 -> 보완요청, 사유 필수!)
  else if (action === 'POLICY_REJECT') {
    if (user.role !== 'POLICY_ADMIN' && user.role !== 'SYS_ADMIN') {
      return res.status(403).json({ error: '보완 요청 권한은 정책팀 총괄관리자에게만 있습니다.' });
    }
    if (!rejectReason || rejectReason.trim() === '') {
      return res.status(400).json({ error: '보완 요청 사유를 필수로 입력해야 합니다.' });
    }
    nextReportStatus = '보완요청';
    historyStep = '반려';
  }
  // 6) 공개 확정 (최종승인 상태에서만 가능)
  else if (action === 'CONFIRM_PUBLIC') {
    if (user.role !== 'POLICY_ADMIN' && user.role !== 'SYS_ADMIN') {
      return res.status(403).json({ error: '공개 확정 권한은 정책팀 총괄관리자에게만 있습니다.' });
    }
    if (project.reportStatus !== '최종승인') {
      return res.status(400).json({ error: '내부 최종 승인이 완료된 사업만 공개 확정할 수 있습니다.' });
    }
    nextPublicStatus = '공개확정';
    historyStep = '공개확정';
  }
  // 7) 시민 포털 게시 (공개확정/최종승인 -> 게시, 시민 테이블 동기화)
  else if (action === 'PUBLISH') {
    if (user.role !== 'POLICY_ADMIN' && user.role !== 'SYS_ADMIN') {
      return res.status(403).json({ error: '시민 공개 게시 권한은 정책팀 총괄관리자에게만 있습니다.' });
    }
    if (project.reportStatus !== '최종승인') {
      return res.status(400).json({ error: '내부 최종 승인을 거치지 않은 자료는 시민에게 게시할 수 없습니다.' });
    }
    nextPublicStatus = '게시';
    historyStep = '공개확정';
  }
  // 8) 공개 철회 (게시 -> 공개철회, 시민 테이블에서 즉시 삭제)
  else if (action === 'WITHDRAW') {
    if (user.role !== 'POLICY_ADMIN' && user.role !== 'SYS_ADMIN') {
      return res.status(403).json({ error: '공개 철회 권한은 정책팀 총괄관리자에게만 있습니다.' });
    }
    nextPublicStatus = '공개철회';
    historyStep = '반려';
  } else {
    return res.status(400).json({ error: `알 수 없는 액션입니다: ${action}` });
  }

  // 상태 업데이트 및 새 버전 생성 (승인 후 정정인 경우 버전 1 증가)
  let newVersion = project.currentVersion;
  if (action === 'PUBLISH') {
    newVersion += 1;
  }

  db.prepare(`
    UPDATE projects SET
      report_status = ?,
      public_status = ?,
      current_version = ?,
      last_updated = ?
    WHERE id = ?
  `).run(nextReportStatus, nextPublicStatus, newVersion, now.split('T')[0], project.id);

  // 이력 테이블에 기록
  db.prepare(`
    INSERT INTO approval_history (
      id, project_id, version, step, action, actor_id, actor_name, actor_role, actor_department, comment, reject_reason, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    `appr_${Date.now()}`,
    project.id,
    newVersion,
    historyStep,
    action,
    user.id,
    user.name,
    user.role,
    user.departmentName,
    comment || '',
    rejectReason || null,
    now
  );

  // 감사 로그 기록
  db.prepare(`
    INSERT INTO audit_logs (id, actor_id, actor_name, actor_role, action, target_type, target_id, details, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    `log_${Date.now()}`,
    user.id,
    user.name,
    user.role,
    action,
    'PROJECT',
    project.id,
    `${user.name}(${user.role})이 [${project.manageNo} ${project.title}] 사업의 상태를 변경함 (${action}: 보고[${nextReportStatus}], 공개[${nextPublicStatus}])${rejectReason ? ` / 사유: ${rejectReason}` : ''}`,
    now
  );

  // 시민 격리 테이블 동기화 또는 삭제
  const updatedProjectRow = db.prepare('SELECT * FROM projects WHERE id = ?').get(project.id);
  const updatedProject = parseProjectRow(updatedProjectRow);

  if (nextPublicStatus === '게시') {
    syncToPublicTable(updatedProject);
  } else if (action === 'WITHDRAW') {
    withdrawFromPublicTable(project.id);
  }

  res.json({
    success: true,
    project: updatedProject,
    message: `[${action}] 처리가 성공적으로 완료되었습니다.`
  });
});

/**
 * 6. 감사 로그 조회
 */
router.get('/audit-logs', (req: Request, res: Response) => {
  const logs = db.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 50').all();
  res.json({ logs });
});

/**
 * 7. CSV 보고서 데이터 내보내기
 */
router.get('/export-csv', (req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM projects ORDER BY manage_no ASC').all();
  const projects = rows.map(parseProjectRow);

  let csv = '\uFEFF'; // UTF-8 BOM
  csv += '관리번호,사업명,분야,소관국,담당부서,담당팀,담당자,이행상태,보고상태,공개상태,총사업비,사업기간,최종수정일\n';

  for (const p of projects) {
    const cost = `${p.investmentPlan.totalBudget.toLocaleString()} ${p.investmentPlan.unit}`;
    csv += `"${p.manageNo}","${p.title}","${p.category}","${p.bureauName}","${p.departmentName}","${p.teamName}","${p.managerName}","${p.executionStatus}","${p.reportStatus}","${p.publicStatus}","${cost}","${p.period}","${p.lastUpdated}"\n`;
  }

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="namyangju_promises_report.csv"');
  res.send(csv);
});

export default router;
