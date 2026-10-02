import { PromiseProject, User } from '../src/types/index.ts';

// ==========================================
// 1. 데모 사용자 및 조직 계정
// ==========================================
export const SEED_USERS: User[] = [
  {
    id: 'user_admin',
    name: '최관리',
    role: 'SYS_ADMIN',
    departmentId: 'dept_info',
    departmentName: '정보통신과',
    bureauId: 'bureau_admin',
    bureauName: '행정기획실',
    email: 'admin@nyj.go.kr',
    phone: '031-590-2114'
  },
  {
    id: 'user_policy',
    name: '김정책',
    role: 'POLICY_ADMIN',
    departmentId: 'dept_policy',
    departmentName: '정책기획과',
    bureauId: 'bureau_plan',
    bureauName: '기획조정실',
    email: 'policy@nyj.go.kr',
    phone: '031-590-2051'
  },
  {
    id: 'user_traffic_bureau',
    name: '박교통',
    role: 'BUREAU_ADMIN',
    departmentId: 'dept_traffic_head',
    departmentName: '교통국장실',
    bureauId: 'bureau_traffic',
    bureauName: '교통국',
    email: 'traffic_head@nyj.go.kr',
    phone: '031-590-2401'
  },
  {
    id: 'user_railway_dept',
    name: '김교통',
    role: 'DEPT_USER',
    departmentId: 'dept_railway',
    departmentName: '교통정책과',
    bureauId: 'bureau_traffic',
    bureauName: '교통국',
    email: 'yang.yh@nyj.go.kr',
    phone: '031-590-4428'
  },
  {
    id: 'user_bus_dept',
    name: '박대중',
    role: 'DEPT_USER',
    departmentId: 'dept_bus',
    departmentName: '대중교통과',
    bureauId: 'bureau_traffic',
    bureauName: '교통국',
    email: 'son.sj@nyj.go.kr',
    phone: '031-590-1444'
  },
  {
    id: 'user_parking_dept',
    name: '오문환',
    role: 'DEPT_USER',
    departmentId: 'dept_parking',
    departmentName: '주차관리과',
    bureauId: 'bureau_traffic',
    bureauName: '교통국',
    email: 'oh.mh@nyj.go.kr',
    phone: '031-590-5399'
  },
  {
    id: 'user_road_dept',
    name: '이도로',
    role: 'DEPT_USER',
    departmentId: 'dept_road',
    departmentName: '도로건설과',
    bureauId: 'bureau_traffic',
    bureauName: '교통국',
    email: 'lee.mh@nyj.go.kr',
    phone: '031-590-4724'
  },
  {
    id: 'user_viewer',
    name: '정감사',
    role: 'INTERNAL_VIEWER',
    departmentId: 'dept_audit',
    departmentName: '감사관',
    bureauId: 'bureau_audit',
    bureauName: '시장직속',
    email: 'audit@nyj.go.kr',
    phone: '031-590-2081'
  },
  {
    id: 'user_citizen',
    name: '남양주시민',
    role: 'CITIZEN',
    departmentId: '',
    departmentName: '',
    bureauId: '',
    bureauName: '',
    email: 'citizen@namyangju.kr'
  }
];

