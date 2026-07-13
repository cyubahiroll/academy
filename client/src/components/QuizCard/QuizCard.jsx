import { Link } from 'react-router-dom';
import { FiClock, FiBarChart2, FiAward } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const difficultyColors = {
  easy: 'bg-success-100 text-success-700 dark:bg-green-950 dark:text-success-300',
  medium: 'bg-accent-100 text-yellow-700 dark:bg-amber-950 dark:text-yellow-300',
  hard: 'bg-danger-100 text-danger-700 dark:bg-red-950 dark:text-danger-300'
};

function QuizCard({ quiz }) {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700 dark:shadow-gray-900/50">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{quiz.title}</h3>
        <span className={`text-xs font-medium px-3 py-1 rounded-full ${difficultyColors[quiz.difficulty] || difficultyColors.easy}`}>
          {quiz.difficulty}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-4 line-clamp-2 dark:text-gray-300">{quiz.description}</p>
      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 dark:text-gray-400">
        <span className="flex items-center gap-1"><FiClock size={14} /> {t('quizCard.timeLimit', { time: quiz.time_limit || t('common.notAvailable') })}</span>
        <span className="flex items-center gap-1"><FiBarChart2 size={14} /> {t('quizCard.pass', { score: quiz.pass_score })}</span>
        <span className="flex items-center gap-1"><FiAward size={14} /> {t('quizCard.attempts', { count: quiz.attempt_limit })}</span>
      </div>
      <Link
        to={`/quiz/${quiz.id}`}
        className="block text-center py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
      >
        {quiz.is_free ? t('quizCard.startFree') : t('quizCard.premium')}
      </Link>
    </div>
  );
}

export default QuizCard;
