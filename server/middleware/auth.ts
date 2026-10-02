import { Request, Response, NextFunction } from 'express';
import { db } from '../database.ts';
import { User, UserRole, PromiseProject } from '../../src/types/index.ts';

// Request 타입에 user 속성 확장
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

/**
 * 요청 헤더(x-user-id) 또는 쿼리에서 사용자를 추출하여 검증하는 미들웨어
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const userId = (req.headers['x-user-id'] as string) || (req.query.demoUserId as string) || 'user_citizen';

  const userRow = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
  if (userRow) {
    req.user = {
      id: userRow.id,
      name: userRow.name,
      role: userRow.role as UserRole,
      departmentId: userRow.department_id || '',
      departmentName: userRow.department_name || '',
      bureauId: userRow.bureau_id || '',
      bureauName: userRow.bureau_name || '',
      email: userRow.email,
      phone: userRow.phone
    };
  } else {
    // 기본 시민 모드
    req.user = {
      id: 'user_citizen',
      name: '남양주시민',
      role: 'CITIZEN',
      departmentId: '',
      departmentName: '',
      bureauId: '',
      bureauName: '',
      email: 'citizen@namyangju.kr'
    };
  }
  next();
}

/**
 * 특정 역할군만 접근 허용하는 인가 가드 미들웨어
 */
export function requireRoles(roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `접근 권한이 없습니다. (필요 권한: ${roles.join(', ')} / 현재 권한: ${req.user.role})`
      });
    }

    next();
  };
}

/**
 * 사업 수정 권한 검증:
 * - 부서 담당자(DEPT_USER)는 자신의 부서 사업만 수정 가능 (타 부서 수정 시도 시 403 Forbidden)
 * - 정책팀(POLICY_ADMIN), 시스템관리자(SYS_ADMIN)는 관리 권한 보유
 */
export function checkProjectEditPermission(user: User, project: PromiseProject): boolean {
  if (user.role === 'SYS_ADMIN' || user.role === 'POLICY_ADMIN') {
    return true;
  }
  if (user.role === 'DEPT_USER') {
    return user.departmentId === project.departmentId;
  }
  return false;
}

/**
 * 국별 관리자 검토 권한 검증:
 * - 국별 관리자(BUREAU_ADMIN)는 소속 국(bureauId)의 사업만 검토/승인/반려 가능
 */
export function checkBureauReviewPermission(user: User, project: PromiseProject): boolean {
  if (user.role === 'SYS_ADMIN' || user.role === 'POLICY_ADMIN') {
    return true;
  }
  if (user.role === 'BUREAU_ADMIN') {
    return user.bureauId === project.bureauId;
  }
  return false;
}
