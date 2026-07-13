import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import authService from '../../services/authService';
import {
  FiUsers, FiFileText, FiVideo, FiClipboard, FiDollarSign,
  FiAward, FiBarChart2, FiCpu, FiUserCheck, FiArrowUpRight,
  FiBook, FiSettings, FiTrendingUp, FiActivity
} from 'react-icons/fi';

function Admin() {
  const { t } = useTranslation();
  const [stats, setStats] = useState([
    { label: 'Users', value: '--', icon: FiUsers, color: 'from-blue-500 to-indigo-600', bgLight: 'bg-blue-50 dark:bg-blue-950/30' },
    { label: 'Quizzes', value: '--', icon: FiClipboard, color: 'from-emerald-500 to-teal-600', bgLight: 'bg-emerald-50 dark:bg-emerald-950/30' },
    { label: 'Videos', value: '--', icon: FiVideo, color: 'from-purple-500 to-violet-600', bgLight: 'bg-purple-50 dark:bg-purple-950/30' },
    { label: 'Documents', value: '--', icon: FiFileText, color: 'from-amber-500 to-orange-600', bgLight: 'bg-amber-50 dark:bg-amber-950/30' },
    { label: 'Payments', value: '--', icon: FiDollarSign, color: 'from-pink-500 to-rose-600', bgLight: 'bg-pink-50 dark:bg-pink-950/30' },
    { label: 'Certificates', value: '--', icon: FiAward, color: 'from-indigo-500 to-blue-600', bgLight: 'bg-indigo-50 dark:bg-indigo-950/30' },
  ]);

  useEffect(() => {
    const headers = { headers: { Authorization: `Bearer ${authService.getToken()}` } };
    Promise.all([
      axios.get('/api/users', headers).then(r => (r.data?.total ?? r.data?.users?.length) || '--').catch(() => '--'),
      axios.get('/api/quizzes', headers).then(r => (Array.isArray(r.data) ? r.data.length : r.data?.total) || '--').catch(() => '--'),
      axios.get('/api/videos', headers).then(r => (Array.isArray(r.data) ? r.data.length : r.data?.total) || '--').catch(() => '--'),
      axios.get('/api/library', headers).then(r => (Array.isArray(r.data) ? r.data.length : r.data?.total) || '--').catch(() => '--'),
      axios.get('/api/payments/admin', headers).then(r => (r.data?.total ?? (Array.isArray(r.data) ? r.data.length : 0)) || '--').catch(() => '--'),
      axios.get('/api/certificates/admin', headers).then(r => (Array.isArray(r.data) ? r.data.length : r.data?.total) || '--').catch(() => '--'),
    ]).then(([u, q, v, d, p, c]) => {
      setStats([
        { label: 'Users', value: u, icon: FiUsers, color: 'from-blue-500 to-indigo-600', bgLight: 'bg-blue-50 dark:bg-blue-950/30' },
        { label: 'Quizzes', value: q, icon: FiClipboard, color: 'from-emerald-500 to-teal-600', bgLight: 'bg-emerald-50 dark:bg-emerald-950/30' },
        { label: 'Videos', value: v, icon: FiVideo, color: 'from-purple-500 to-violet-600', bgLight: 'bg-purple-50 dark:bg-purple-950/30' },
        { label: 'Documents', value: d, icon: FiFileText, color: 'from-amber-500 to-orange-600', bgLight: 'bg-amber-50 dark:bg-amber-950/30' },
        { label: 'Payments', value: p, icon: FiDollarSign, color: 'from-pink-500 to-rose-600', bgLight: 'bg-pink-50 dark:bg-pink-950/30' },
        { label: 'Certificates', value: c, icon: FiAward, color: 'from-indigo-500 to-blue-600', bgLight: 'bg-indigo-50 dark:bg-indigo-950/30' },
      ]);
    });
  }, []);

  const quickLinks = [
    { to: '/admin/library', icon: FiBook, label: t('admin.links.libraryUpload'), desc: t('admin.links.libraryUploadDesc'), color: 'text-blue-500' },
    { to: '/admin/videos', icon: FiVideo, label: t('admin.links.videoUpload'), desc: t('admin.links.videoUploadDesc'), color: 'text-purple-500' },
    { to: '/admin/ai-questions', icon: FiCpu, label: t('admin.links.aiQuestions'), desc: t('admin.links.aiQuestionsDesc'), color: 'text-emerald-500' },
    { to: '/admin/team-members', icon: FiUserCheck, label: t('admin.links.teamMembers'), desc: t('admin.links.teamMembersDesc'), color: 'text-amber-500' },
    { to: '/admin/users', icon: FiUsers, label: t('admin.links.userManagement'), desc: t('admin.links.userManagementDesc'), color: 'text-indigo-500' },
  ];

  return (
    <>
      <Helmet><title>{t('admin.pageTitle')}</title></Helmet>
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>
            {t('admin.title')}
          </h1>
          <p className="mt-1.5 text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
            Overview of your platform metrics and quick actions
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 animate-stagger">
          {stats.map((stat) => (
            <div key={stat.label} className="dash-card p-5 group cursor-default">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>
                    {t(`admin.stats.${stat.label.toLowerCase()}`)}
                  </p>
                  <p className="text-3xl font-bold tracking-tight" style={{ color: 'rgb(var(--text-primary))' }}>
                    {stat.value}
                  </p>
                </div>
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                  <stat.icon className="text-white" size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'rgb(var(--text-primary))' }}>
            <FiActivity size={20} style={{ color: 'rgb(var(--text-tertiary))' }} />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-stagger">
            {quickLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="dash-card p-4 flex items-center gap-4 group"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${link.bgLight} group-hover:scale-110 transition-transform duration-200`}>
                  <link.icon className={link.color} size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate" style={{ color: 'rgb(var(--text-primary))' }}>
                    {link.label}
                  </p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: 'rgb(var(--text-tertiary))' }}>
                    {link.desc}
                  </p>
                </div>
                <FiArrowUpRight size={14} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'rgb(var(--text-tertiary))' }} />
              </Link>
            ))}
          </div>
        </div>

        {/* Platform Overview Card */}
        <div className="dash-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <FiTrendingUp size={20} className="text-primary-500" />
            <h2 className="text-lg font-semibold" style={{ color: 'rgb(var(--text-primary))' }}>
              Platform Overview
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Users', value: stats[0].value, icon: FiUsers, accent: 'text-blue-500' },
              { label: 'Active Content', value: stats[3].value, icon: FiFileText, accent: 'text-amber-500' },
              { label: 'Video Library', value: stats[2].value, icon: FiVideo, accent: 'text-purple-500' },
              { label: 'Revenue', value: stats[4].value, icon: FiDollarSign, accent: 'text-emerald-500' },
            ].map((item) => (
              <div key={item.label} className="text-center p-4 rounded-xl" style={{ background: 'rgb(var(--surface-elevated))' }}>
                <item.icon className={`mx-auto mb-2 ${item.accent}`} size={20} />
                <p className="text-2xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>{item.value}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgb(var(--text-tertiary))' }}>{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Admin;
