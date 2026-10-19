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

  // 질문 분석 및 관련 공약 매칭 (가중치 채점)
  const scored = projects.map(p => {
    let score = 0;
    const title = p.title.toLowerCase();
    const purpose = (p.purpose || '').toLowerCase();
    const dongName = (p.location?.dong || '').toLowerCase();
    const address = (p.location?.address || '').toLowerCase();
    const what = (p.easySummary?.what || '').toLowerCase();

    // 1) 지역 필터 및 질의어 지역 매칭
    if (dong && dong !== '전체') {
      if (dongName.includes(dong.toLowerCase()) || address.includes(dong.toLowerCase())) score += 15;
    }
    const dongs = ['다산', '별내', '진접', '화도', '와부', '덕소', '호평', '평내', '퇴계원', '수석', '금곡'];
    for (const d of dongs) {
      if (q.includes(d)) {
        if (dongName.includes(d) || address.includes(d)) score += 15;
      }
    }

    // 2) 분야 필터
    if (topic && topic !== '전체') {
      if (title.includes(topic.toLowerCase()) || p.category.includes(topic)) score += 10;
    }

    // 3) 핵심 키워드 가중치 매칭
    if (q.includes('주차') || q.includes('주차장') || q.includes('주차선') || q.includes('주차난') || q.includes('입체형')) {
      if (p.manageNo === '4-20' || p.manageNo === '4-22' || title.includes('주차')) score += 40;
    }
    if (q.includes('스쿨존') || q.includes('어린이') || q.includes('통학') || q.includes('초등') || q.includes('안심 보행')) {
      if (p.manageNo === '4-25' || title.includes('스쿨존') || title.includes('어린이')) score += 40;
    }
    if (q.includes('어르신') || q.includes('노인') || q.includes('청소년') || q.includes('g-pass') || q.includes('gpass') || q.includes('교통비') || q.includes('무상')) {
      if (p.manageNo === '4-19' || title.includes('g-pass') || title.includes('무상')) score += 40;
    }
    if (q.includes('지하철') || q.includes('철도') || q.includes('전철') || q.includes('9호선') || q.includes('8호선') || q.includes('gtx') || q.includes('환승')) {
      if (title.includes('호선') || title.includes('gtx') || title.includes('철도') || title.includes('환승')) score += 30;
      if (q.includes('9호선') && p.manageNo === '4-01') score += 25;
      if (q.includes('8호선') && p.manageNo === '4-03') score += 25;
      if (q.includes('gtx') && p.manageNo === '4-07-1') score += 25;
      if (q.includes('환승') && p.manageNo === '4-12') score += 25;
    }
    if (q.includes('똑버스') || q.includes('drt') || q.includes('순환버스') || q.includes('셔틀') || q.includes('버스')) {
      if (p.manageNo === '4-14' || p.manageNo === '4-16' || title.includes('버스')) score += 35;
    }
    if (q.includes('도로') || q.includes('수석대교') || q.includes('고속도로') || q.includes('요금') || q.includes('할인') || q.includes('다리') || q.includes('교량')) {
      if (p.manageNo === '4-26' || p.manageNo === '4-27' || title.includes('도로') || title.includes('대교')) score += 35;
    }

    const words = q.split(/\s+/).filter(w => w.length >= 2);
    for (const w of words) {
      if (title.includes(w)) score += 5;
      if (purpose.includes(w)) score += 3;
      if (what.includes(w)) score += 3;
    }

    return { project: p, score };
  });

  scored.sort((a, b) => b.score - a.score);
  let matched = scored.filter(s => s.score >= 5).map(s => s.project);

  if (matched.length === 0) {
    matched = projects.slice(0, 3);
  }

  // 질의 맥락에 맞춘 맞춤형 서두 작성
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

  const answerParagraphs: string[] = [headerIntro];

  matched.slice(0, 3).forEach((p, idx) => {
    const summary = p.easySummary;
    answerParagraphs.push(
      `**[사업 ${idx + 1}] [${p.manageNo}] ${p.title}** (${p.status}, 진척도: ${p.achievementRate}%)\n` +
      `• **어떤 사업인가요?** ${summary?.what || p.purpose}\n` +
      `• **누구에게 도움이 되나요?** ${summary?.who || '남양주시민'}\n` +
      `• **어디에서 진행되나요?** ${summary?.where || p.location?.address || `${p.location?.dong || '남양주시'} 일원`}\n` +
      `• **사업 기간 / 총사업비:** ${p.budget ? `총사업비: ${p.budget}` : ''}\n` +
      `• **현재 진행 상황:** ${summary?.progress || p.status}\n` +
      `• **앞으로의 계획:** ${summary?.next || '세부 실시계획에 따라 단계적 추진 예정'}`
    );
  });

  res.json({
    question: question || '조건별 맞춤 공약 추천',
    answer: answerParagraphs.join('\n\n'),
    matchedCount: matched.length,
    projects: matched.slice(0, 4),
    dataBaseDate: '2026-09-30',
    disclaimer: '공개 확정된 최신 행정 데이터에 기반하여 답변을 제공하며, 비공개 또는 미확정 예산/일정은 추측하지 않습니다.'
  });
});

export default router;
