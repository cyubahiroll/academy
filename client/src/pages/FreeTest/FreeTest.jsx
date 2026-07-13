import { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import freeTestService from '../../services/freeTestService';
import { FiClock, FiCheckCircle, FiXCircle, FiBarChart2, FiRefreshCw, FiCpu } from 'react-icons/fi';
import toast from 'react-hot-toast';
import aiAnswerService from '../../services/aiAnswerService';
import { useTranslation } from 'react-i18next';

const TOTAL = 20;
const TIME_PER_QUESTION = 60;

function FreeTest() {
  const { t } = useTranslation();
  const [phase, setPhase] = useState('start');
  const [questions, setQuestions] = useState([]);
  const [attemptId, setAttemptId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [result, setResult] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const advanceQuestion = useCallback(() => {
    clearTimer();
    setTimeLeft(TIME_PER_QUESTION);
    if (currentIndex < TOTAL - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      finishTest();
    }
  }, [currentIndex]);

  useEffect(() => {
    if (phase !== 'active' || questions.length === 0) return;
    setTimeLeft(TIME_PER_QUESTION);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => {
      clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [phase, currentIndex, questions.length]);

  useEffect(() => {
    if (phase !== 'active' || timeLeft > 0) return;
    advanceQuestion();
  }, [timeLeft, phase]);

  const [aiThinking, setAiThinking] = useState(false);

  const startTest = async () => {
    setLoading(true);
    try {
      const data = await freeTestService.start();
      setQuestions(data.questions);
      setAttemptId(data.attemptId);
      setAnswers({});
      setCurrentIndex(0);
      setResult(null);
      setPhase('active');
    } catch (err) {
      alert(t('freeTest.failedStart') + ': ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAiAnswerAll = async () => {
    setAiThinking(true);
    try {
      const result = await aiAnswerService.answerQuestions(questions);
      const newAnswers = {};
      result.forEach(({ index, answer }) => {
        const q = questions[index];
        if (q && answer && ['a', 'b', 'c', 'd'].includes(answer.toLowerCase())) {
          newAnswers[q.id] = answer.toLowerCase();
        }
      });
      setAnswers((prev) => ({ ...prev, ...newAnswers }));
      toast.success(`AI answered ${Object.keys(newAnswers).length} questions`);
      clearTimer();
      setTimeout(() => finishTest(), 500);
    } catch (error) {
      toast.error('AI failed to answer: ' + (error.response?.data?.message || error.message));
    } finally {
      setAiThinking(false);
    }
  };

  const selectAnswer = (questionId, option) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
    clearTimer();
    if (currentIndex < TOTAL - 1) {
      setTimeout(() => setCurrentIndex(i => i + 1), 300);
    } else {
      setTimeout(() => finishTest(), 500);
    }
  };

  const finishTest = async () => {
    clearTimer();
    setLoading(true);
    try {
      const answerList = questions.map(q => ({
        questionId: q.id,
        selected: answers[q.id] || null
      }));
      const data = await freeTestService.submit(attemptId, answerList);
      setResult(data);
      setPhase('reviewing');
    } catch (err) {
      alert(t('freeTest.failedSubmit') + ': ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await freeTestService.history();
      setHistoryData(data);
      setPhase('history');
    } catch (err) {
      alert(t('freeTest.failedLoadHistory'));
    } finally {
      setLoading(false);
    }
  };

  const currentQ = questions[currentIndex];
  const progress = currentIndex + 1;

  if (phase === 'start') {
    return (
      <>
        <Helmet><title>{t('freeTest.pageTitle')}</title></Helmet>
        <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'rgb(var(--bg-page))' }}>
          <div className="dash-card p-8 sm:p-12 max-w-lg w-full text-center animate-fade-in">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgb(99 102 241 / 0.1)' }}
            >
              <FiBarChart2 size={28} style={{ color: 'rgb(var(--input-focus))' }} />
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'rgb(var(--text-primary))' }}>{t('freeTest.title')}</h1>
            <p className="mb-6" style={{ color: 'rgb(var(--text-secondary))' }}>{t('freeTest.subtitle')}</p>
            <div
              className="rounded-xl p-4 mb-6 text-left space-y-2 text-sm"
              style={{
                background: 'rgb(var(--surface-elevated))',
                color: 'rgb(var(--text-secondary))',
              }}
            >
              <div className="flex items-center gap-2"><FiCheckCircle className="text-green-500 shrink-0" size={16} /><span>{t('freeTest.questionsPerTest')}</span></div>
              <div className="flex items-center gap-2"><FiClock className="text-amber-500 shrink-0" size={16} /><span>{t('freeTest.secondsPerQuestion')}</span></div>
              <div className="flex items-center gap-2"><FiBarChart2 className="text-blue-500 shrink-0" size={16} /><span>{t('freeTest.passMark')}</span></div>
              <div className="flex items-center gap-2"><FiRefreshCw className="text-purple-500 shrink-0" size={16} /><span>{t('freeTest.differentQuestions')}</span></div>
            </div>
            <button onClick={startTest} disabled={loading} className="btn-primary w-full py-3 text-lg">
              {loading ? t('freeTest.preparing') : t('freeTest.startTest')}
            </button>
            <button onClick={loadHistory} className="mt-3 text-sm btn-ghost" style={{ color: 'rgb(var(--input-focus))' }}>
              {t('freeTest.viewPastResults')}
            </button>
          </div>
        </div>
      </>
    );
  }

  if (phase === 'active' && currentQ) {
    const timerPercent = (timeLeft / TIME_PER_QUESTION) * 100;
    const timerColor = timeLeft <= 10 ? 'bg-red-500' : timeLeft <= 20 ? 'bg-amber-500' : 'bg-indigo-500';

    return (
      <>
        <Helmet><title>Question {progress}/{TOTAL} - Free Test</title></Helmet>
        <div className="min-h-screen flex flex-col" style={{ background: 'rgb(var(--bg-page))' }}>
          {/* Top Bar */}
          <div
            className="px-4 py-3"
            style={{
              background: 'rgb(var(--card-bg))',
              borderBottom: '1px solid rgb(var(--border))',
              boxShadow: '0 1px 3px rgb(0 0 0 / 0.06)',
            }}
          >
            <div className="max-w-3xl mx-auto flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>{t('freeTest.questionXofY', { x: progress, y: TOTAL })}</span>
              <div className="flex items-center gap-3">
                <button onClick={handleAiAnswerAll} disabled={aiThinking} className="btn-ghost text-xs px-3 py-1.5" style={{ color: 'rgb(var(--input-focus))' }}>
                  <FiCpu className={aiThinking ? 'animate-pulse' : ''} size={14} />
                  {aiThinking ? t('freeTest.aiThinking') : t('freeTest.aiAnswerAll')}
                </button>
                <div className="flex items-center gap-2">
                  <FiClock size={16} className={timeLeft <= 10 ? 'text-red-500' : 'text-indigo-400'} />
                  <span className={`font-mono font-bold ${timeLeft <= 10 ? 'text-red-500' : ''}`} style={timeLeft > 10 ? { color: 'rgb(var(--text-primary))' } : undefined}>{timeLeft}s</span>
                </div>
              </div>
            </div>
            <div className="max-w-3xl mx-auto mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgb(var(--border))' }}>
              <div className={`h-full ${timerColor} transition-all duration-1000 rounded-full`}
                style={{ width: `${timerPercent}%` }} />
            </div>
          </div>

          {/* Question */}
          <div className="flex-1 flex items-center justify-center px-4 py-8">
            <div className="dash-card p-6 sm:p-10 max-w-3xl w-full animate-slide-up" style={{ cursor: 'default' }}>
              <div className="flex gap-1 sm:gap-2 mb-6 overflow-x-auto pb-1">
                {Array.from({ length: TOTAL }).map((_, i) => (
                  <div
                    key={i}
                    className="h-1.5 sm:h-2 flex-1 rounded-full transition-colors"
                    style={{
                      background: i < currentIndex
                        ? 'rgb(var(--input-focus))'
                        : i === currentIndex
                        ? 'rgb(var(--input-focus) / 0.5)'
                        : 'rgb(var(--border))',
                    }}
                  />
                ))}
              </div>

              <h2 className="text-lg sm:text-xl font-semibold mb-6 leading-relaxed" style={{ color: 'rgb(var(--text-primary))' }}>
                {currentQ.question_text}
              </h2>

              <div className="space-y-3">
                {(['option_a', 'option_b', 'option_c', 'option_d']).map((key, idx) => {
                  const letter = String.fromCharCode(97 + idx);
                  const text = currentQ[key];
                  const selected = answers[currentQ.id] === letter;
                  const isDisabled = answers[currentQ.id] != null;
                  return (
                    <button
                      key={key}
                      onClick={() => selectAnswer(currentQ.id, letter)}
                      disabled={isDisabled}
                      className="w-full text-left p-3 sm:p-4 rounded-xl border-2 transition-all duration-200"
                      style={{
                        borderColor: selected ? 'rgb(var(--input-focus))' : 'rgb(var(--border))',
                        background: selected
                          ? 'rgb(99 102 241 / 0.06)'
                          : isDisabled
                          ? 'rgb(var(--surface-elevated))'
                          : 'rgb(var(--card-bg))',
                        opacity: !selected && isDisabled ? 0.5 : 1,
                      }}
                      onMouseEnter={e => {
                        if (!isDisabled) {
                          e.currentTarget.style.borderColor = 'rgb(var(--input-focus) / 0.5)';
                          e.currentTarget.style.background = 'rgb(99 102 241 / 0.03)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isDisabled && !selected) {
                          e.currentTarget.style.borderColor = 'rgb(var(--border))';
                          e.currentTarget.style.background = 'rgb(var(--card-bg))';
                        }
                      }}
                    >
                      <span
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg mr-3 font-bold text-sm"
                        style={selected
                          ? { background: 'rgb(var(--input-focus))', color: '#fff' }
                          : { background: 'rgb(var(--surface-elevated))', color: 'rgb(var(--text-secondary))' }
                        }
                      >
                        {letter.toUpperCase()}
                      </span>
                      <span style={{ color: 'rgb(var(--text-primary))' }}>{text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (phase === 'reviewing' && result) {
    const passed = result.passed;
    return (
      <>
        <Helmet><title>{t('freeTest.pageTitle')}</title></Helmet>
        <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: 'rgb(var(--bg-page))' }}>
          <div className="dash-card p-8 sm:p-12 max-w-2xl w-full animate-fade-in">
            <div className="text-center mb-8">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${passed ? 'bg-green-100 dark:bg-green-900/40' : 'bg-red-100 dark:bg-red-900/40'}`}
              >
                {passed ? <FiCheckCircle className="text-green-500" size={40} /> : <FiXCircle className="text-red-500" size={40} />}
              </div>
              <h1 className={`text-3xl font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}>
                {passed ? t('freeTest.passed') : t('freeTest.failed')}
              </h1>
              <p style={{ color: 'rgb(var(--text-secondary))' }} className="mt-1">{passed ? t('freeTest.passedMsg') : t('freeTest.failedMsg')}</p>
            </div>

            <div className="flex justify-center gap-4 sm:gap-8 mb-8">
              <div className="text-center">
                <div className="text-4xl font-bold" style={{ color: 'rgb(var(--input-focus))' }}>{result.score}</div>
                <div className="text-sm" style={{ color: 'rgb(var(--text-tertiary))' }}>{t('common.correct')}</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold" style={{ color: 'rgb(var(--text-tertiary))' }}>{result.total - result.score}</div>
                <div className="text-sm" style={{ color: 'rgb(var(--text-tertiary))' }}>{t('common.wrong')}</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>{result.total}</div>
                <div className="text-sm" style={{ color: 'rgb(var(--text-tertiary))' }}>{t('common.total')}</div>
              </div>
            </div>

            <div className="mb-6">
              <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgb(var(--border))' }}>
                <div className={`h-full rounded-full transition-all ${passed ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${(result.score / result.total) * 100}%` }} />
              </div>
              <div className="flex justify-between mt-1 text-xs" style={{ color: 'rgb(var(--text-tertiary))' }}>
                <span>0</span>
                <span className="font-semibold">Pass: 12</span>
                <span>{result.total}</span>
              </div>
            </div>

            <div className="space-y-3 mb-8 max-h-96 overflow-y-auto">
              {result.details?.map((d, i) => {
                const correct = d.selected_answer?.toLowerCase() === d.correct_answer?.toLowerCase();
                const opts = [
                  { l: 'a', t: d.option_a },
                  { l: 'b', t: d.option_b },
                  { l: 'c', t: d.option_c },
                  { l: 'd', t: d.option_d }
                ];
                return (
                  <div
                    key={i}
                    className="p-4 rounded-xl"
                    style={{
                      border: `1px solid ${correct ? 'rgb(34 197 94 / 0.3)' : 'rgb(239 68 68 / 0.3)'}`,
                      background: correct ? 'rgb(34 197 94 / 0.04)' : 'rgb(239 68 68 / 0.04)',
                    }}
                  >
                    <p className="text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>{i + 1}. {d.question_text}</p>
                    {opts.map(o => {
                      const isSelected = o.l === d.selected_answer;
                      const isCorrect = o.l === d.correct_answer;
                      let style = { border: '1px solid rgb(var(--border))', color: 'rgb(var(--text-secondary))' };
                      if (isCorrect) style = { border: '1px solid rgb(34 197 94 / 0.4)', background: 'rgb(34 197 94 / 0.06)', color: 'rgb(34 197 94)' };
                      else if (isSelected && !isCorrect) style = { border: '1px solid rgb(239 68 68 / 0.4)', background: 'rgb(239 68 68 / 0.06)', color: 'rgb(239 68 68)' };
                      return (
                        <div key={o.l} className="text-xs px-3 py-1.5 rounded-lg mb-1" style={style}>
                          {o.l.toUpperCase()}. {o.t}
                          {isCorrect && <FiCheckCircle className="inline ml-1" size={12} />}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button onClick={startTest} className="btn-primary flex-1 py-3">
                {t('freeTest.tryAgain')}
              </button>
              <button onClick={loadHistory} className="btn-secondary px-6 py-3">
                {t('freeTest.history')}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (phase === 'history') {
    return (
      <>
        <Helmet><title>{t('freeTest.testHistory')}</title></Helmet>
        <div className="min-h-screen px-4 py-8" style={{ background: 'rgb(var(--bg-page))' }}>
          <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>{t('freeTest.testHistory')}</h1>
              <button onClick={() => setPhase('start')} className="btn-ghost" style={{ color: 'rgb(var(--input-focus))' }}>{t('freeTest.back')}</button>
            </div>
            {historyData.length === 0 ? (
              <div className="text-center py-12" style={{ color: 'rgb(var(--text-tertiary))' }}>{t('freeTest.noTestsYet')}</div>
            ) : (
              <div className="space-y-3 animate-stagger">
                {historyData.map(h => (
                  <div key={h.id} className="dash-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <span className={`badge ${h.passed ? 'badge-success' : 'badge-danger'}`}>
                        {h.passed ? 'Passed' : 'Failed'}
                      </span>
                      <span className="text-sm ml-3" style={{ color: 'rgb(var(--text-tertiary))' }}>{new Date(h.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold" style={{ color: 'rgb(var(--text-primary))' }}>{h.score}/{h.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button onClick={startTest} className="btn-primary mt-6 w-full py-3">
              {t('freeTest.startNewTest')}
            </button>
          </div>
        </div>
      </>
    );
  }

  return null;
}

export default FreeTest;
