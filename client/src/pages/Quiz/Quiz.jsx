import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import quizService from '../../services/quizService';
import QuizCard from '../../components/QuizCard/QuizCard';
import toast from 'react-hot-toast';
import { FiCpu } from 'react-icons/fi';
import aiAnswerService from '../../services/aiAnswerService';
import { useTranslation } from 'react-i18next';

function Quiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [step, setStep] = useState('list');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timer, setTimer] = useState(0);
  const [aiThinking, setAiThinking] = useState(false);

  useEffect(() => {
    if (id) {
      startQuiz(id);
    } else {
      loadQuizzes();
    }
  }, [id]);

  useEffect(() => {
    if (step === 'taking' && currentQuiz?.time_limit) {
      const interval = setInterval(() => setTimer((t) => t + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [step, currentQuiz?.time_limit]);

  const loadQuizzes = async () => {
    try {
      const data = await quizService.getAll(true);
      setQuizzes(data);
    } catch (error) {
      toast.error(t('quiz.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async (quizId) => {
    setLoading(true);
    try {
      const data = await quizService.start(quizId);
      setCurrentQuiz(data.quiz);
      setQuestions(data.questions);
      setStep('taking');
    } catch (error) {
      toast.error(error.response?.data?.message || t('quiz.cannotStartQuiz'));
      navigate('/quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionIndex, answer) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: answer }));
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
      toast.success(t('quiz.aiAnswered', { count: Object.keys(newAnswers).length }));
    } catch (error) {
      toast.error(t('quiz.aiFailed', { message: error.response?.data?.message || error.message }));
    } finally {
      setAiThinking(false);
    }
  };

  const handleSubmit = async () => {
    const unanswered = questions.filter((_, i) => !answers[i]);
    if (unanswered.length > 0) {
      toast.error(t('quiz.pleaseAnswerAll', { count: unanswered.length }));
      return;
    }
    setSubmitting(true);
    try {
      const answerArray = questions.map((_, i) => answers[i]);
      const data = await quizService.submit(currentQuiz.id, answerArray, timer);
      setResult(data);
      setStep('result');
    } catch (error) {
      toast.error(error.response?.data?.message || t('quiz.submissionFailed'));
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
        <Helmet><title>{t('quiz.pageTitle')}</title></Helmet>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-fade-in">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>{t('quiz.title')}</h1>
            <p className="mt-1.5 text-sm sm:text-base" style={{ color: 'rgb(var(--text-secondary))' }}>{t('quiz.subtitle')}</p>
          </div>
          {quizzes.length === 0 ? (
            <div className="dash-card p-12 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4" style={{ background: 'rgb(var(--surface-elevated))' }}>
                <svg className="w-7 h-7" style={{ color: 'rgb(var(--text-tertiary))' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              </div>
              <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>{t('quiz.noQuizzes')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 animate-stagger">
              {quizzes.map((quiz) => <QuizCard key={quiz.id} quiz={quiz} />)}
            </div>
          )}
        </div>
      </>
    );
  }

  if (step === 'result') {
    const answeredCount = result.correctCount + result.wrongCount;
    return (
      <>
        <Helmet><title>{t('quiz.pageTitle')}</title></Helmet>
        <div className="max-w-lg mx-auto px-4 sm:px-6 py-8 sm:py-16 animate-fade-in">
          <div className="dash-card p-6 sm:p-10 text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-5 ${result.passed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
              <span className="text-3xl">{result.passed ? '\u{1F3C6}' : '\u{1F4AA}'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-1.5" style={{ color: 'rgb(var(--text-primary))' }}>
              {result.passed ? t('quiz.congratulations') : t('quiz.keepTrying')}
            </h2>
            <p className="text-sm mb-8" style={{ color: 'rgb(var(--text-secondary))' }}>
              {result.passed ? t('quiz.passed') : t('quiz.failed')}
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

            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => navigate('/quiz')} className="btn-primary flex-1">
                {t('quiz.backToQuizzes')}
              </button>
              <button onClick={() => startQuiz(currentQuiz.id)} className="btn-secondary flex-1">
                {t('quiz.tryAgain')}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  return (
    <>
      <Helmet><title>{currentQuiz?.title} - Road Rules</title></Helmet>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-fade-in">
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold truncate" style={{ color: 'rgb(var(--text-primary))' }}>{currentQuiz?.title}</h1>
            <p className="text-xs mt-0.5" style={{ color: 'rgb(var(--text-tertiary))' }}>{t('quiz.attempt', { number: currentQuiz?.attempt_number })}</p>
          </div>
          {currentQuiz?.time_limit && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-mono font-semibold flex-shrink-0 ${
              currentQuiz.time_limit && timer > currentQuiz.time_limit * 0.8
                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                : ''
            }`} style={
              !(currentQuiz.time_limit && timer > currentQuiz.time_limit * 0.8)
                ? { background: 'rgb(var(--surface-elevated))', color: 'rgb(var(--text-primary))' }
                : undefined
            }>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {formatTime(timer)}
            </div>
          )}
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
            {aiThinking ? t('quiz.aiThinking') : t('quiz.aiAutoAnswer')}
          </button>
          <button onClick={handleSubmit} disabled={submitting}
            className="btn-primary flex-1 py-3">
            {submitting ? t('common.submitting') : t('quiz.submitAnswers')}
          </button>
        </div>
      </div>
    </>
  );
}

export default Quiz;
