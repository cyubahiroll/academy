import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import authService from '../../services/authService';
import { FiCheckCircle, FiXCircle, FiBarChart2 } from 'react-icons/fi';

function Results() {
  const { t } = useTranslation();
  const [quizResults, setQuizResults] = useState([]);
  const [examResults, setExamResults] = useState([]);
  const [tab, setTab] = useState('quiz');
  const [loading, setLoading] = useState(true);

  const API_URL = '/api';
  const getHeaders = () => ({ headers: { Authorization: `Bearer ${authService.getToken()}` } });

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      const [quizRes, examRes] = await Promise.all([
        axios.get(`${API_URL}/quiz-results`, getHeaders()),
        axios.get(`${API_URL}/exam-results`, getHeaders())
      ]);
      setQuizResults(Array.isArray(quizRes.data) ? quizRes.data : []);
      setExamResults(Array.isArray(examRes.data) ? examRes.data : []);
    } catch (error) {
      console.error('Failed to load results:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: 'rgb(var(--border))', borderTopColor: 'rgb(var(--text-primary))' }} />
      </div>
    );
  }

  return (
    <>
      <Helmet><title>{t('results.pageTitle')}</title></Helmet>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-1" style={{ color: 'rgb(var(--text-primary))' }}>{t('results.title')}</h1>
          <p style={{ color: 'rgb(var(--text-secondary))' }}>{t('results.subtitle')}</p>
        </div>

        <div className="flex gap-1 p-1 mb-6 w-fit rounded-xl" style={{ background: 'rgb(var(--surface-elevated))' }}>
          <button
            onClick={() => setTab('quiz')}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              tab === 'quiz' ? 'btn-primary shadow-sm' : 'btn-ghost'
            }`}
          >
            <span className="flex items-center gap-2">
              <FiBarChart2 className="w-4 h-4" />
              {t('results.quizResults')}
            </span>
          </button>
          <button
            onClick={() => setTab('exam')}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              tab === 'exam' ? 'btn-primary shadow-sm' : 'btn-ghost'
            }`}
          >
            <span className="flex items-center gap-2">
              <FiBarChart2 className="w-4 h-4" />
              {t('results.examResults')}
            </span>
          </button>
        </div>

        {tab === 'quiz' && (
          <div className="dash-card overflow-x-auto animate-fade-in">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgb(var(--border))' }}>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgb(var(--text-tertiary))' }}>{t('results.quiz')}</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgb(var(--text-tertiary))' }}>{t('results.score')}</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgb(var(--text-tertiary))' }}>{t('results.result')}</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgb(var(--text-tertiary))' }}>{t('results.date')}</th>
                </tr>
              </thead>
              <tbody>
                {quizResults.map((result) => (
                  <tr key={result.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50" style={{ borderBottom: '1px solid rgb(var(--border))' }}>
                    <td className="px-6 py-4 text-sm font-medium" style={{ color: 'rgb(var(--text-primary))' }}>{result.title}</td>
                    <td className="px-6 py-4 text-center text-sm font-semibold" style={{ color: 'rgb(var(--text-primary))' }}>{result.score}%</td>
                    <td className="px-6 py-4 text-center">
                      {result.passed
                        ? <span className="badge-success inline-flex items-center gap-1 text-sm">{<FiCheckCircle className="w-3.5 h-3.5" />} {t('results.passed')}</span>
                        : <span className="badge-danger inline-flex items-center gap-1 text-sm">{<FiXCircle className="w-3.5 h-3.5" />} {t('results.failed')}</span>
                      }
                    </td>
                    <td className="px-6 py-4 text-right text-sm" style={{ color: 'rgb(var(--text-tertiary))' }}>
                      {new Date(result.completed_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {quizResults.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center" style={{ color: 'rgb(var(--text-tertiary))' }}>
                      <FiBarChart2 className="w-8 h-8 mx-auto mb-3 opacity-40" />
                      <p>{t('results.noQuizResults')}</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'exam' && (
          <div className="dash-card overflow-x-auto animate-fade-in">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgb(var(--border))' }}>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgb(var(--text-tertiary))' }}>{t('results.exam')}</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgb(var(--text-tertiary))' }}>{t('results.score')}</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgb(var(--text-tertiary))' }}>{t('results.result')}</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgb(var(--text-tertiary))' }}>{t('results.date')}</th>
                </tr>
              </thead>
              <tbody>
                {examResults.map((result) => (
                  <tr key={result.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50" style={{ borderBottom: '1px solid rgb(var(--border))' }}>
                    <td className="px-6 py-4 text-sm font-medium" style={{ color: 'rgb(var(--text-primary))' }}>{result.title}</td>
                    <td className="px-6 py-4 text-center text-sm font-semibold" style={{ color: 'rgb(var(--text-primary))' }}>{result.score}%</td>
                    <td className="px-6 py-4 text-center">
                      {result.passed
                        ? <span className="badge-success inline-flex items-center gap-1 text-sm">{<FiCheckCircle className="w-3.5 h-3.5" />} {t('results.passed')}</span>
                        : <span className="badge-danger inline-flex items-center gap-1 text-sm">{<FiXCircle className="w-3.5 h-3.5" />} {t('results.failed')}</span>
                      }
                    </td>
                    <td className="px-6 py-4 text-right text-sm" style={{ color: 'rgb(var(--text-tertiary))' }}>
                      {new Date(result.completed_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {examResults.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center" style={{ color: 'rgb(var(--text-tertiary))' }}>
                      <FiBarChart2 className="w-8 h-8 mx-auto mb-3 opacity-40" />
                      <p>{t('results.noExamResults')}</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

export default Results;
