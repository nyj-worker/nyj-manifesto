import React, { useState } from 'react';
import { Sparkles, Send, MapPin, Tag, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge.tsx';

interface PublicAiSearchProps {
  onNavigate: (tab: string, projectId?: string) => void;
}

export const PublicAiSearch: React.FC<PublicAiSearchProps> = ({ onNavigate }) => {
  const [question, setQuestion] = useState('');
  const [selectedDong, setSelectedDong] = useState('전체');
  const [selectedTopic, setSelectedTopic] = useState('전체');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const sampleQuestions = [
    '우리 동네(별내/다산) 지하철·철도망 연장 공약은 어떤 것들이 있나요?',
    '어린이 통학 안전을 위한 스마트 스쿨존 사업은 어떻게 진행되나요?',
    '어르신과 청소년을 위한 대중교통비 지원(G-Pass) 사업을 알려주세요.',
    '주차난을 해결하기 위한 공영주차장 및 입체형 주차선 사업은 어디에 있나요?'
  ];

  const handleAsk = async (queryText?: string) => {
    const q = queryText || question;
    if (!q.trim()) return;

    try {
      setLoading(true);
      const res = await fetch('/api/ai/custom-ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          dong: selectedDong,
          topic: selectedTopic
        })
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } catch (err) {
      console.error('AI 질문 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* AI 안내 카드 헤더 */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold border border-cyan-400/30">
          <Sparkles className="w-4 h-4 text-cyan-300" />
          공개 데이터 기반 쉬운말 AI 맞춤 안내
        </div>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight">
          궁금한 공약이나 생활 혜택을 자연스러운 질문으로 찾아보세요
        </h2>
        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
          공식 승인된 최신 행정 데이터만을 기반으로 답변하며, 내부 검토자료나 확인되지 않은 일정은 추측하지 않습니다.
        </p>

        {/* 조건 필터 바 */}
        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
          <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/20">
            <MapPin className="w-3.5 h-3.5 text-blue-300" />
            <span>관심 지역:</span>
            <select
              value={selectedDong}
              onChange={e => setSelectedDong(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-hidden"
            >
              <option value="전체" className="text-slate-900">남양주 전체</option>
              <option value="다산동" className="text-slate-900">다산동</option>
              <option value="별내동" className="text-slate-900">별내동</option>
              <option value="진접읍" className="text-slate-900">진접읍</option>
              <option value="와부읍" className="text-slate-900">와부읍</option>
              <option value="화도읍" className="text-slate-900">화도읍</option>
              <option value="호평동" className="text-slate-900">호평·평내동</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/20">
            <Tag className="w-3.5 h-3.5 text-blue-300" />
            <span>관심 분야:</span>
            <select
              value={selectedTopic}
              onChange={e => setSelectedTopic(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-hidden"
            >
              <option value="전체" className="text-slate-900">분야 전체</option>
              <option value="철도" className="text-slate-900">철도·지하철</option>
              <option value="버스" className="text-slate-900">버스·대중교통</option>
              <option value="주차" className="text-slate-900">주차 시설</option>
              <option value="도로" className="text-slate-900">도로·교량</option>
              <option value="복지" className="text-slate-900">교통복지</option>
            </select>
          </div>
        </div>
      </div>

      {/* 질문 입력 창 */}
      <div className="bg-white p-4 rounded-3xl shadow-xs border border-slate-200 space-y-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAsk()}
            placeholder="예: 어르신 교통비는 얼마까지 지원되나요? 또는 우리 동네 버스 공약은?"
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
          <button
            type="button"
            onClick={() => handleAsk()}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md transition-all shrink-0 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {loading ? '검색 중...' : '질문하기'}
          </button>
        </div>

        {/* 추천 질문 칩 */}
        <div className="pt-2">
          <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" /> 자주 묻는 추천 질문:
          </p>
          <div className="flex flex-wrap gap-2">
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuestion(q);
                  handleAsk(q);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-medium border border-slate-200 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AI 답변 결과 패널 */}
      {result && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">쉬운말 맞춤 안내 답변</h3>
            </div>
            <span className="text-xs text-slate-400">기준일: {result.dataBaseDate}</span>
          </div>

          <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line p-5 rounded-2xl bg-blue-50/40 border border-blue-100">
            {result.answer}
          </div>

          {/* 연관 공약 상세 바로가기 카드 목록 */}
          {result.projects && result.projects.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-600">관련 공식 공약사업 상세 바로가기</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.projects.map((p: any) => (
                  <div
                    key={p.id}
                    onClick={() => onNavigate('public-detail', p.id)}
                    className="p-4 rounded-xl bg-slate-50 hover:bg-white border border-slate-200 hover:border-blue-400 cursor-pointer shadow-xs transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-700">[{p.manageNo}]</span>
                      <StatusBadge type="execution" status={p.status} size="sm" />
                    </div>
                    <p className="text-sm font-bold text-slate-900 line-clamp-1">{p.title}</p>
                    <div className="flex items-center justify-between text-xs text-blue-600 font-semibold pt-1">
                      <span>공약 상세 보기</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{result.disclaimer}</span>
          </div>
        </div>
      )}
    </div>
  );
};
