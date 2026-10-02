import { Router } from 'express';
import { db } from '../database.ts';

const router = Router();

// 전체 데모 사용자 목록 반환
router.get('/users', (req, res) => {
  const users = db.prepare('SELECT id, name, role, department_id, department_name, bureau_id, bureau_name, email, phone FROM users').all();
  res.json({
    users: users.map((u: any) => ({
      id: u.id,
      name: u.name,
      role: u.role,
      departmentId: u.department_id,
      departmentName: u.department_name,
      bureauId: u.bureau_id,
      bureauName: u.bureau_name,
      email: u.email,
      phone: u.phone
    }))
  });
});

// 현재 로그인 사용자 정보 반환
router.get('/me', (req, res) => {
  res.json({ user: req.user });
});

export default router;
