import express from 'express';
import cors from 'cors';
import { initDatabase } from './database.ts';
import { authMiddleware } from './middleware/auth.ts';
import authRouter from './routes/auth.ts';
import adminRouter from './routes/admin.ts';
import publicRouter from './routes/public.ts';
import aiRouter from './routes/ai.ts';

const app = express();
const PORT = process.env.PORT || 3001;

// 1. 데이터베이스 초기화 및 시드 데이터 적재
initDatabase();

// 2. 기본 미들웨어
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(authMiddleware);

// 3. 헬스체크
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    system: '민선9기 공약사업 통합관리 시스템 API'
  });
});

// 4. 라우터 마운트
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/public', publicRouter);
app.use('/api/ai', aiRouter);

// 5. 프론트엔드 정적 파일 서빙 (프로덕션 빌드 지원)
import path from 'node:path';
const DIST_PATH = path.resolve(process.cwd(), 'dist');
app.use(express.static(DIST_PATH));

app.get('*', (req, res) => {
  // API 요청이 아닌 모든 경로는 index.html로 서빙 (SPA 지원)
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(DIST_PATH, 'index.html'));
  }
});

// 5. 서버 실행
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`  민선9기 공약사업 통합관리 백엔드 서버 가동 완료  `);
  console.log(`  - API 서버 포트: http://localhost:${PORT}        `);
  console.log(`  - 내부 행정 API: /api/admin/*                   `);
  console.log(`  - 시민 공개 API: /api/public/*                  `);
  console.log(`=================================================`);
});

export default app;