// ==========================================
// 2. PDF 실천계획서 기반 16개 핵심 사업 시드 데이터
// ==========================================
export const SEED_PROJECTS: PromiseProject[] = [
  // 1. 9호선 조기 착공 및 적기 개통 (게시 중, 정상 추진)
  {
    id: 'proj_4_01',
    manageNo: '4-01',
    title: '9호선 조기 착공 및 적기 개통',
    category: '공약사업',
    needHelp: ['재정', '권한'],
    isNew: '계속',
    completionPeriod: '임기내',
    period: '2020~2031',
    currentStage: '사업자 선정 및 실시설계 추진 중',
    hostAgency: '경기도(철도건설과), LH(신도시계획처)',
    bureauId: 'bureau_traffic',
    bureauName: '교통국',
    departmentId: 'dept_railway',
    departmentName: '교통정책과',
    teamName: '철도기획팀',
    managerName: '김교통',
    managerPhone: '031-590-4428',
    purpose: '3기(왕숙) 신도시 광역교통개선대책 핵심사업 추진으로 시민들의 철도 이용 편의 증진과 유기적인 철도망 구축',
    overview: {
      section: '서울시 강동구(강일) ~ 하남시(미사) ~ 남양주시 연계',
      volume: 'L = 17.59km (정거장 8개소, 환기구 18개소, 차량기지 1개소)',
      totalCostDesc: '총사업비 2조 9,334억 원 (광역교통개선대책 LH 분담금)',
      locationDesc: '강동-하남-남양주(진접2, 왕숙지구 등)'
    },
    investmentPlan: {
      totalBudget: 2933400,
      unit: '백만원',
      priorInvested: 2800,
      otherNote: '광역교통 개선대책 분담금 (LH 전액 부담)',
      yearly: [
        { year: 2026, total: 0, national: 0, provincial: 0, municipal: 0, other: 0 },
        { year: 2027, total: 290000, national: 0, provincial: 0, municipal: 0, other: 290000 },
        { year: 2028, total: 580000, national: 0, provincial: 0, municipal: 0, other: 580000 },
        { year: 2029, total: 880000, national: 0, provincial: 0, municipal: 0, other: 880000 },
        { year: 2030, total: 730000, national: 0, provincial: 0, municipal: 0, other: 730000 },
        { year: 9999, total: 450600, national: 0, provincial: 0, municipal: 0, other: 450600 }
      ]
    },
    issuesAndSolutions: {
      issues: '경기도 구간 2·5공구 턴키 입찰이 지속 유찰됨에 따라 계약 방식 미확정으로 전체 공정 지연 우려',
      solutions: '유찰공구(2·5공구)에 대해 사업시행기관(경기도)의 수의계약 전환 등 조속한 사업자 선정을 통해 적기 개통 추진 촉구'
    },
    targets: {
      finalGoal: '준공 및 적기 개통 (2031년)',
      termGoal: '전 공구 공사 착공'
    },
    schedules: [
      { year: 2026, plan: '사업자 선정 및 기본·실시설계', actual: '3,4,6공구 실시설계 추진', progressRate: 20 },
      { year: 2027, plan: '실시계획 승인 및 일부 구간 착공', progressRate: 40 },
      { year: 2028, plan: '전 구간 착공 및 공사 추진', progressRate: 70 },
      { year: 2030, plan: '공정률 90% 달성', progressRate: 90 },
      { year: 9999, plan: '2031년 준공 및 개통', progressRate: 100 }
    ],
    achievements: [
      { date: '2020.12.30', content: '3기(왕숙) 신도시 광역교통개선대책 반영' },
      { date: '2021.09.17', content: '공공기관 예비타당성조사 통과 (KDI)' },
      { date: '2024.12.30', content: '기본계획 승인 (국토교통부)' },
      { date: '2026.05.20', content: '3·4·6공구 기본설계 심의 및 실시설계 적격자 선정' },
      { date: '2026.08.31', content: '유찰공구(2·5공구) 수의계약 전환 검토 중(道)' }
    ],
    futurePlans: [
      { date: '2026.12', content: '기본 및 실시설계 완료 추진' },
      { date: '2027.06', content: '실시계획 승인 및 본공사 착공' },
      { date: '2031.12', content: '준공 및 전면 개통' }
    ],
    location: {
      type: '구역',
      address: '남양주시 다산동 ~ 진접읍 일원',
      dong: '다산동',
      lat: 37.6253,
      lng: 127.1518
    },
    executionStatus: '정상추진',
    reportStatus: '최종승인',
    publicStatus: '게시',
    currentVersion: 1,
    lastUpdated: '2026-09-15',
    createdAt: '2026-07-01',
    indicators: [
      {
        id: 'ind_4_01_1',
        projectId: 'proj_4_01',
        name: '실시설계 및 공구별 착공률',
        unit: '%',
        baselineValue: 0,
        targetValue: 100,
        currentValue: 35,
        calcType: '단계형',
        achievementRate: 35
      }
    ],
    photos: {
      planUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800',
      caption: '9호선 강동하남남양주선 광역철도 공구분할도 및 노선안'
    }
  },

  // 2. 9호선 945역사 출입구 추가 증설 (정책팀 검토 대기, 지연)
  {
    id: 'proj_4_02',
    manageNo: '4-02',
    title: '9호선 945역사 출입구 추가 증설 추진',
    category: '공약사업',
    needHelp: ['재정', '권한'],
    isNew: '계속',
    completionPeriod: '임기내',
    period: '2020~2031',
    currentStage: '사업자 선정 검토 중 (2공구 구간 유찰 대응)',
    hostAgency: '경기도(철도건설과), LH(신도시계획처)',
    bureauId: 'bureau_traffic',
    bureauName: '교통국',
    departmentId: 'dept_railway',
    departmentName: '교통정책과',
    teamName: '철도기획팀',
    managerName: '김교통',
    managerPhone: '031-590-4428',
    purpose: '9호선 945정거장(다산2동 한강초교 인근) 출입구 1개소 계획에 따른 주민 불편을 해소하고 출입구 추가 신설을 통한 보행 접근성 강화',
    overview: {
      section: '남양주시 다산2동 한강초등학교 인근 (945정거장)',
      volume: '지하8층 대심도(심도 52m) 엘리베이터형 출입구 추가 1개소 신설',
      totalCostDesc: '기존 9호선 총사업비 내 반영 추진 (별도 시비 증액 없음)'
    },
    investmentPlan: {
      totalBudget: 2933400,
      unit: '백만원',
      priorInvested: 2800,
      otherNote: 'LH 분담금 내 출입구 증설 반영 협의',
      yearly: [
        { year: 2026, total: 0, national: 0, provincial: 0, municipal: 0, other: 0 },
        { year: 2027, total: 290000, national: 0, provincial: 0, municipal: 0, other: 290000 },
        { year: 2028, total: 580000, national: 0, provincial: 0, municipal: 0, other: 580000 },
        { year: 2029, total: 880000, national: 0, provincial: 0, municipal: 0, other: 880000 },
        { year: 2030, total: 730000, national: 0, provincial: 0, municipal: 0, other: 730000 },
        { year: 9999, total: 450600, national: 0, provincial: 0, municipal: 0, other: 450600 }
      ]
    },
    issuesAndSolutions: {
      issues: '945정거장이 위치한 2공구 턴키 입찰의 반복 유찰로 기본 및 실시설계 착수가 지연됨',
      solutions: '사업시행기관(경기도)의 수의계약 체결을 독려하고, 사업자 선정 즉시 실시설계 과정에서 출입구 추가 배치계획을 설계조건에 포함'
    },
    targets: {
      finalGoal: '945정거장 출입구 추가 증설 완공',
      termGoal: '설계 반영 및 착공'
    },
    schedules: [
      { year: 2026, plan: '사업자 선정', progressRate: 10 },
      { year: 2027, plan: '기본·실시설계 출입구 추가 반영', progressRate: 50 },
      { year: 2028, plan: '실시계획 승인 및 착공', progressRate: 70 },
      { year: 2030, plan: '공사 준공', progressRate: 100 }
    ],
    achievements: [
      { date: '2024.05.28', content: '주민 공청회 개최 및 추가 출입구 요구 수렴' },
      { date: '2024.09.24', content: '대도시권광역교통위원회에 출입구 개소수 확대 의견 공식 회신' },
      { date: '2024.12.30', content: '기본계획 보고서에 향후 수요조사 반영 명시' }
    ],
    futurePlans: [
      { date: '2026.11', content: '2공구 수의계약자 선정 후 설계 협의 착수' },
      { date: '2027.06', content: '추가 출입구 실시설계 반영 승인' }
    ],
    location: {
      type: '단일지점',
      address: '남양주시 다산동 한강초등학교 사거리 일원',
      dong: '다산2동',
      lat: 37.6039,
      lng: 127.1565
    },
    executionStatus: '정상추진',
    reportStatus: '정책팀검토대기',
    publicStatus: '미공개',
    currentVersion: 2,
    lastUpdated: '2026-09-20',
    createdAt: '2026-07-01',
    indicators: [
      {
        id: 'ind_4_02_1',
        projectId: 'proj_4_02',
        name: '설계 반영 협의 완료율',
        unit: '%',
        baselineValue: 0,
        targetValue: 100,
        currentValue: 40,
        calcType: '단계형',
        achievementRate: 40
      }
    ]
  },

  // 3. 8호선 별내역~별내별가람역 연결 및 중앙역 신설 (국검토대기, 정상추진)
  {
    id: 'proj_4_03',
    manageNo: '4-03',
    title: '8호선 별내역~별내별가람역 연결 및 중앙역 신설 추진',
    category: '공약사업',
    needHelp: ['재정', '권한'],
    isNew: '계속',
    completionPeriod: '임기내',
    period: '2025~2032',
    currentStage: '예비타당성조사 대상 사업 선정(完)',
    hostAgency: '국토교통부(대광위), 경기도(철도정책과)',
    bureauId: 'bureau_traffic',
    bureauName: '교통국',
    departmentId: 'dept_railway',
    departmentName: '교통정책과',
    teamName: '철도기획팀',
    managerName: '김교통',
    managerPhone: '031-590-4428',
    purpose: '별내선과 진접선의 단절구간(Missing Link 3.4km)을 연결하여 3기 신도시 광역교통개선대책 실현 및 수도권 동북부 철도망 확충',
    overview: {
      section: '별내역(경춘선·8호선) ~ 별내별가람역(진접선)',
      volume: 'L = 3.437km (정거장 1개소, 환승역사)',
      totalCostDesc: '총 4,196억 원 (국비 2,307억, 도비 495억, 시비 495억, 기타 900억)'
    },
    investmentPlan: {
      totalBudget: 419600,
      unit: '백만원',
      priorInvested: 0,
      otherNote: 'LH 광역교통개선대책 분담금 900억원 포함',
      yearly: [
        { year: 2026, total: 0, national: 0, provincial: 0, municipal: 0, other: 0 },
        { year: 2027, total: 0, national: 0, provincial: 0, municipal: 0, other: 0 },
        { year: 2028, total: 0, national: 0, provincial: 0, municipal: 0, other: 0 },
        { year: 2029, total: 19800, national: 10900, provincial: 2300, municipal: 2300, other: 4300 },
        { year: 2030, total: 40300, national: 22200, provincial: 4750, municipal: 4750, other: 8600 },
        { year: 9999, total: 359500, national: 197600, provincial: 42400, municipal: 42400, other: 77100 }
      ]
    },
    issuesAndSolutions: {
      issues: '중앙역을 포함한 선행 예비타당성조사가 경제성(B/C 0.71) 부족으로 미통과됨',
      solutions: '예타 신청 시 중앙역을 분리하여 본선 우선 통과를 추진하고, 기본계획 수립 단계에서 수요재분석을 통해 중앙역 설치 방안 별도 강구'
    },
    targets: {
      finalGoal: '준공 및 개통 (2032년)',
      termGoal: '예타 통과 및 기본계획 수립'
    },
    schedules: [
      { year: 2026, plan: '예타 대상 선정 및 예타 착수', progressRate: 40 },
      { year: 2027, plan: '예타 완료', progressRate: 50 },
      { year: 2028, plan: '기본계획 수립 및 중앙역 신설 반영', progressRate: 60 },
      { year: 2030, plan: '실시계획 승인 및 착공', progressRate: 80 }
    ],
    achievements: [
      { date: '2021.07.05', content: '제4차 국가철도망 구축계획 반영' },
      { date: '2025.05.23', content: '별내선 연장 재기획 연구용역 착수' },
      { date: '2026.08.26', content: '기재부 재정사업평가위 예비타당성조사 대상 사업 선정' }
    ],
    futurePlans: [
      { date: '2026.10', content: 'KDI 예비타당성조사 수행 착수 대응' },
      { date: '2027.12', content: '예타 종합평가 통과 추진' }
    ],
    location: {
      type: '구역',
      address: '남양주시 별내동 일원 (별내역 ~ 별내별가람역)',
      dong: '별내동',
      lat: 37.6432,
      lng: 127.1278
    },
    executionStatus: '정상추진',
    reportStatus: '국검토대기',
    publicStatus: '게시',
    currentVersion: 1,
    lastUpdated: '2026-09-10',
    createdAt: '2026-07-01',
    indicators: [
      {
        id: 'ind_4_03_1',
        projectId: 'proj_4_03',
        name: '예비타당성조사 진행 공정률',
        unit: '%',
        baselineValue: 0,
        targetValue: 100,
        currentValue: 40,
        calcType: '증가형',
        achievementRate: 40
      }
    ],
    photos: {
      planUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800',
      caption: '별내선(8호선) 연장 노선 구상도'
    }
  },

  // 4. 수도권광역급행철도(GTX) B노선 건설사업 (게시 중, 정상 추진)
  {
    id: 'proj_4_07_1',
    manageNo: '4-07-1',
    title: '수도권광역급행철도(GTX) B노선 건설사업',
    category: '공약사업',
    needHelp: ['재정'],
    isNew: '계속',
    completionPeriod: '임기후',
    period: '2025~2031',
    currentStage: '공사착공(2025. 8.) 후 토지보상 진행 중',
    hostAgency: '국토교통부(광역급행철도건설과), 지티엑스비(주)',
    bureauId: 'bureau_traffic',
    bureauName: '교통국',
    departmentId: 'dept_railway',
    departmentName: '교통정책과',
    teamName: '철도운영팀',
    managerName: '신지웅',
    managerPhone: '031-590-5336',
    purpose: '수도권 내 주요 거점역 30분대 연결을 위한 광역급행 철도망 구축으로 출퇴근 교통난 해소',
    overview: {
      section: '송도 ~ 용산 ~ 상봉 ~ 별내 ~ 왕숙 ~ 평내호평 ~ 마석',
      volume: '총연장 82.85km / 남양주시 4개역(별내, 왕숙, 평내호평, 마석)',
      totalCostDesc: '총사업비 7조 668억 원 (재정 2.77조, 민자 4.28조 / 남양주시 분담금 238.57억)',
      locationDesc: '화도읍 답내리 629일원 차량기지 포함'
    },
    investmentPlan: {
      totalBudget: 7066800,
      unit: '백만원',
      priorInvested: 5000,
      otherNote: '남양주시 분담금 총 23,857백만원 중 연차별 납부',
      yearly: [
        { year: 2026, total: 3500, national: 0, provincial: 0, municipal: 3500, other: 0 },
        { year: 2027, total: 5000, national: 0, provincial: 0, municipal: 5000, other: 0 },
        { year: 2028, total: 5000, national: 0, provincial: 0, municipal: 5000, other: 0 },
        { year: 2029, total: 5000, national: 0, provincial: 0, municipal: 5000, other: 0 },
        { year: 2030, total: 5357, national: 0, provincial: 0, municipal: 5357, other: 0 },
        { year: 9999, total: 0, national: 0, provincial: 0, municipal: 0, other: 0 }
      ]
    },
    issuesAndSolutions: {
      issues: '화도읍 답내리 차량기지 주변 이주대책 민원 및 도로확장 요구 지속 접수',
      solutions: '국가철도공단 및 지티엑스비(주)와 정례회의를 개최하여 임시거처 지원 및 도로확장 행정지원 추진'
    },
    targets: {
      finalGoal: '광역 급행 철도망 구축으로 서울 도심 20분대 진입 (2031년 준공)',
      termGoal: '적기 개통을 위한 보상 완료 및 공사 본격 추진'
    },
    schedules: [
      { year: 2026, plan: '수용재결 공람공고 및 토지수용 완료', progressRate: 25 },
      { year: 2027, plan: '터널 굴착 및 본선 토목공사 추진', progressRate: 45 },
      { year: 2029, plan: '역사 건축 및 궤도 부설', progressRate: 75 },
      { year: 2031, plan: '종합시험운행 및 개통', progressRate: 100 }
    ],
    achievements: [
      { date: '2024.07.11', content: '민자구간 실시계획 승인 고시 (국토부)' },
      { date: '2025.08.04', content: '민자구간 착공계 제출 및 착공' },
      { date: '2026.08.06', content: '중앙토지수용위원회 수용재결 완료' }
    ],
    futurePlans: [
      { date: '2026.09.30', content: '토지 수용 개시 및 지장물 철거' },
      { date: '2027.03', content: '남양주 구간 본선 수직구 굴착 착수' }
    ],
    location: {
      type: '복수지점',
      address: '남양주시 화도읍 답내리 629 일원 (차량기지 및 주요 역사)',
      dong: '화도읍',
      lat: 37.6534,
      lng: 127.3189
    },
    executionStatus: '정상추진',
    reportStatus: '최종승인',
    publicStatus: '게시',
    currentVersion: 1,
    lastUpdated: '2026-09-01',
    createdAt: '2026-07-01',
    indicators: [
      {
        id: 'ind_4_07_1',
        projectId: 'proj_4_07_1',
        name: '남양주 구간 공정률',
        unit: '%',
        baselineValue: 0,
        targetValue: 100,
        currentValue: 18,
        calcType: '증가형',
        achievementRate: 18
      }
    ],
    photos: {
      planUrl: 'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=800',
      caption: 'GTX-B 노선도 및 남양주 화도 차량기지 위치도'
    }
  },

  // 5. 4호선 증차를 통한 배차 간격 조정 (작성 중, 정상 추진)
  {
    id: 'proj_4_08',
    manageNo: '4-08',
    title: '4호선 증차를 통한 배차 간격 조정',
    category: '공약사업',
    needHelp: ['해당없음'],
    isNew: '계속',
    completionPeriod: '임기내',
    period: '2026~2027',
    currentStage: '차량기지 입출고열차→영업 열차 전환(증회) 협의 중',
    hostAgency: '서울특별시(서울교통공사)',
    bureauId: 'bureau_traffic',
    bureauName: '교통국',
    departmentId: 'dept_railway',
    departmentName: '교통정책과',
    teamName: '철도운영팀',
    managerName: '김영준',
    managerPhone: '031-590-0972',
    purpose: '진접차량기지 입출고 열차를 영업열차로 전환하여 진접선 출퇴근 및 평시 배차간격을 획기적으로 단축',
    overview: {
      section: '서울 당고개/불암산 ~ 남양주 진접 (진접선 전 구간)',
      volume: '출퇴근 10~12분, 평시 20분 배차 ➔ 첨두시 배차 단축',
      totalCostDesc: '연간 운영비 약 362억 원 (서울교통공사 위탁협약 갱신 시 조정)'
    },
    investmentPlan: {
      totalBudget: 36200,
      unit: '백만원',
      priorInvested: 0,
      otherNote: '운영비 성격 (증회 시 추가 운영비 시비 편성 예정)',
      yearly: [
        { year: 2026, total: 0, national: 0, provincial: 0, municipal: 0, other: 0 },
        { year: 2027, total: 1800, national: 0, provincial: 0, municipal: 1800, other: 0 },
        { year: 2028, total: 3600, national: 0, provincial: 0, municipal: 3600, other: 0 },
        { year: 2029, total: 3600, national: 0, provincial: 0, municipal: 3600, other: 0 },
        { year: 2030, total: 3600, national: 0, provincial: 0, municipal: 3600, other: 0 }
      ]
    },
    issuesAndSolutions: {
      issues: '입출고 열차 영업 전환 시 서울교통공사 인력 및 전력비용 추가 발생으로 운영비 분담금 증가 요구',
      solutions: '2027년 3월 만료되는 운영협약 갱신 협상 테이블에서 시의회 동의 및 예산 반영을 전제로 증회 방안 합의 추진'
    },
    targets: {
      finalGoal: '진접선 출퇴근 배차간격 단축 및 상시 증회 운행',
      termGoal: '서울교통공사 협약 체결 및 증회 시행'
    },
    schedules: [
      { year: 2026, plan: '관계기관 협의 11차례 추진 완료 및 협약안 마련', progressRate: 70 },
      { year: 2027, plan: '상반기 중 증회(배차간격 개선) 전면 시행', progressRate: 100 }
    ],
    achievements: [
      { date: '2026.04.29', content: '남양주시-서울교통공사 국장급 고위 정책간담회 개최' },
      { date: '2026.08.27', content: '진접선 협약 갱신 11차 실무회의 (열차 증회 합의 도출)' }
    ],
    futurePlans: [
      { date: '2026.11', content: '남양주시의회 운영협약 갱신 동의안 제출' },
      { date: '2027.03', content: '새 운영협약 체결 및 4호선 증회 첫차 운행 개시' }
    ],
    location: {
      type: '단일지점',
      address: '남양주시 진접읍 금곡리 진접역 및 별내별가람역',
      dong: '진접읍',
      lat: 37.7289,
      lng: 127.1994
    },
    executionStatus: '정상추진',
    reportStatus: '작성중',
    publicStatus: '미공개',
    currentVersion: 1,
    lastUpdated: '2026-09-22',
    createdAt: '2026-07-01',
    indicators: [
      {
        id: 'ind_4_08_1',
        projectId: 'proj_4_08',
        name: '출퇴근 첨두시 배차간격',
        unit: '분',
        baselineValue: 12,
        targetValue: 8,
        currentValue: 12,
        calcType: '감소형',
        achievementRate: 50
      }
    ]
  },

  // 6. 남양주형 똑버스(DRT) 전 권역 확대 (게시 중, 정상 추진)
  {
    id: 'proj_4_14',
    manageNo: '4-14',
    title: '남양주형 똑버스(DRT) 전 권역 확대',
    category: '공약사업',
    needHelp: ['재정'],
    isNew: '신규',
    completionPeriod: '임기후',
    period: '2026~2030 이후',
    currentStage: '기본계획 수립 및 1권역 시범운영 준비',
    hostAgency: '경기도(광역교통정책과), 남양주시',
    bureauId: 'bureau_traffic',
    bureauName: '교통국',
    departmentId: 'dept_bus',
    departmentName: '대중교통과',
    teamName: '버스노선팀',
    managerName: '박대중',
    managerPhone: '031-590-1444',
    purpose: '교통취약지역의 대중교통 접근성을 향상하기 위해 기존 비효율 공영·벽지노선을 호출형 수요응답형 버스(똑버스)로 전면 혁신',
    overview: {
      section: '3개 권역 10개 노선, 총 14대(15인승 소형 승합차)',
      volume: '1권역(화도·수동 4대), 2권역(오남·진접 5대), 3권역(별내면·동 1대 등)',
      totalCostDesc: '총사업비 60억 원 (도비 30%, 시비 70% 매칭)'
    },
    investmentPlan: {
      totalBudget: 6000,
      unit: '백만원',
      priorInvested: 0,
      otherNote: '연간 운영비 약 20억원 (도비 6억, 시비 14억)',
      yearly: [
        { year: 2026, total: 0, national: 0, provincial: 0, municipal: 0, other: 0 },
        { year: 2027, total: 2000, national: 0, provincial: 600, municipal: 1400, other: 0 },
        { year: 2028, total: 2000, national: 0, provincial: 600, municipal: 1400, other: 0 },
        { year: 2029, total: 0, national: 0, provincial: 0, municipal: 0, other: 0 },
        { year: 2030, total: 0, national: 0, provincial: 0, municipal: 0, other: 0 },
        { year: 9999, total: 2000, national: 0, provincial: 600, municipal: 1400, other: 0 }
      ]
    },
    issuesAndSolutions: {
      issues: '경기도 예산 부족으로 2027년 신규 사업 승인 지연 우려 및 택시업계 수익 감소 우려',
      solutions: '기존 공영버스 폐쇄로 절감되는 예산을 똑버스 재정지원금으로 전환 편성하고, 택시업계 지원 상생협의체 구성'
    },
    targets: {
      finalGoal: '남양주 전 권역 3개 구역 14대 똑버스 완전 정착',
      termGoal: '1개 권역(별내권역) 시범운영 및 2단계 확대'
    },
    schedules: [
      { year: 2026, plan: '기본계획 수립 및 운수업체 사전 협의', progressRate: 20 },
      { year: 2027, plan: '1개 권역(별내면·동) 시범운영 개시', progressRate: 50 },
      { year: 2028, plan: '화도·수동, 오남·진접 2개 권역 확대', progressRate: 100 }
    ],
    achievements: [
      { date: '2026.06.15', content: '수요응답형 버스(DRT) 도입 사전 타당성 검토 완료' },
      { date: '2026.08.20', content: '별내권역 시범운영 노선도(안) 확정 (편도 11km)' }
    ],
    futurePlans: [
      { date: '2026.12', content: '경기도 수요조사 제출 및 조례 정비' },
      { date: '2027.05', content: '한정면허 사업자 공모 및 차량 출고' }
    ],
    location: {
      type: '구역',
      address: '남양주시 별내면·별내동 / 화도읍 / 진접읍 전역',
      dong: '별내동',
      lat: 37.6482,
      lng: 127.1192
    },
    executionStatus: '정상추진',
    reportStatus: '최종승인',
    publicStatus: '게시',
    currentVersion: 1,
    lastUpdated: '2026-09-12',
    createdAt: '2026-07-01',
    indicators: [
      {
        id: 'ind_4_14_1',
        projectId: 'proj_4_14',
        name: '운행 권역 수',
        unit: '개 권역',
        baselineValue: 0,
        targetValue: 3,
        currentValue: 1,
        calcType: '증가형',
        achievementRate: 33.3
      }
    ],
    photos: {
      planUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800',
      caption: '남양주형 똑버스(DRT) 차량 외관 및 권역별 순환 노선도'
    }
  },

  // 7. 별내역 환승센터 건립 (게시 중, 정상 추진)
  {
    id: 'proj_4_12',
    manageNo: '4-12',
    title: '별내역 환승센터 건립',
    category: '공약사업',
    needHelp: ['해당없음'],
    isNew: '계속',
    completionPeriod: '임기내',
    period: '2015~2028',
    currentStage: '환승센터 공사 착공 (2026. 9.)',
    hostAgency: '한국토지주택공사(LH)',
    bureauId: 'bureau_traffic',
    bureauName: '교통국',
    departmentId: 'dept_railway',
    departmentName: '교통정책과',
    teamName: '교통체계개선팀',
    managerName: '이해광',
    managerPhone: '031-590-4647',
    purpose: '별내지구 택지개발 광역교통개선대책으로 경춘선·8호선 별내역 환승센터를 조성하여 버스·철도·승용차 간 유기적 환승체계 구축',
    overview: {
      section: '남양주시 별내동 982번지 (부지 4,092㎡)',
      volume: '지하1층 ~ 지상5층, 연면적 8,885㎡ / 환승주차장 128면, 환승정류장, 배웅정차대',
      totalCostDesc: '총사업비 308억 원 (남양주시 93억, 구리시 41억, LH 174억)'
    },
    investmentPlan: {
      totalBudget: 30800,
      unit: '백만원',
      priorInvested: 3300,
      otherNote: 'LH 분담금 174억원 및 구리시 분담금 포함',
      yearly: [
        { year: 2026, total: 0, national: 0, provincial: 0, municipal: 0, other: 0 },
        { year: 2027, total: 27500, national: 0, provincial: 0, municipal: 6000, other: 21500 },
        { year: 2028, total: 0, national: 0, provincial: 0, municipal: 0, other: 0 },
        { year: 2029, total: 0, national: 0, provincial: 0, municipal: 0, other: 0 },
        { year: 2030, total: 0, national: 0, provincial: 0, municipal: 0, other: 0 }
      ]
    },
    issuesAndSolutions: {
      issues: '공사 기간 중 기존 환승정류장 임시 이전으로 별내역 이용 승객 불편 발생 우려',
      solutions: '임시 환승 동선을 최소화하고 안내표지판 및 안내 도우미 배치로 시민 불편 최소화'
    },
    targets: {
      finalGoal: '별내역 복합 환승센터 준공 및 개통 (2028년 3월)',
      termGoal: '환승센터 착공 및 골조 공사 70% 달성'
    },
    schedules: [
      { year: 2026, plan: '공사 착공(LH)', progressRate: 10 },
      { year: 2027, plan: '골조 및 내외장 공사 추진', progressRate: 50 },
      { year: 2028, plan: '공사 준공 및 시운전', progressRate: 100 }
    ],
    achievements: [
      { date: '2025.11.20', content: '건축 인허가 승인 완료' },
      { date: '2026.03.15', content: '남양주시-LH 공사 시행 업무협약 체결' },
      { date: '2026.09.05', content: '별내역 환승센터 기초 토목공사 실착공' }
    ],
    futurePlans: [
      { date: '2027.06', content: '지상 5층 철골 구조물 완성' },
      { date: '2028.03', content: '환승주차장 128면 정식 개장' }
    ],
    location: {
      type: '단일지점',
      address: '남양주시 별내동 982번지',
      dong: '별내동',
      lat: 37.6425,
      lng: 127.1264
    },
    executionStatus: '정상추진',
    reportStatus: '최종승인',
    publicStatus: '게시',
    currentVersion: 1,
    lastUpdated: '2026-09-10',
    createdAt: '2026-07-01',
    indicators: [
      {
        id: 'ind_4_12_1',
        projectId: 'proj_4_12',
        name: '공사 공정률',
        unit: '%',
        baselineValue: 0,
        targetValue: 100,
        currentValue: 12,
        calcType: '증가형',
        achievementRate: 12
      }
    ],
    photos: {
      beforeUrl: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800',
      afterUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f9?w=800',
      planUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800',
      caption: '별내역 환승센터 조감도 및 착공 현장 모습'
    }
  },

  // 8. 도심 밀집지역 공공주차장 확대 (게시 중, 정상 추진)
  {
    id: 'proj_4_20',
    manageNo: '4-20',
    title: '도심 밀집지역 공공주차장 확대',
    category: '공약사업',
    needHelp: ['해당없음'],
    isNew: '계속',
    completionPeriod: '임기내',
    period: '2026~2030',
    currentStage: '퇴계원중, 다산진건, 다산역 등 5대 공영주차장 순차 조성 공사 중',
    hostAgency: '남양주시',
    bureauId: 'bureau_traffic',
    bureauName: '교통국',
    departmentId: 'dept_parking',
    departmentName: '주차관리과',
    teamName: '주차시설팀',
    managerName: '오문환',
    managerPhone: '031-590-5399',
    purpose: '도심 밀집지 주차난 해소를 위해 학교 운동장 지하화 및 공원·역세권 유휴부지를 활용한 공영주차장 대폭 확충',
    overview: {
      section: '퇴계원, 다산진건, 다산역, 평내동 물놀이장, 다산지금 등 관내 5개소',
      volume: '총 958면 주차공간 확충 (퇴계원중 174면, 다산진건 94면, 다산역 308면 등)',
      totalCostDesc: '총사업비 1,223억 4,900만 원 (국비 31억, 도비 78억, 시비 1,114.49억)'
    },
    investmentPlan: {
      totalBudget: 122349,
      unit: '백만원',
      priorInvested: 58819,
      yearly: [
        { year: 2026, total: 200, national: 0, provincial: 0, municipal: 200, other: 0 },
        { year: 2027, total: 15130, national: 0, provincial: 0, municipal: 15130, other: 0 },
        { year: 2028, total: 5200, national: 0, provincial: 0, municipal: 5200, other: 0 },
        { year: 2029, total: 2200, national: 0, provincial: 0, municipal: 2200, other: 0 },
        { year: 2030, total: 2200, national: 0, provincial: 0, municipal: 2200, other: 0 },
        { year: 9999, total: 31400, national: 0, provincial: 0, municipal: 31400, other: 0 }
      ]
    },
    issuesAndSolutions: {
      issues: '다산지금지구(주2) 미확보 예산 149억 원의 시급한 본예산 편성 필요',
      solutions: '연차별 중기지방재정계획에 우선 반영하고 특별조정교부금 및 시유지 매각대금을 활용하여 재원 조기 확보'
    },
    targets: {
      finalGoal: '5개소 958면 공영주차장 전면 개장',
      termGoal: '퇴계원중(75%) 및 다산진건(91%) 연내 준공'
    },
    schedules: [
      { year: 2026, plan: '다산진건(10월), 퇴계원중(12월) 주차장 준공 및 운영 개시', actual: '다산진건 91%, 퇴계원중 75% 공정 진행', progressRate: 75 },
      { year: 2027, plan: '다산역 환승주차장(308면) 준공', progressRate: 90 },
      { year: 2028, plan: '평내동 물놀이장 및 다산지금지구 완공', progressRate: 100 }
    ],
    achievements: [
      { date: '2025.06.27', content: '퇴계원중학교 시설복합화 지하주차장(174면) 착공' },
      { date: '2025.09.22', content: '다산진건지구(주9) 공영주차장(94면) 착공' },
      { date: '2026.08.30', content: '다산진건 주차타워 외장 마감 완료 (공정률 91%)' }
    ],
    futurePlans: [
      { date: '2026.10.15', content: '다산진건(주9) 시범 무료개방 및 정식 운영' },
      { date: '2026.12.30', content: '퇴계원중 지하공영주차장 개장식' }
    ],
    location: {
      type: '단일지점',
      address: '남양주시 퇴계원읍 퇴계원리 100 일원 / 다산동 일원',
      dong: '퇴계원읍',
      lat: 37.6496,
      lng: 127.1425
    },
    executionStatus: '정상추진',
    reportStatus: '최종승인',
    publicStatus: '게시',
    currentVersion: 1,
    lastUpdated: '2026-09-18',
    createdAt: '2026-07-01',
    indicators: [
      {
        id: 'ind_4_20_1',
        projectId: 'proj_4_20',
        name: '확충 주차면 수',
        unit: '면',
        baselineValue: 0,
        targetValue: 958,
        currentValue: 268,
        calcType: '증가형',
        achievementRate: 28
      }
    ],
    photos: {
      beforeUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800',
      afterUrl: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800',
      caption: '퇴계원중학교 운동장 지하화 및 다산진건 주차타워 전경'
    }
  },

  // 9. 쓸모있는 주차면 혁신사업(입체형 주차유도선) (완료, 최종승인, 게시)
  {
    id: 'proj_4_22',
    manageNo: '4-22',
    title: '쓸모있는 주차면 혁신사업(입체형 주차유도선)',
    category: '공약사업',
    needHelp: ['해당없음'],
    isNew: '신규',
    completionPeriod: '임기내',
    period: '2026.7~2026.12',
    currentStage: '관내 노외 공영주차장 49개소 설치 완료 (3,606면)',
    hostAgency: '남양주시 주차관리과',
    bureauId: 'bureau_traffic',
    bureauName: '교통국',
    departmentId: 'dept_parking',
    departmentName: '주차관리과',
    teamName: '주차계획팀',
    managerName: '김환희',
    managerPhone: '031-590-8763',
    purpose: '노외 공영주차장 벽면 및 펜스에 야간 후진 시에도 잘 보이는 입체형 반사 주차유도선을 설치하여 후방 추돌사고 예방과 초보운전자 주차편의 증진',
    overview: {
      section: '남양주시 노외 공영주차장 49개소 전역',
      volume: '3,606면 주차면 벽면·펜스 반사도색 및 형광유도선 시공',
      totalCostDesc: '시비 1,350만 원 (공영주차장 유지보수공사 단가계약 활용 예산 절감)'
    },
    investmentPlan: {
      totalBudget: 14,
      unit: '백만원',
      priorInvested: 0,
      yearly: [
        { year: 2026, total: 14, national: 0, provincial: 0, municipal: 14, other: 0 }
      ]
    },
    issuesAndSolutions: {
      issues: '사유 담장 경계구간 도색 불가 및 펜스망 도료 탈락 우려',
      solutions: '사유시설은 소유주 사전동의 후 시선유도봉 부착으로 대체하고 철망 펜스는 고휘도 반사지로 이원화 시공'
    },
    targets: {
      finalGoal: '노외 공영주차장 설치 완료 및 신규 주차장 100% 의무 적용',
      termGoal: '2026년 내 3,606면 설치 완료'
    },
    schedules: [
      { year: 2026, plan: '49개소 3,606면 설치 공사 및 현장 검수 완료', actual: '49개소 설치 100% 완료', progressRate: 100 }
    ],
    achievements: [
      { date: '2026.06.10', content: '민선9기 시장직 인수위 신규 혁신과제 채택' },
      { date: '2026.08.15', content: '진접 제3·4공영주차장 시범 시공 및 시민 만족도 98% 기록' },
      { date: '2026.09.28', content: '관내 49개소 3,606면 전체 시공 준공 검사 완료' }
    ],
    futurePlans: [
      { date: '2027.01', content: '신규 준공 공영주차장 표준 설계도서에 반영 의무화' }
    ],
    location: {
      type: '시전체',
      address: '남양주시 관내 노외 공영주차장 49개소',
      dong: '진접읍',
      lat: 37.7123,
      lng: 127.1852
    },
    executionStatus: '완료',
    reportStatus: '최종승인',
    publicStatus: '게시',
    currentVersion: 1,
    lastUpdated: '2026-09-30',
    createdAt: '2026-07-01',
    indicators: [
      {
        id: 'ind_4_22_1',
        projectId: 'proj_4_22',
        name: '입체형 유도선 설치 주차면 수',
        unit: '면',
        baselineValue: 0,
        targetValue: 3606,
        currentValue: 3606,
        calcType: '증가형',
        achievementRate: 100
      }
    ],
    photos: {
      beforeUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800',
      afterUrl: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800',
      caption: '진접 제3·제4공영주차장 입체형 주차유도선 시공 완료 현장 사진'
    }
  },

  // 10. 수석대교 6차선 직결 추진 (보완 요청/반려 이력 시연, 지연)
  {
    id: 'proj_4_26',
    manageNo: '4-26',
    title: '수석대교 6차선 직결 추진',
    category: '공약사업',
    needHelp: ['권한'],
    isNew: '계속',
    completionPeriod: '임기후',
    period: '2018~2032',
    currentStage: '남양주 구간 우선 착공(2026. 7.) 후 하남시 선동IC 직결 협의 진행 중',
    hostAgency: '한국토지주택공사(LH)',
    bureauId: 'bureau_traffic',
    bureauName: '교통국',
    departmentId: 'dept_road',
    departmentName: '도로건설과',
    teamName: '도로건설1팀',
    managerName: '이도로',
    managerPhone: '031-590-4724',
    purpose: '남양주 왕숙지구 및 양정역세권 등 대규모 개발에 따른 교통량 증가에 대응하여 한강 횡단 교량 신설로 강남권 접근성 개선',
    overview: {
      section: '남양주시 수석동(미음나루) ~ 하남시 선동IC',
      volume: 'L = 794m 교량 신설 (당초 4차선 비직결 ➔ 6차선 직결 추진)',
      totalCostDesc: '총사업비 3,801억 원 (전액 LH 왕숙지구 광역교통부담금)'
    },
    investmentPlan: {
      totalBudget: 380100,
      unit: '백만원',
      priorInvested: 5000,
      otherNote: 'LH 전액 부담 사업 (시비 부담 없음)',
      yearly: [
        { year: 2026, total: 30000, national: 0, provincial: 0, municipal: 0, other: 30000 },
        { year: 2027, total: 60000, national: 0, provincial: 0, municipal: 0, other: 60000 },
        { year: 2028, total: 80000, national: 0, provincial: 0, municipal: 0, other: 80000 }
      ]
    },
    issuesAndSolutions: {
      issues: '하남시 주민들의 선동IC 일대 교통정체 우려로 직결 연결 반대 민원 지속',
      solutions: '남양주 구간 공사를 우선 착공하고, 국토부·대광위·경기도·하남시 다자간 협의체를 통해 우회도로 개설 등 상생 대책 병행 제시'
    },
    targets: {
      finalGoal: '수석대교 6차선 완전 직결 준공 (2032년 7월)',
      termGoal: '남양주 교각 공사 착공 및 선동IC 직결 협의 타결'
    },
    schedules: [
      { year: 2026, plan: '시도 노선 지정 및 남양주구간 공사 착공', progressRate: 20 },
      { year: 2027, plan: '하남시 협의 완료 및 주교각 기초 설치', progressRate: 35 },
      { year: 2030, plan: '상판 가설 및 접속도로 시공', progressRate: 70 }
    ],
    achievements: [
      { date: '2024.06.20', content: '경기도 시도 노선 지정 조건부 통보' },
      { date: '2026.07.27', content: '수석대교 남양주 구간 기공식 및 본공사 착공' }
    ],
    futurePlans: [
      { date: '2026.11', content: '대광위 주관 하남-남양주 교통협의체 3차 본회의' },
      { date: '2027.06', content: '선동IC 직결 설계변경안 국토부 신청' }
    ],
    location: {
      type: '단일지점',
      address: '남양주시 수석동 미음나루 한강변',
      dong: '수석동',
      lat: 37.5812,
      lng: 127.1611
    },
    executionStatus: '지연',
    reportStatus: '보완요청', // 반려 이력 시연
    publicStatus: '게시', // 이전 버전 게시 유지 상태
    currentVersion: 2,
    lastUpdated: '2026-09-25',
    createdAt: '2026-07-01',
    indicators: [
      {
        id: 'ind_4_26_1',
        projectId: 'proj_4_26',
        name: '교량 토목공정률',
        unit: '%',
        baselineValue: 0,
        targetValue: 100,
        currentValue: 15,
        calcType: '증가형',
        achievementRate: 15
      }
    ],
    photos: {
      planUrl: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800',
      caption: '수석대교 한강 횡단 교량 조감도 및 선동IC 접속 계획안'
    }
  },

  // 11. 어린이 안심 보행환경 및 스마트 스쿨존 조성 (정상 추진, 게시)
  {
    id: 'proj_4_25',
    manageNo: '4-25',
    title: '어린이 안심 보행환경 및 스마트 스쿨존 조성',
    category: '공약사업',
    needHelp: ['재정'],
    isNew: '계속',
    completionPeriod: '임기내',
    period: '2026~2030',
    currentStage: '2026년도 적색잔여표시기 23개소 발주 및 노면정비 시행 중',
    hostAgency: '남양주시 (협조: 경기도, 남양주북부·남양주남부경찰서)',
    bureauId: 'bureau_traffic',
    bureauName: '교통국',
    departmentId: 'dept_railway',
    departmentName: '교통정책과',
    teamName: '교통시설팀',
    managerName: '길재관',
    managerPhone: '031-590-2438',
    purpose: '어린이보호구역 내 첨단 스마트 교통안전시설(적색잔여시간표시기, LED바닥신호, 방호울타리)을 대대적으로 확충하여 어린이 교통사고 제로화 달성',
    overview: {
      section: '남양주시 관내 초등학교 및 어린이보호구역 60개소',
      volume: '적색잔여표시기 60개소, 차량용 방호울타리 4km, 바닥형 보행신호등',
      totalCostDesc: '총사업비 67.5억 원 (도비 16.71억, 시비 50.79억)'
    },
    investmentPlan: {
      totalBudget: 6750,
      unit: '백만원',
      priorInvested: 0,
      yearly: [
        { year: 2026, total: 1630, national: 0, provincial: 615, municipal: 1015, other: 0 },
        { year: 2027, total: 1280, national: 0, provincial: 264, municipal: 1016, other: 0 },
        { year: 2028, total: 1280, national: 0, provincial: 264, municipal: 1016, other: 0 }
      ]
    },
    issuesAndSolutions: {
      issues: '스쿨존 시설물 증가에 따른 지속적 유지보수 예산 부담',
      solutions: '행안부 재난안전 특별교부세 및 경기도 특별조정교부금을 적극 확보하여 시비 절감'
    },
    targets: {
      finalGoal: '어린이보호구역 60개소 스마트 시설 개선 완료',
      termGoal: '임기내 60개소 정비 완료'
    },
    schedules: [
      { year: 2026, plan: '20개소 시설 개선 (적색잔여표시기 23개소 발주)', progressRate: 25 },
      { year: 2027, plan: '20개소 시설 개선', progressRate: 60 },
      { year: 2028, plan: '20개소 시설 개선 및 완료', progressRate: 100 }
    ],
    achievements: [
      { date: '2026.07.01', content: '풍양초교 어린이보호구역 노면표시 도색 완료' },
      { date: '2026.08.18', content: '적색잔여시간표시기 23개소 설치 공사 계약 체결' }
    ],
    futurePlans: [
      { date: '2026.10.30', content: '스마트 신호기 23개소 준공 및 점등식' },
      { date: '2027.02', content: '개학기 대비 스쿨존 안전펜스 일제 정비' }
    ],
    location: {
      type: '단일지점',
      address: '남양주시 진접읍 풍양초등학교 앞 스쿨존 등',
      dong: '진접읍',
      lat: 37.7148,
      lng: 127.1891
    },
    executionStatus: '정상추진',
    reportStatus: '최종승인',
    publicStatus: '게시',
    currentVersion: 1,
    lastUpdated: '2026-09-08',
    createdAt: '2026-07-01',
    indicators: [
      {
        id: 'ind_4_25_1',
        projectId: 'proj_4_25',
        name: '스마트 스쿨존 개선 개소수',
        unit: '개소',
        baselineValue: 0,
        targetValue: 60,
        currentValue: 15,
        calcType: '증가형',
        achievementRate: 25
      }
    ],
    photos: {
      beforeUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800',
      afterUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800',
      caption: '스마트스쿨존 적색잔여시간표시기 및 차량 방호울타리 시공 현장'
    }
  },

  // 12. 장애인 이동권 확대 및 특별교통수단 확충 (보류/지연, 승인대기)
  {
    id: 'proj_5_20',
    manageNo: '5-20',
    title: '장애인 이동권 확대 및 특별교통수단 확충',
    category: '공약사업',
    needHelp: ['재정'],
    isNew: '계속',
    completionPeriod: '임기내',
    period: '2027~2029',
    currentStage: '2027년 운영·도입비 수요조사 제출 완료',
    hostAgency: '남양주시 (민간위탁: 제칠일안식일예수재림교 한국연합회)',
    bureauId: 'bureau_traffic',
    bureauName: '교통국',
    departmentId: 'dept_railway',
    departmentName: '교통정책과',
    teamName: '교통체계개선팀',
    managerName: '이해광',
    managerPhone: '031-590-4647',
    purpose: '휠체어 이용 장애인과 교통약자의 이동권 보장을 위해 특별교통수단 및 바우처택시를 단계적으로 대폭 증차',
    overview: {
      section: '남양주시 전역 및 수도권 인접 병원 연계',
      volume: '특별교통수단 71대(현재 60대), 바우처택시 69대(현재 53대) 운영',
      totalCostDesc: '총사업비 10억 1,100만 원 (국비 3.13억, 도비 1.15억, 시비 5.82억)'
    },
    investmentPlan: {
      totalBudget: 1011,
      unit: '백만원',
      priorInvested: 0,
      yearly: [
        { year: 2026, total: 0, national: 0, provincial: 0, municipal: 0, other: 0 },
        { year: 2027, total: 396, national: 114, provincial: 50.4, municipal: 231.6, other: 0 },
        { year: 2028, total: 444, national: 114, provincial: 64.8, municipal: 265.2, other: 0 },
        { year: 2029, total: 171, national: 85.5, provincial: 0, municipal: 85.5, other: 0 }
      ]
    },
    issuesAndSolutions: {
      issues: '경기도 비상재정 체제에 따라 도비 보조금 축소 가능성으로 도입 지연 우려',
      solutions: '교통약자 이동권은 필수 복지이므로 시비 추가 편성을 우선 검토하여 사업량 유지'
    },
    targets: {
      finalGoal: '특별교통수단 71대, 바우처택시 69대 운영',
      termGoal: '특별교통수단 11대, 바우처택시 16대 증차'
    },
    schedules: [
      { year: 2027, plan: '특별교통수단 4대, 바우처택시 7대 증차', progressRate: 41 },
      { year: 2028, plan: '특별교통수단 4대, 바우처택시 9대 증차', progressRate: 89 },
      { year: 2029, plan: '특별교통수단 3대 추가 도입', progressRate: 100 }
    ],
    achievements: [
      { date: '2026.08.14', content: '2027년 국·도비 운영도입비 수요조사 제출' }
    ],
    futurePlans: [
      { date: '2027.03', content: '특장차량 제작 구매 발주' }
    ],
    location: {
      type: '시전체',
      address: '남양주시 금곡동 교통약자이동지원센터',
      dong: '금곡동',
      lat: 37.6278,
      lng: 127.2081
    },
    executionStatus: '보류',
    reportStatus: '국검토대기',
    publicStatus: '미공개',
    currentVersion: 1,
    lastUpdated: '2026-09-14',
    createdAt: '2026-07-01',
    indicators: [
      {
        id: 'ind_5_20_1',
        projectId: 'proj_5_20',
        name: '특별교통수단 총 보유대수',
        unit: '대',
        baselineValue: 60,
        targetValue: 71,
        currentValue: 60,
        calcType: '증가형',
        achievementRate: 0
      }
    ]
  },

  // 13. 남양주 G-Pass 어르신·아동·청소년 무상 대중교통비 지원 (정상추진, 게시)
  {
    id: 'proj_4_19',
    manageNo: '4-19',
    title: '남양주 G-Pass 도입을 통한 어르신·아동·청소년 무상 대중교통비 지원',
    category: '공약사업',
    needHelp: ['재정'],
    isNew: '신규',
    completionPeriod: '임기후',
    period: '2026~2030',
    currentStage: '어르신·어린이·청소년 교통비 지원사업 진행 및 단계적 확대 검토 중',
    hostAgency: '남양주시 (협조: 경기도)',
    bureauId: 'bureau_traffic',
    bureauName: '교통국',
    departmentId: 'dept_bus',
    departmentName: '대중교통과',
    teamName: '버스행정팀',
    managerName: '윤태준',
    managerPhone: '031-590-8278',
    purpose: '어르신과 성장기 청소년·어린이의 대중교통 이용요금을 전액 환급 지원하여 교통복지를 대폭 향상',
    overview: {
      section: '남양주시 거주 만 65세 이상 어르신 및 6~18세 어린이·청소년',
      volume: '대중교통 이용 실적에 대한 분기별 교통비 사후 환급',
      totalCostDesc: '임기내 투자 1,047억 2,600만 원 (전액 시비)'
    },
    investmentPlan: {
      totalBudget: 104726,
      unit: '백만원',
      priorInvested: 8163,
      yearly: [
        { year: 2026, total: 8163, national: 0, provincial: 0, municipal: 8163, other: 0 },
        { year: 2027, total: 18800, national: 0, provincial: 0, municipal: 18800, other: 0 },
        { year: 2028, total: 21000, national: 0, provincial: 0, municipal: 21000, other: 0 }
      ]
    },
    issuesAndSolutions: {
      issues: '전면 무상지원 시 연간 200억원 이상의 대규모 재정 소요 부담',
      solutions: '기존 경기도 어린이·청소년 교통비 지원 플랫폼(G-Pass)과 연계하여 관리비용을 최소화하고 연령대별 단계적 환급률 상향'
    },
    targets: {
      finalGoal: '어르신·어린이·청소년 무상 대중교통 지원체계 완전 구축',
      termGoal: '대상자별 단계적 환급 시행'
    },
    schedules: [
      { year: 2026, plan: '소요재원 산정 및 기본계획 수립', progressRate: 20 },
      { year: 2027, plan: 'G-Pass 연계 시스템 구축 및 1차 확대', progressRate: 40 },
      { year: 2028, plan: '무상 대중교통비 지원사업 전면 시행', progressRate: 80 }
    ],
    achievements: [
      { date: '2026.06.30', content: '남양주시 거주 대상자 인구통계 및 재정 시뮬레이션 완료' }
    ],
    futurePlans: [
      { date: '2027.01', content: 'G-Pass 교통비 지원 시스템 고도화 착수' }
    ],
    location: {
      type: '시전체',
      address: '남양주시 전역',
      dong: '다산1동',
      lat: 37.6360,
      lng: 127.1700
    },
    executionStatus: '정상추진',
    reportStatus: '최종승인',
    publicStatus: '게시',
    currentVersion: 1,
    lastUpdated: '2026-09-05',
    createdAt: '2026-07-01',
    indicators: [
      {
        id: 'ind_4_19_1',
        projectId: 'proj_4_19',
        name: '교통비 수혜 시민 누적인원',
        unit: '명',
        baselineValue: 32000,
        targetValue: 120000,
        currentValue: 48500,
        calcType: '증가형',
        achievementRate: 40.4
      }
    ]
  },

  // 14. 3호선 덕소 연결 및 연장 추진 (추진 전, 미공개)
  {
    id: 'proj_4_05',
    manageNo: '4-05',
    title: '3호선 덕소 연결 및 연장 추진',
    category: '공약사업',
    needHelp: ['재정', '권한'],
    isNew: '계속',
    completionPeriod: '임기내',
    period: '2021~',
    currentStage: '제5차 대도시권 광역교통시행계획 반영 건의 완료',
    hostAgency: '국토교통부(대광위), 경기도(철도정책과)',
    bureauId: 'bureau_traffic',
    bureauName: '교통국',
    departmentId: 'dept_railway',
    departmentName: '교통정책과',
    teamName: '철도기획팀',
    managerName: '김교통',
    managerPhone: '031-590-4428',
    purpose: '하남시청역에서 남양주 덕소까지 3호선(송파하남선)을 연결하여 와부권역 철도 접근성 획기적 제고',
    overview: {
      section: '하남시(하남시청역) ~ 남양주(덕소)',
      volume: 'L = 6.26km 한강 하저 철도 연장',
      totalCostDesc: '총사업비 약 8,919억 원 (국가계획 반영 후 분담 비율 결정)'
    },
    investmentPlan: {
      totalBudget: 891900,
      unit: '백만원',
      priorInvested: 0,
      yearly: [
        { year: 2026, total: 0, national: 0, provincial: 0, municipal: 0, other: 0 }
      ]
    },
    issuesAndSolutions: {
      issues: '국가 상위계획인 제5차 광역교통시행계획 반영이 선결 과제',
      solutions: '대광위 및 경기도와 긴밀한 정책공조를 유지하고 덕소 재개발 교통수요를 반영한 타당성 논리 제공'
    },
    targets: {
      finalGoal: '3호선 덕소 연장선 준공 및 개통',
      termGoal: '국가계획 반영 및 예타 대상 선정'
    },
    schedules: [
      { year: 2026, plan: '제5차 대도시권 광역교통 시행계획 반영', progressRate: 20 },
      { year: 2028, plan: '예타 신청 및 완료', progressRate: 50 },
      { year: 2030, plan: '기본계획 수립', progressRate: 70 }
    ],
    achievements: [
      { date: '2024.12.27', content: '제5차 광역교통시행계획 사업건의(도→대광위)' }
    ],
    futurePlans: [
      { date: '2026.12', content: '국토부 제5차 시행계획 고시 대응' }
    ],
    location: {
      type: '단일지점',
      address: '남양주시 와부읍 덕소리 덕소역 일원',
      dong: '와부읍',
      lat: 37.5856,
      lng: 127.2089
    },
    executionStatus: '추진전',
    reportStatus: '작성중',
    publicStatus: '미공개',
    currentVersion: 1,
    lastUpdated: '2026-08-10',
    createdAt: '2026-07-01',
    indicators: [
      {
        id: 'ind_4_05_1',
        projectId: 'proj_4_05',
        name: '국가 상위계획 반영 공정',
        unit: '%',
        baselineValue: 0,
        targetValue: 100,
        currentValue: 20,
        calcType: '단계형',
        achievementRate: 20
      }
    ]
  },

  // 15. 수석호평 고속도로 출퇴근시간 요금 할인 추진 (정상추진, 게시)
  {
    id: 'proj_4_27',
    manageNo: '4-27',
    title: '수석호평 고속도로 출퇴근시간 요금 할인 추진',
    category: '공약사업',
    needHelp: ['해당없음'],
    isNew: '신규',
    completionPeriod: '임기내',
    period: '2026~2041',
    currentStage: '민자도로 출퇴근 100원 할인 조례 제정 및 협약 변경 검토 중',
    hostAgency: '남양주시 도로건설과 (남양주도시고속도로(주))',
    bureauId: 'bureau_traffic',
    bureauName: '교통국',
    departmentId: 'dept_road',
    departmentName: '도로건설과',
    teamName: '민자도로팀',
    managerName: '함영훈',
    managerPhone: '031-590-8773',
    purpose: '화도, 호평, 평내 주민들의 출퇴근 통행료 부담을 줄여 시민 이동권 보장 및 복리 증진',
    overview: {
      section: '수석호평 도시고속도로 전 구간 (동호평IC ~ 수석IC)',
      volume: '출퇴근 시간대 3시간(06~09시, 18~21시) 통행요금 100원 할인',
      totalCostDesc: '총 48.5억 원 (연간 약 3.1억 원 시비 재정지원금 보전)'
    },
    investmentPlan: {
      totalBudget: 4850,
      unit: '백만원',
      priorInvested: 200,
      yearly: [
        { year: 2026, total: 200, national: 0, provincial: 0, municipal: 200, other: 0 },
        { year: 2027, total: 310, national: 0, provincial: 0, municipal: 310, other: 0 },
        { year: 2028, total: 310, national: 0, provincial: 0, municipal: 310, other: 0 }
      ]
    },
    issuesAndSolutions: {
      issues: '할인 시행에 따른 민자사업자 통행료 수입 손실 보전금 지속 발생',
      solutions: '시 지원 조례 제정을 통해 지원 요건을 명확화하고 한시적 예외 운영 규정 마련'
    },
    targets: {
      finalGoal: '2041년 민자운영 종료 시까지 출퇴근 요금 할인 지속',
      termGoal: '조례 제정 및 변경 협약 체결 후 할인 개시'
    },
    schedules: [
      { year: 2026, plan: '추진방안 검토 및 조례안 입법예고', progressRate: 30 },
      { year: 2027, plan: '할인 운영 시행', progressRate: 100 }
    ],
    achievements: [
      { date: '2026.07.20', content: '수석호평 도시고속도로 통행량 및 할인 손실금 추계 용역 완료' }
    ],
    futurePlans: [
      { date: '2026.11', content: '남양주시 민자도로 통행료 지원 조례 제정' },
      { date: '2027.01.01', content: '출퇴근 100원 할인 전면 시행' }
    ],
    location: {
      type: '단일지점',
      address: '남양주시 호평동 수석호평고속도로 백봉영업소',
      dong: '호평동',
      lat: 37.6491,
      lng: 127.2405
    },
    executionStatus: '정상추진',
    reportStatus: '최종승인',
    publicStatus: '게시',
    currentVersion: 1,
    lastUpdated: '2026-09-02',
    createdAt: '2026-07-01',
    indicators: [
      {
        id: 'ind_4_27_1',
        projectId: 'proj_4_27',
        name: '할인 통행 차량 수',
        unit: '대',
        baselineValue: 0,
        targetValue: 1500000,
        currentValue: 0,
        calcType: '증가형',
        achievementRate: 0
      }
    ]
  },

  // 16. 주요 거점과 전철역을 잇는 순환버스 통합 운영 (게시 중, 정상 추진)
  {
    id: 'proj_4_16',
    manageNo: '4-16',
    title: '주요 거점과 전철역을 잇는 순환버스 통합 운영',
    category: '공약사업',
    needHelp: ['해당없음'],
    isNew: '신규',
    completionPeriod: '임기내',
    period: '2027~2030',
    currentStage: '기초조사 및 권역별 노선안 설계 진행 중',
    hostAgency: '남양주시 대중교통과',
    bureauId: 'bureau_traffic',
    bureauName: '교통국',
    departmentId: 'dept_bus',
    departmentName: '대중교통과',
    teamName: '버스노선팀',
    managerName: '박대중',
    managerPhone: '031-590-1444',
    purpose: '행정복지센터, 전철역, 도서관, 보건소, 체육시설을 하나로 연결하는 생활밀착형 무료 순환셔틀버스 도입',
    overview: {
      section: '5개 생활권역(다산·별내, 진접·오남, 화도·수동, 평내·호평, 와부·조안)',
      volume: '권역별 1개 노선, 노선당 3대 차량, 배차간격 20~30분',
      totalCostDesc: '총사업비 100억 원 (연간 20억 원 시비 편성)'
    },
    investmentPlan: {
      totalBudget: 10000,
      unit: '백만원',
      priorInvested: 0,
      yearly: [
        { year: 2026, total: 0, national: 0, provincial: 0, municipal: 0, other: 0 },
        { year: 2027, total: 2000, national: 0, provincial: 0, municipal: 2000, other: 0 },
        { year: 2028, total: 2000, national: 0, provincial: 0, municipal: 2000, other: 0 }
      ]
    },
    issuesAndSolutions: {
      issues: '기존 시내버스 노선과의 중복 우려 및 시 예산 지속 부담',
      solutions: '대중교통 사각지대 공공시설 위주로 노선을 특화하고 실시간 버스도착안내(BIS)와 스마트앱 연동'
    },
    targets: {
      finalGoal: '5개 권역 순환버스 통합 플랫폼 완전 가동',
      termGoal: '다산·별내 1개 권역 시범운영'
    },
    schedules: [
      { year: 2026, plan: '타당성 검토 및 기초조사', progressRate: 20 },
      { year: 2027, plan: '조례 제정 및 노선 확정', progressRate: 40 },
      { year: 2028, plan: '다산·별내권역 시범운영', progressRate: 60 }
    ],
    achievements: [
      { date: '2026.08.10', content: '5개 권역 공공시설 접근성 및 버스 환승 빅데이터 분석 완료' }
    ],
    futurePlans: [
      { date: '2027.02', content: '순환셔틀버스 운영조례 발의' }
    ],
    location: {
      type: '시전체',
      address: '남양주시 5개 권역 전철역 및 행정복지센터',
      dong: '평내동',
      lat: 37.6415,
      lng: 127.2356
    },
    executionStatus: '정상추진',
    reportStatus: '최종승인',
    publicStatus: '게시',
    currentVersion: 1,
    lastUpdated: '2026-09-11',
    createdAt: '2026-07-01',
    indicators: [
      {
        id: 'ind_4_16_1',
        projectId: 'proj_4_16',
        name: '운행 노선 수',
        unit: '개 노선',
        baselineValue: 0,
        targetValue: 5,
        currentValue: 0,
        calcType: '증가형',
        achievementRate: 0
      }
    ]
  }
];
