import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import authService from '../../services/authService';
import toast from 'react-hot-toast';
import { FiCpu } from 'react-icons/fi';
import aiAnswerService from '../../services/aiAnswerService';
import { useTranslation } from 'react-i18next';

function Exam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [exams, setExams] = useState([]);
  const [currentExam, setCurrentExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [step, setStep] = useState('list');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timer, setTimer] = useState(0);
  const [aiThinking, setAiThinking] = useState(false);

  const API_URL = '/api/exams';
  const getHeaders = () => ({ headers: { Authorization: `Bearer ${authService.getToken()}` } });

  useEffect(() => {
    if (id) {
      startExam(id);
    } else {
      loadExams();
    }
  }, [id]);

  useEffect(() => {
    if (step === 'taking' && currentExam?.time_limit) {
      const interval = setInterval(() => setTimer((t) => t + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [step, currentExam?.time_limit]);

  const loadExams = async () => {
    try {
      const { data } = await axios.get(API_URL);
      setExams(data);
    } catch (error) {
      toast.error(t('exam.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  const startExam = async (examId) => {
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/${examId}/start`, {}, getHeaders());
      setCurrentExam(data.exam);
      setQuestions(data.questions);
      setStep('taking');
    } catch (error) {
      toast.error(error.response?.data?.message || t('exam.cannotStartExam'));
      navigate('/exam');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (index, answer) => {
    setAnswers((prev) => ({ ...prev, [index]: answer }));
  };

  const handleAiAnswer = async () => {
    setAiThinking(true);
    try {
      const result = await aiAnswerService.answerQuestions(questions);
      const newAnswers = {};
      result.forEach(({ index, answer }) => {
        if (answer && ['a', 'b', 'c', 'd'].includes(answer.toLowerCase())) {
          newAnswers[index] = answer.toLowerCase();
        }
      });
      setAnswers((prev) => ({ ...prev, ...newAnswers }));
      toast.success(`AI answered ${Object.keys(newAnswers).length} questions`);
    } catch (error) {
      toast.error('AI failed to answer: ' + (error.response?.data?.message || error.message));
    } finally {
      setAiThinking(false);
    }
  };

  const handleSubmit = async () => {
    const unanswered = questions.filter((_, i) => !answers[i]);
    if (unanswered.length > 0) {
      toast.error(`Please answer all questions (${unanswered.length} remaining)`);
      return;
    }
    setSubmitting(true);
    try {
      const answerArray = questions.map((_, i) => answers[i]);
      const { data } = await axios.post(`${API_URL}/${currentExam.id}/submit`,
        { answers: answerArray, time_taken: timer }, getHeaders());
      setResult(data);
      setStep('result');
    } catch (error) {
      toast.error(error.response?.data?.message || t('exam.submissionFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-t-[rgb(var(--input-focus))] border-[rgb(var(--border))] rounded-full animate-spin" />
          <span className="text-sm" style={{ color: 'rgb(var(--text-tertiary))' }}>{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  if (step === 'list') {
    return (
      <>
        <Helmet><title>{t('exam.pageTitle')}</title></Helmet>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-fade-in">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>{t('exam.title')}</h1>
            <p className="mt-1.5 text-sm sm:text-base" style={{ color: 'rgb(var(--text-secondary))' }}>{t('exam.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 animate-stagger">
            {exams.map((exam) => (
              <div key={exam.id} className="dash-card p-5 sm:p-6 flex flex-col">
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="text-base sm:text-lg font-semibold" style={{ color: 'rgb(var(--text-primary))' }}>{exam.title}</h3>
                    {exam.price > 0 && (
                      <span className="badge-info whitespace-nowrap text-xs">UGX {exam.price.toLocaleString()}</span>
                    )}
                  </div>
                  <p className="text-sm mb-4 line-clamp-2" style={{ color: 'rgb(var(--text-secondary))' }}>{exam.description}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs mb-5" style={{ color: 'rgb(var(--text-tertiary))' }}>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {t('exam.pass', { score: exam.pass_score })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {t('exam.timeLimit', { time: exam.time_limit })}
                    </span>
                  </div>
                </div>
                <button onClick={() => startExam(exam.id)} className="btn-primary w-full">
                  {t('exam.startExam')}
                </button>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (step === 'result') {
    const answeredCount = result.correctCount + result.wrongCount;
    return (
      <>
        <Helmet><title>{t('exam.pageTitle')}</title></Helmet>
        <div className="max-w-lg mx-auto px-4 sm:px-6 py-8 sm:py-16 animate-fade-in">
          <div className="dash-card p-6 sm:p-10 text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-5 ${result.passed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
              <span className="text-3xl">{result.passed ? '\u{1F3C6}' : '\u{1F4AA}'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-1.5" style={{ color: 'rgb(var(--text-primary))' }}>
              {result.passed ? t('exam.examPassed') : t('exam.examFailed')}
            </h2>
            <p className="text-sm mb-8" style={{ color: 'rgb(var(--text-secondary))' }}>
              {currentExam?.title}
            </p>

            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="rounded-xl p-4" style={{ background: 'rgb(var(--surface-elevated))' }}>
                <div className="text-2xl sm:text-3xl font-bold" style={{ color: 'rgb(var(--input-focus))' }}>{result.score}%</div>
                <div className="text-xs mt-1" style={{ color: 'rgb(var(--text-tertiary))' }}>{t('common.score')}</div>
              </div>
              <div className="rounded-xl p-4" style={{ background: 'rgb(var(--surface-elevated))' }}>
                <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">{result.correctCount}</div>
                <div className="text-xs mt-1" style={{ color: 'rgb(var(--text-tertiary))' }}>{t('common.correct')}</div>
              </div>
              <div className="rounded-xl p-4" style={{ background: 'rgb(var(--surface-elevated))' }}>
                <div className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400">{result.wrongCount}</div>
                <div className="text-xs mt-1" style={{ color: 'rgb(var(--text-tertiary))' }}>{t('common.wrong')}</div>
              </div>
            </div>

            <div className="w-full h-2 rounded-full overflow-hidden mb-2" style={{ background: 'rgb(var(--surface-elevated))' }}>
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${result.score}%`,
                  background: result.passed ? '#22c55e' : '#ef4444'
                }}
              />
            </div>
            <p className="text-xs mb-8" style={{ color: 'rgb(var(--text-tertiary))' }}>
              {answeredCount} / {questions.length} {t('common.correct').toLowerCase()}
            </p>

            <button onClick={() => navigate('/exam')} className="btn-primary w-full sm:w-auto">
              {t('exam.backToExams')}
            </button>
          </div>
        </div>
      </>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  return (
    <>
      <Helmet><title>{currentExam?.title} - Road Rules</title></Helmet>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-fade-in">
        <div className="flex items-center justify-between gap-4 mb-2">
          <h1 className="text-lg sm:text-xl font-bold truncate" style={{ color: 'rgb(var(--text-primary))' }}>{currentExam?.title}</h1>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-mono font-semibold ${
              currentExam?.time_limit && timer > currentExam.time_limit * 0.8
                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                : ''
            }`} style={
              !(currentExam?.time_limit && timer > currentExam.time_limit * 0.8)
                ? { background: 'rgb(var(--surface-elevated))', color: 'rgb(var(--text-primary))' }
                : undefined
            }>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {formatTime(timer)}
            </span>
          </div>
        </div>

        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs" style={{ color: 'rgb(var(--text-tertiary))' }}>{answeredCount}/{questions.length}</span>
            <span className="text-xs" style={{ color: 'rgb(var(--text-tertiary))' }}>{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgb(var(--border))' }}>
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: 'rgb(var(--input-focus))' }} />
          </div>
        </div>

        <div className="space-y-4 animate-stagger">
          {questions.map((q, i) => (
            <div key={q.id} className="dash-card p-4 sm:p-6">
              <div className="flex items-start gap-3 mb-4">
                <span className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{
                    background: answers[i] ? 'rgb(var(--input-focus))' : 'rgb(var(--surface-elevated))',
                    color: answers[i] ? '#fff' : 'rgb(var(--text-tertiary))'
                  }}>
                  {i + 1}
                </span>
                <p className="text-sm sm:text-[15px] font-medium pt-0.5" style={{ color: 'rgb(var(--text-primary))' }}>{q.question_text}</p>
              </div>
              <div className="space-y-2 ml-0 sm:ml-10">
                {[
                  { key: 'a', label: q.option_a },
                  { key: 'b', label: q.option_b },
                  q.option_c && { key: 'c', label: q.option_c },
                  q.option_d && { key: 'd', label: q.option_d },
                ].filter(Boolean).map((opt) => {
                  const isSelected = answers[i] === opt.key;
                  return (
                    <label
                      key={opt.key}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-150 ${
                        isSelected
                          ? 'border-[rgb(var(--input-focus))] shadow-sm'
                          : 'hover:shadow-sm'
                      }`}
                      style={{
                        borderColor: isSelected ? undefined : 'rgb(var(--border))',
                        background: isSelected ? 'rgb(99 102 241 / 0.06)' : 'transparent'
                      }}
                    >
                      <span className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected ? 'border-[rgb(var(--input-focus))]' : ''
                      }`} style={!isSelected ? { borderColor: 'rgb(var(--border-strong))' } : undefined}>
                        {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-[rgb(var(--input-focus))]" />}
                      </span>
                      <input type="radio" name={`q${i}`} value={opt.key}
                        checked={isSelected}
                        onChange={() => handleAnswer(i, opt.key)}
                        className="sr-only" />
                      <span className="text-sm" style={{ color: isSelected ? 'rgb(var(--text-primary))' : 'rgb(var(--text-secondary))' }}>
                        <span className="font-semibold">{opt.key.toUpperCase()}.</span> {opt.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
          <button onClick={handleAiAnswer} disabled={aiThinking}
            className="flex-1 py-3 px-5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 disabled:opacity-50">
            <FiCpu className={aiThinking ? 'animate-pulse' : ''} size={18} />
            {aiThinking ? t('exam.aiThinking') : t('exam.aiAutoAnswer')}
          </button>
          <button onClick={handleSubmit} disabled={submitting}
            className="btn-primary flex-1 py-3">
            {submitting ? t('common.submitting') : t('exam.submitAnswers')}
          </button>
        </div>
      </div>
    </>
  );
}

export default Exam;
