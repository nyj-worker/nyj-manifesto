import { db } from '../server/database.ts';

const cnt = db.prepare('SELECT COUNT(*) as c FROM audit_logs').get() as { c: number };
if (cnt.c <= 1) {
  const insertAudit = db.prepare('INSERT INTO audit_logs (id, actor_id, actor_name, actor_role, action, target_type, target_id, details, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  insertAudit.run('log_01', 'user_policy', '김정책', 'POLICY_ADMIN', 'PUBLISH', 'PROJECT', 'proj_4_01', '김정책(정책기획과) [4-01 9호선 조기 착공 및 적기 개통] 사업 시민 포털 공식 게시 승인', '2026-09-30T10:15:00.000Z');
  insertAudit.run('log_02', 'user_traffic_bureau', '박교통', 'BUREAU_ADMIN', 'BUREAU_APPROVE', 'PROJECT', 'proj_4_01', '박교통(교통국장) 소관 [4-01] 2026년 추진실적 국 검토 완료 및 정책팀 송부', '2026-09-28T14:30:00.000Z');
  insertAudit.run('log_03', 'user_railway_dept', '김교통', 'DEPT_USER', 'SUBMIT', 'PROJECT', 'proj_4_01', '김교통(교통정책과) [4-01] 2026년 실시설계 착수 실적 입력 및 국 검토 제출', '2026-09-27T09:00:00.000Z');
  insertAudit.run('log_04', 'user_bus_dept', '박대중', 'DEPT_USER', 'UPDATE_PROJECT', 'PROJECT', 'proj_4_14', '박대중(대중교통과) [4-14 남양주형 똑버스 DRT] 1권역 시범운영 계획 실적 수정 저장', '2026-09-26T16:20:00.000Z');
  insertAudit.run('log_05', 'user_admin', '최관리', 'SYS_ADMIN', 'INIT_SYSTEM', 'SYSTEM', 'ALL', '민선9기 공약 실천계획 통합관리 시스템 가동 및 16개 핵심 사업 적재 완료', '2026-09-25T08:00:00.000Z');
  console.log('감사로그 5건 주입 완료');
} else {
  console.log('이미 감사로그 있음:', cnt.c);
}
