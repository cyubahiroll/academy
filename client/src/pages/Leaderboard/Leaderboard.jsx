import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import authService from '../../services/authService';
import { FiAward, FiTrendingUp } from 'react-icons/fi';

const AVATAR_COLORS = [
  '#ec4899, #e11d48',
  '#a855f7, #7c3aed',
  '#6366f1, #2563eb',
  '#14b8a6, #059669',
  '#f97316, #dc2626',
  '#06b6d4, #2563eb',
];

const rankColors = [
  'bg-accent-100 text-yellow-700',
  'bg-gray-100 text-gray-600',
  'bg-orange-100 text-orange-700',
];

function Leaderboard() {
  const { t } = useTranslation();
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const { data } = await axios.get('/api/leaderboard', {
        headers: { Authorization: `Bearer ${authService.getToken()}` }
      });
      setLeaderboard(data.leaderboard || []);
      setMyRank(data.myRank);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  const getAvatarColor = (index) => AVATAR_COLORS[index % AVATAR_COLORS.length];

  const top3 = Array.isArray(leaderboard) ? leaderboard.slice(0, 3) : [];
  const rest = Array.isArray(leaderboard) ? leaderboard.slice(3) : [];

  return (
    <>
      <Helmet><title>{t('leaderboard.pageTitle')}</title></Helmet>
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-primary-700 via-primary-600 to-indigo-700 rounded-2xl p-8 mb-6 flex items-center gap-4 shadow-lg relative overflow-hidden animate-fade-in">
          <div className="absolute inset-0 opacity-[0.05]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
          <div className="bg-white/15 rounded-xl p-3 relative z-10">
            <FiAward className="w-8 h-8 text-accent-300" />
          </div>
          <div className="relative z-10">
            <h1 className="text-2xl font-bold text-white">{t('leaderboard.title')}</h1>
            <p className="text-primary-100 text-sm">{t('leaderboard.subtitle')}</p>
          </div>
        </div>

        {myRank && (
          <div className="dash-card p-5 mb-6 flex items-center justify-between animate-slide-up"
            style={{ background: 'linear-gradient(135deg, rgb(var(--primary-50, 238 242 255)), rgb(var(--surface-elevated)))' }}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getRankIcon(myRank.rank) || `#${myRank.rank || '?'}`}</span>
              <div>
                <p className="text-xs" style={{ color: 'rgb(var(--text-tertiary))' }}>{t('leaderboard.yourRank')}</p>
                <p className="font-bold" style={{ color: 'rgb(var(--text-primary))' }}>{myRank.points || 0} {t('leaderboard.points')}</p>
              </div>
            </div>
            <span className="text-sm" style={{ color: 'rgb(var(--text-tertiary))' }}>{myRank.quizzes_taken || 0} quizzes &middot; {myRank.exams_taken || 0} exams</span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: 'rgb(var(--border))', borderTopColor: 'rgb(var(--text-primary))' }} />
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="dash-card p-16 text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: 'rgb(var(--surface-elevated))' }}>
              <FiTrendingUp className="w-10 h-10" style={{ color: 'rgb(var(--text-tertiary))' }} />
            </div>
            <p className="text-lg" style={{ color: 'rgb(var(--text-secondary))' }}>{t('leaderboard.noRankings')}</p>
          </div>
        ) : (
          <>
            {top3.length === 3 && (
              <div className="flex justify-center items-end gap-3 sm:gap-5 mb-8 animate-stagger">
                <div className="flex flex-col items-center group hover:-translate-y-1 transition-transform duration-200">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center font-bold text-white shadow-[0_0_0_3px_#d1d5db,0_0_20px_rgba(156,163,175,0.2)] relative group-hover:shadow-[0_0_0_3px_#d1d5db,0_0_30px_rgba(156,163,175,0.35)] transition-shadow">
                    {top3[1].full_name?.charAt(0)}
                    <span className="absolute -bottom-2 -right-1 text-2xl drop-shadow-md">🥈</span>
                  </div>
                  <div className="font-semibold text-sm mt-2 max-w-20 sm:max-w-28 truncate text-center" style={{ color: 'rgb(var(--text-primary))' }}>{top3[1].full_name}</div>
                  <div className="text-xs font-medium" style={{ color: 'rgb(var(--text-tertiary))' }}>{top3[1].total_points} {t('common.points')}</div>
                  <div className="w-24 h-12 bg-gradient-to-b from-gray-400 to-gray-500 rounded-t-lg mt-2 flex items-start justify-center pt-2 font-bold text-white">2</div>
                </div>

                <div className="flex flex-col items-center group hover:-translate-y-1 transition-transform duration-200">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-bold text-white shadow-[0_0_0_3px_#fbbf24,0_0_20px_rgba(245,158,11,0.3)] relative group-hover:shadow-[0_0_0_3px_#fbbf24,0_0_30px_rgba(245,158,11,0.45)] transition-shadow">
                    {top3[0].full_name?.charAt(0)}
                    <span className="absolute -bottom-2 -right-1 text-2xl drop-shadow-md">🥇</span>
                  </div>
                  <div className="font-semibold text-sm mt-2 max-w-20 sm:max-w-28 truncate text-center" style={{ color: 'rgb(var(--text-primary))' }}>{top3[0].full_name}</div>
                  <div className="text-xs font-medium" style={{ color: 'rgb(var(--text-tertiary))' }}>{top3[0].total_points} {t('common.points')}</div>
                  <div className="w-24 h-16 bg-gradient-to-b from-amber-400 to-amber-600 rounded-t-lg mt-2 flex items-start justify-center pt-2 font-bold text-white">1</div>
                </div>

                <div className="flex flex-col items-center group hover:-translate-y-1 transition-transform duration-200">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center font-bold text-white shadow-[0_0_0_3px_#fcd34d,0_0_20px_rgba(217,119,6,0.2)] relative group-hover:shadow-[0_0_0_3px_#fcd34d,0_0_30px_rgba(217,119,6,0.35)] transition-shadow">
                    {top3[2].full_name?.charAt(0)}
                    <span className="absolute -bottom-2 -right-1 text-2xl drop-shadow-md">🥉</span>
                  </div>
                  <div className="font-semibold text-sm mt-2 max-w-20 sm:max-w-28 truncate text-center" style={{ color: 'rgb(var(--text-primary))' }}>{top3[2].full_name}</div>
                  <div className="text-xs font-medium" style={{ color: 'rgb(var(--text-tertiary))' }}>{top3[2].total_points} {t('common.points')}</div>
                  <div className="w-24 h-9 bg-gradient-to-b from-amber-600 to-amber-800 rounded-t-lg mt-2 flex items-start justify-center pt-2 font-bold text-white">3</div>
                </div>
              </div>
            )}

            <div className="dash-card overflow-x-auto animate-slide-up">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgb(var(--border))' }}>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgb(var(--text-tertiary))' }}>{t('leaderboard.rank')}</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgb(var(--text-tertiary))' }}>{t('leaderboard.player')}</th>
                    <th className="text-center px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgb(var(--text-tertiary))' }}>{t('leaderboard.pointsHeader')}</th>
                    <th className="text-center px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgb(var(--text-tertiary))' }}>{t('leaderboard.quizzes')}</th>
                    <th className="text-center px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgb(var(--text-tertiary))' }}>{t('leaderboard.exams')}</th>
                  </tr>
                </thead>
                <tbody>
                  {rest.map((player, i) => {
                    const rank = i + 4;
                    const isMe = myRank?.rank === rank;
                    return (
                      <tr key={player.id}
                        className={`transition-colors ${isMe ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}
                        style={{ borderBottom: '1px solid rgb(var(--border))' }}>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                            rank === 1 ? 'bg-yellow-400 text-accent-800' :
                            rank === 2 ? 'bg-gray-200 text-gray-600' :
                            rank === 3 ? 'bg-amber-300 text-amber-800' :
                            'badge-info'
                          }`}>
                            {getRankIcon(rank) || rank}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm text-white shrink-0 ${
                              rank === 1 ? 'bg-gradient-to-br from-amber-400 to-amber-600' :
                              rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                              rank === 3 ? 'bg-gradient-to-br from-amber-600 to-amber-800' :
                              ''
                            }`} style={rank > 3 ? { background: `linear-gradient(135deg, ${getAvatarColor(i)})` } : undefined}>
                              {player.full_name?.charAt(0)}
                            </div>
                            <span className="font-medium" style={{ color: 'rgb(var(--text-primary))' }}>{player.full_name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center font-bold" style={{ color: 'rgb(var(--text-primary))' }}>{player.total_points}</td>
                        <td className="px-5 py-4 text-center text-sm" style={{ color: 'rgb(var(--text-tertiary))' }}>{player.quizzes_taken || 0}</td>
                        <td className="px-5 py-4 text-center text-sm" style={{ color: 'rgb(var(--text-tertiary))' }}>{player.exams_taken || 0}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default Leaderboard;
