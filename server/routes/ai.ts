import { Router, Request, Response } from 'express';
import { db } from '../database.ts';
import { PublicProjectView } from '../../src/types/index.ts';

const router = Router();

/**
 * 1. 특정 공약의 6하원칙 쉬운말 설명 요청
 */
router.get('/explain/:id', (req: Request, res: Response) => {
  const row = db.prepare('SELECT * FROM public_projects WHERE id = ?').get(req.params.id) as any;
  if (!row) {
    return res.status(404).json({ error: '게시된 공개 공약을 찾을 수 없습니다.' });
  }

  const easySummary = JSON.parse(row.easy_summary);
  const location = JSON.parse(row.location);

  res.json({
    projectId: row.id,
    manageNo: row.manage_no,
    title: row.title,
    easySummary,
    dataBaseDate: row.data_base_date,
    meta: {
      location: location.address || location.dong,
      executionStatus: row.execution_status,
      achievementRate: `${row.indicator_achievement_rate}%`,
      budget: row.total_budget_desc
    },
    note: '본 설명은 남양주시 공식 승인 공개자료를 바탕으로 시민의 이해를 돕기 위해 생성된 쉬운말 해설입니다.'
  });
});

/**
 * 2. 시민 맞춤형 생활 질문 질의응답 (AI / 자연어 템플릿 검색)
 */
router.post('/custom-ask', (req: Request, res: Response) => {
  const { question, dong, topic } = req.body;

  const rows = db.prepare('SELECT * FROM public_projects').all() as any[];
  const projects = rows.map(r => ({
    id: r.id,
    manageNo: r.manage_no,
    title: r.title,
    category: r.category,
    purpose: r.purpose,
    location: JSON.parse(r.location),
    easySummary: JSON.parse(r.easy_summary),
    status: r.execution_status,
    budget: r.total_budget_desc,
    achievementRate: r.indicator_achievement_rate,
    dataBaseDate: r.data_base_date
  }));

  const q = (question || '').trim().toLowerCase();

  // 질문 분석 및 관련 공약 매칭
  let matched = projects.filter(p => {
    let matchScore = 0;
    if (dong && dong !== '전체' && p.location.dong.includes(dong)) matchScore += 3;
    if (topic && topic !== '전체' && (p.category.includes(topic) || p.title.includes(topic))) matchScore += 2;

    if (q) {
      if (q.includes('어르신') || q.includes('노인') || q.includes('청소년') || q.includes('아이') || q.includes('교통비')) {
        if (p.manageNo === '4-19' || p.title.includes('G-Pass') || p.title.includes('무상')) matchScore += 5;
      }
      if (q.includes('스쿨존') || q.includes('어린이') || q.includes('초등학교') || q.includes('안전')) {
        if (p.manageNo === '4-25' || p.title.includes('스쿨존')) matchScore += 5;
      }
      if (q.includes('주차') || q.includes('주차장')) {
        if (p.manageNo === '4-20' || p.manageNo === '4-22' || p.title.includes('주차')) matchScore += 5;
      }
      if (q.includes('지하철') || q.includes('전철') || q.includes('철도') || q.includes('9호선') || q.includes('8호선') || q.includes('gtx')) {
        if (p.title.includes('호선') || p.title.includes('GTX')) matchScore += 5;
      }
      if (q.includes('버스') || q.includes('똑버스') || q.includes('셔틀')) {
        if (p.manageNo === '4-14' || p.manageNo === '4-16' || p.title.includes('버스')) matchScore += 5;
      }
      if (q.includes('다산') && p.location.dong.includes('다산')) matchScore += 3;
      if (q.includes('별내') && p.location.dong.includes('별내')) matchScore += 3;
      if (q.includes('진접') && p.location.dong.includes('진접')) matchScore += 3;
      if (q.includes('화도') && p.location.dong.includes('화도')) matchScore += 3;
      if (q.includes('호평') && p.location.dong.includes('호평')) matchScore += 3;
    }
    return matchScore > 0;
  });

  // 매칭된 결과가 없으면 전체 목록 중 핵심 3건 제안
  if (matched.length === 0) {
    matched = projects.slice(0, 3);
  }

  // 알기 쉬운 종합 답변 생성
  const answerParagraphs: string[] = [];
  answerParagraphs.push(`질문하신 내용과 관련하여 현재 공식 승인되어 추진 중인 남양주시 공약사업 **${matched.length}건**을 안내해 드립니다.`);

  matched.slice(0, 3).forEach((p, idx) => {
    answerParagraphs.push(
      `**${idx + 1}. [${p.manageNo}] ${p.title}** (${p.status}, 진척도: ${p.achievementRate}%)\n` +
      `• **혜택 대상:** ${p.easySummary.who}\n` +
      `• **진행 위치:** ${p.easySummary.where}\n` +
      `• **핵심 내용:** ${p.easySummary.what}\n` +
      `• **현재 상황:** ${p.easySummary.progress}`
    );
  });

  res.json({
    question: question || '조건별 맞춤 공약 추천',
    answer: answerParagraphs.join('\n\n'),
    matchedCount: matched.length,
    projects: matched.slice(0, 5),
    dataBaseDate: '2026-09-30',
    disclaimer: '공개 확정된 최신 행정 데이터에 기반하여 답변을 제공하며, 비공개 또는 미확정 예산/일정은 추측하지 않습니다.'
  });
});

export default router;
