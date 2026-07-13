import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import aiAnswerService from '../../services/aiAnswerService';
import toast from 'react-hot-toast';
import {
  FiCpu, FiSend, FiCheckCircle, FiXCircle, FiBookOpen, FiAlertTriangle,
  FiShield, FiHelpCircle, FiRefreshCw, FiArrowRight
} from 'react-icons/fi';

function AiSolve() {
  const { t } = useTranslation();
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState({ a: '', b: '', c: '', d: '' });
  const [hasOptions, setHasOptions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleOptionChange = (key, value) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleSolve = async (e) => {
    e.preventDefault();
    if (!questionText.trim()) {
      toast.error(t('aiSolve.enterQuestion'));
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const data = await aiAnswerService.solveQuestion({
        question_text: questionText,
        ...(hasOptions ? options : {}),
      });
      setResult(data);
    } catch (err) {
      toast.error(err.response?.data?.message || t('aiSolve.failedToSolve'));
    } finally {
      setLoading(false);
    }
  };

  const handleNewQuestion = () => {
    setResult(null);
    setQuestionText('');
    setOptions({ a: '', b: '', c: '', d: '' });
  };

  const exampleQuestions = [
    'What does a red octagonal sign mean?',
    'What is the proper following distance?',
    'When should you use your turn signals?',
    'At what BAC is it illegal to drive?',
  ];

  return (
    <>
      <Helmet><title>{t('aiSolve.pageTitle')}</title></Helmet>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
              <FiCpu className="text-primary-600" size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('aiSolve.title')}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('aiSolve.subtitle')}</p>
            </div>
          </div>
          {result && (
            <button onClick={handleNewQuestion}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <FiRefreshCw size={16} /> {t('aiSolve.newQuestion')}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {!result ? (
              <form onSubmit={handleSolve} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/50 border dark:border-gray-700 p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('aiSolve.yourQuestion')}</label>
                  <textarea
                    value={questionText}
                    onChange={e => setQuestionText(e.target.value)}
                    placeholder={t('aiSolve.questionPlaceholder')}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none text-sm dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="hasOptions"
                    checked={hasOptions}
                    onChange={e => setHasOptions(e.target.checked)}
                    className="rounded text-primary-600"
                  />
                  <label htmlFor="hasOptions" className="text-sm text-gray-600 dark:text-gray-300">{t('aiSolve.multipleChoice')}</label>
                </div>

                {hasOptions && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {['a', 'b', 'c', 'd'].map(key => (
                      <div key={key}>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('aiSolve.option', { letter: key.toUpperCase() })}</label>
                        <input
                          type="text"
                          value={options[key]}
                          onChange={e => handleOptionChange(key, e.target.value)}
                          placeholder={t('aiSolve.option', { letter: key.toUpperCase() })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm dark:bg-gray-700 dark:text-gray-100"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <button type="submit" disabled={loading || !questionText.trim()}
                  className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                  {loading ? (
                    <><div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> {t('aiSolve.solving')}</>
                  ) : (
                    <><FiSend size={16} /> {t('aiSolve.solveBtn')}</>
                  )}
                </button>
              </form>
            ) : (
              /* Teaching Result */
              <div className="space-y-5">
                {/* Answer Header */}
                {result.answer && (
                  <div className={`rounded-xl p-5 border-2 ${result.from_book ? 'bg-green-50 dark:bg-green-950 border-green-300 dark:border-green-700' : 'bg-amber-50 dark:bg-amber-950 border-amber-300 dark:border-amber-700'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {result.from_book
                        ? <FiBookOpen className="text-green-600" size={20} />
                        : <FiAlertTriangle className="text-amber-600" size={20} />
                      }
                      <span className={`text-xs font-semibold uppercase tracking-wide ${result.from_book ? 'text-green-700' : 'text-amber-700'}`}>
                        {result.from_book ? t('aiSolve.fromBook') : t('aiSolve.generalKnowledge')}
                      </span>
                    </div>
                    <p className="text-xl font-bold text-gray-900 mt-1">
                      {result.answer}
                    </p>
                    {result.from_book === false && (
                      <p className="text-xs text-amber-700 mt-2">
                        {t('aiSolve.notFoundInBook')}
                      </p>
                    )}
                  </div>
                )}

                {/* Topic & Source */}
                <div className="flex flex-wrap gap-3">
                  {result.topic && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium border border-primary-200 dark:border-primary-800">
                      <FiBookOpen size={14} /> {result.topic}
                    </span>
                  )}
                  {result.source && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm border border-gray-200 dark:border-gray-600">
                      {result.source}
                    </span>
                  )}
                </div>

                {/* Full Explanation */}
                {result.explanation && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/50 border dark:border-gray-700 p-6">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                      <FiBookOpen size={18} className="text-primary-500" /> {t('aiSolve.teachingExplanation')}
                    </h3>
                    <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                      {result.explanation}
                    </div>
                  </div>
                )}

                {/* Option Analysis for Multiple Choice */}
                {result.option_analysis && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/50 border dark:border-gray-700 p-6">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                      <FiHelpCircle size={18} className="text-primary-500" /> {t('aiSolve.optionAnalysis')}
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(result.option_analysis).map(([key, val]) => (
                        <div key={key} className={`flex items-start gap-3 p-4 rounded-lg border ${
                          val.is_correct
                            ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                            : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
                        }`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            val.is_correct ? 'bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-200' : 'bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-200'
                          }`}>
                            {val.is_correct ? <FiCheckCircle size={16} /> : <FiXCircle size={16} />}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`font-bold uppercase text-sm ${val.is_correct ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                                {t('aiSolve.option', { letter: key.toUpperCase() })}
                              </span>
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                val.is_correct
                                  ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200'
                                  : 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200'
                              }`}>
                                {val.is_correct ? t('aiSolve.correct') : t('aiSolve.incorrect')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-200">{val.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rule Reference */}
                {result.rule_reference && (
                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1 flex items-center gap-1.5">
                      <FiBookOpen size={14} /> {t('aiSolve.ruleReference')}
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">{result.rule_reference}</p>
                  </div>
                )}

                {/* Practical Example */}
                {result.practical_example && (
                  <div className="bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-purple-800 dark:text-purple-200 mb-1 flex items-center gap-1.5">
                      <FiArrowRight size={14} /> {t('aiSolve.practicalExample')}
                    </h4>
                    <p className="text-sm text-purple-700 dark:text-purple-300 whitespace-pre-wrap">{result.practical_example}</p>
                  </div>
                )}

                {/* Safety Tip */}
                {result.safety_tip && (
                  <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-1 flex items-center gap-1.5">
                      <FiShield size={14} /> {t('aiSolve.safetyTip')}
                    </h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300">{result.safety_tip}</p>
                  </div>
                )}

                {/* Key Points */}
                {result.key_points && result.key_points.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/50 border dark:border-gray-700 p-5">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-1.5">
                      <FiBookOpen size={14} /> {t('aiSolve.keyPoints')}
                    </h4>
                    <ul className="space-y-2">
                      {result.key_points.map((point, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <span className="w-5 h-5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Practice Question */}
                {result.practice_question && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/50 border dark:border-gray-700 p-5">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-1.5">
                      <FiHelpCircle size={14} /> {t('aiSolve.practiceQuestion')}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                      {result.practice_question}
                    </p>
                  </div>
                )}

                {/* Book Sources */}
                {result.sources && result.sources.length > 0 && (
                  <div className="text-xs text-gray-400 dark:text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <p className="font-medium text-gray-500 dark:text-gray-400 mb-1">{t('aiSolve.sources')}</p>
                    {result.sources.map((s, i) => (
                      <p key={i} className="truncate">📖 {s.title}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/50 border dark:border-gray-700 p-6">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">{t('aiSolve.exampleQuestions')}</h3>
              <div className="space-y-2">
                {exampleQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setQuestionText(q)}
                    className="w-full text-left text-sm px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary-50 dark:from-primary-900/30 to-primary-100 dark:to-primary-800/30 border border-primary-200 dark:border-primary-800 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <FiCpu className="text-primary-500 mt-0.5 shrink-0" size={20} />
                <div>
                  <h4 className="text-sm font-semibold text-primary-800 dark:text-primary-200">{t('aiSolve.howItWorks')}</h4>
                  <p className="text-xs text-primary-700 dark:text-primary-300 mt-1 leading-relaxed">
                    {t('aiSolve.howItWorksDesc')}
                  </p>
                  <ul className="text-xs text-primary-700 dark:text-primary-300 mt-2 space-y-1.5">
                    {t('aiSolve.howItWorksSteps', { returnObjects: true }).map((step, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <FiCheckCircle size={12} className="mt-0.5 shrink-0" />
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {!result && (
              <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <FiAlertTriangle className="text-amber-500 mt-0.5 shrink-0" size={16} />
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    {t('aiSolve.uploadReminder')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default AiSolve;
