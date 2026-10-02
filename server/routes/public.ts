import { Router, Request, Response } from 'express';
import { db } from '../database.ts';
import { PublicProjectView } from '../../src/types/index.ts';

const router = Router();

/**
 * DB public_projects 행을 PublicProjectView로 파싱
 */
function parsePublicProjectRow(row: any): PublicProjectView {
  return {
    id: row.id,
    manageNo: row.manage_no,
    title: row.title,
    category: row.category,
    isNew: row.is_new,
    completionPeriod: row.completion_period,
    period: row.period,
    bureauName: row.bureau_name,
    departmentName: row.department_name,
    teamName: row.team_name,
    easySummary: JSON.parse(row.easy_summary),
    purpose: row.purpose,
    overviewVolume: row.overview_volume,
    location: JSON.parse(row.location),
    executionStatus: row.execution_status,
    indicatorAchievementRate: row.indicator_achievement_rate,
    budgetExecutionRate: row.budget_execution_rate,
    totalBudgetDesc: row.total_budget_desc,
    photos: row.photos ? JSON.parse(row.photos) : undefined,
    publicVersion: row.public_version,
    publishedAt: row.published_at,
    dataBaseDate: row.data_base_date
  };
}

/**
 * 두 좌표 간의 거리를 미터(m) 단위로 계산 (Haversine 공식)
 */
function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // 지구 반경 (m)
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * 1. 시민 공개용 3대 지표 요약 통계
 * (완료 공약 비율, 성과목표 달성률, 예산 집행률을 엄밀히 분리 산출)
 */
router.get('/stats', (req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM public_projects').all();
  const projects = rows.map(parsePublicProjectRow);

  const totalCount = projects.length;
  if (totalCount === 0) {
    return res.json({
      totalCount: 0,
      completedCount: 0,
      completionRate: 0,
      avgIndicatorAchievementRate: 0,
      avgBudgetExecutionRate: 0,
      statusCounts: {},
      dongCounts: {},
      dataBaseDate: '2026-09-30'
    });
  }

  // 1) 완료 공약 비율 (건수 기준)
  const completedCount = projects.filter(p => p.executionStatus === '완료').length;
  const completionRate = Math.round((completedCount / totalCount) * 100);

  // 2) 평균 성과지표 달성률 (%)
  const totalAch = projects.reduce((acc, p) => acc + (p.indicatorAchievementRate || 0), 0);
  const avgIndicatorAchievementRate = Math.round(totalAch / totalCount);

  // 3) 평균 예산 집행률 (%)
  const totalBud = projects.reduce((acc, p) => acc + (p.budgetExecutionRate || 0), 0);
  const avgBudgetExecutionRate = Math.round(totalBud / totalCount);

  // 상태별 건수
  const statusCounts = {
    정상추진: projects.filter(p => p.executionStatus === '정상추진').length,
    지연: projects.filter(p => p.executionStatus === '지연').length,
    완료: completedCount,
    보류: projects.filter(p => p.executionStatus === '보류').length,
    추진전: projects.filter(p => p.executionStatus === '추진전').length
  };

  // 행정동별 건수
  const dongCounts: Record<string, number> = {};
  for (const p of projects) {
    const dong = p.location.dong || '남양주시 전체';
    dongCounts[dong] = (dongCounts[dong] || 0) + 1;
  }

  res.json({
    totalCount,
    completedCount,
    completionRate,
    avgIndicatorAchievementRate,
    avgBudgetExecutionRate,
    statusCounts,
    dongCounts,
    dataBaseDate: '2026-09-30',
    publishedCount: totalCount
  });
});

/**
 * 2. 시민 공개용 공약사업 목록 (검색, 행정동, 반경 검색)
 * - 비좌표/시전체 사업은 임의 위치에 마커를 찍지 않고 분리하여 제공
 */
router.get('/projects', (req: Request, res: Response) => {
  const { q, dong, status, lat, lng, radius } = req.query;

  let query = 'SELECT * FROM public_projects WHERE 1=1';
  const params: any[] = [];

  if (dong && dong !== '전체') {
    query += ' AND json_extract(location, "$.dong") = ?';
    params.push(dong);
  }

  if (status && status !== '전체') {
    query += ' AND execution_status = ?';
    params.push(status);
  }

  if (q) {
    query += ' AND (title LIKE ? OR purpose LIKE ? OR manage_no LIKE ?)';
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }

  query += ' ORDER BY manage_no ASC';

  const rows = db.prepare(query).all(...params);
  let projects = rows.map(parsePublicProjectRow);

  // 반경 필터링 (사용자 좌표 및 반경 radius(미터)가 전달된 경우)
  if (lat && lng && radius) {
    const userLat = parseFloat(lat as string);
    const userLng = parseFloat(lng as string);
    const rad = parseFloat(radius as string);

    if (!isNaN(userLat) && !isNaN(userLng) && !isNaN(rad)) {
      projects = projects.filter(p => {
        // 시 전체 사업은 반경 검색 시에도 항상 포함하거나 별도로 표시
        if (p.location.type === '시전체') return true;
        if (p.location.lat && p.location.lng) {
          const dist = getDistanceInMeters(userLat, userLng, p.location.lat, p.location.lng);
          return dist <= rad;
        }
        return false;
      });
    }
  }

  // 지도 마커용(좌표가 있는 단일지점/복수지점/구역)과 비좌표/시전체 사업 목록 분리
  const mappedProjects = projects.filter(p => p.location.lat && p.location.lng && p.location.type !== '시전체');
  const cityWideProjects = projects.filter(p => !p.location.lat || !p.location.lng || p.location.type === '시전체');

  res.json({
    total: projects.length,
    projects,
    mappedProjects,
    cityWideProjects
  });
});

/**
 * 3. 시민 공개용 공약 상세 조회 (쉬운말 요약, 전후 사진, 공개 예산)
 */
router.get('/projects/:id', (req: Request, res: Response) => {
  const row = db.prepare('SELECT * FROM public_projects WHERE id = ?').get(req.params.id);
  if (!row) {
    return res.status(404).json({ error: '게시된 공개 공약사업을 찾을 수 없습니다.' });
  }

  const project = parsePublicProjectRow(row);
  res.json({ project });
});

export default router;
