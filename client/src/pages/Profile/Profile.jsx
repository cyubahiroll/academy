import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { usePayment } from '../../context/PaymentContext';
import {
  FiArrowLeft, FiUser, FiMail, FiPhone, FiCalendar, FiEdit3, FiSave, FiX,
  FiCreditCard, FiCheck, FiCamera, FiEye, FiEyeOff, FiShield, FiLock,
  FiAlertCircle, FiCheckCircle
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import apiUrl from '../../utils/apiUrl';

function Profile() {
  const { t } = useTranslation();
  const { user, updateProfile, updateEmail, changePassword, loading: authLoading } = useAuth();
  const { subscription, checkSubscription, hasActiveSubscription } = usePayment();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: '', phone: '' });
  const [saving, setSaving] = useState(false);

  const [emailForm, setEmailForm] = useState({ newEmail: '', confirmEmail: '', currentPassword: '' });
  const [emailSaving, setEmailSaving] = useState(false);
  const [showEmailPassword, setShowEmailPassword] = useState(false);

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setForm({ full_name: user.full_name || '', phone: user.phone || '' });
    }
    checkSubscription();
  }, [user]);

  const getInitials = useCallback(() => {
    if (!user?.full_name) return '?';
    return user.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }, [user?.full_name]);

  const getPasswordStrength = useCallback((password) => {
    if (!password) return { score: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { score: 1, label: t('profile.weak', 'Weak'), color: '#ef4444' };
    if (score <= 2) return { score: 2, label: t('profile.fair', 'Fair'), color: '#f97316' };
    if (score <= 3) return { score: 3, label: t('profile.good', 'Good'), color: '#eab308' };
    return { score: 4, label: t('profile.strong', 'Strong'), color: '#22c55e' };
  }, [t]);

  const getPasswordRequirements = useCallback((password) => {
    return [
      { met: password.length >= 8, label: t('profile.reqLength', 'At least 8 characters') },
      { met: /[A-Z]/.test(password), label: t('profile.reqUpper', 'Uppercase letter') },
      { met: /[a-z]/.test(password), label: t('profile.reqLower', 'Lowercase letter') },
      { met: /[0-9]/.test(password), label: t('profile.reqNumber', 'Number') },
      { met: /[^A-Za-z0-9]/.test(password), label: t('profile.reqSpecial', 'Special character') },
    ];
  }, [t]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error(t('profile.invalidImageType', 'Only JPG, PNG, JPEG, and WebP files are allowed'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('profile.imageTooLarge', 'Image must be smaller than 5MB'));
      return;
    }

    setAvatarPreview(URL.createObjectURL(file));
    setAvatarSaving(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      await updateProfile(formData);
      toast.success(t('profile.avatarUpdated', 'Profile picture updated!'));
    } catch (error) {
      toast.error(t('profile.avatarFailed', 'Failed to update profile picture'));
      setAvatarPreview(null);
    } finally {
      setAvatarSaving(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('full_name', form.full_name);
      formData.append('phone', form.phone);
      await updateProfile(formData);
      setEditing(false);
      toast.success(t('profile.updateSuccess'));
    } catch (error) {
      toast.error(t('profile.updateFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    const trimmedNew = emailForm.newEmail.trim().toLowerCase();
    const trimmedConfirm = emailForm.confirmEmail.trim().toLowerCase();

    if (!trimmedNew || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedNew)) {
      toast.error(t('profile.invalidEmail', 'Please enter a valid email address'));
      return;
    }
    if (trimmedNew !== trimmedConfirm) {
      toast.error(t('profile.emailsNoMatch', 'Emails do not match'));
      return;
    }
    if (!emailForm.currentPassword) {
      toast.error(t('profile.passwordRequired', 'Please enter your current password'));
      return;
    }

    setEmailSaving(true);
    try {
      await updateEmail({ newEmail: trimmedNew, currentPassword: emailForm.currentPassword });
      toast.success(t('profile.emailUpdated', 'Email updated successfully!'));
      setEmailForm({ newEmail: '', confirmEmail: '', currentPassword: '' });
    } catch (error) {
      toast.error(error?.response?.data?.message || t('profile.emailFailed', 'Failed to update email'));
    } finally {
      setEmailSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!passwordForm.currentPassword) {
      toast.error(t('profile.currentPasswordRequired', 'Please enter your current password'));
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error(t('profile.passwordTooShort', 'Password must be at least 8 characters'));
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error(t('profile.passwordsNoMatch', 'Passwords do not match'));
      return;
    }

    setPasswordSaving(true);
    try {
      await changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      toast.success(t('profile.passwordChanged', 'Password changed successfully!'));
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error?.response?.data?.message || t('profile.passwordFailed', 'Failed to change password'));
    } finally {
      setPasswordSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: 'rgb(var(--input-focus))' }}></div>
      </div>
    );
  }

  const pwStrength = getPasswordStrength(passwordForm.newPassword);
  const pwRequirements = getPasswordRequirements(passwordForm.newPassword);

  return (
    <>
      <Helmet><title>{t('profile.pageTitle')}</title></Helmet>
      <div className="max-w-3xl mx-auto space-y-6 p-4 sm:p-6 lg:p-8 animate-fade-in">

        {/* Back + Page Title */}
        <div className="flex items-center gap-3">
          <Link to="/" className="btn-ghost p-2">
            <FiArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>
            {t('profile.title')}
          </h1>
        </div>

        {/* ===== Profile Header Card ===== */}
        <div className="dash-card p-6 sm:p-8 animate-slide-up">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative group flex-shrink-0">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)' }}
                onClick={handleAvatarClick}
              >
                {avatarPreview || user?.avatar ? (
                  <img
                    src={avatarPreview || apiUrl(user.avatar)}
                    alt={user?.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getInitials()
                )}
              </div>
              <button
                type="button"
                onClick={handleAvatarClick}
                disabled={avatarSaving}
                className="absolute inset-0 w-24 h-24 rounded-full flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                {avatarSaving ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                ) : (
                  <FiCamera size={20} className="text-white" />
                )}
              </button>
            </div>

            {/* Name + Role + Email */}
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>
                {user?.full_name}
              </h2>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-1.5">
                <span className="badge-info capitalize">{user?.role}</span>
              </div>
              <p className="text-sm mt-2" style={{ color: 'rgb(var(--text-tertiary))' }}>
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* ===== Personal Information Card ===== */}
        <div className="dash-card p-6 sm:p-8 animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgb(var(--surface-elevated))' }}>
                <FiUser size={16} style={{ color: 'rgb(var(--text-secondary))' }} />
              </div>
              <h2 className="text-lg font-bold" style={{ color: 'rgb(var(--text-primary))' }}>
                {t('profile.personalInfo', 'Personal Information')}
              </h2>
            </div>
            {!editing && (
              <button onClick={() => setEditing(true)} className="btn-ghost">
                <FiEdit3 size={16} />
                {t('profile.editProfile')}
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'rgb(var(--text-secondary))' }}>
                  {t('profile.fullName')}
                </label>
                <div className="relative">
                  <FiUser size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'rgb(var(--text-tertiary))' }} />
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    className="dash-input pl-10"
                    placeholder={t('profile.fullName')}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'rgb(var(--text-secondary))' }}>
                  {t('profile.phone')}
                </label>
                <div className="relative">
                  <FiPhone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'rgb(var(--text-tertiary))' }} />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="dash-input pl-10"
                    placeholder={t('profile.phone')}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <FiSave size={16} />
                  )}
                  {saving ? t('profile.saving') : t('profile.save')}
                </button>
                <button
                  type="button"
                  onClick={() => { setEditing(false); setForm({ full_name: user?.full_name || '', phone: user?.phone || '' }); }}
                  className="btn-secondary"
                >
                  <FiX size={16} />
                  {t('profile.cancel')}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-0">
              {/* Full Name */}
              <div className="flex items-center gap-4 py-3 border-b" style={{ borderColor: 'rgb(var(--border))' }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgb(var(--surface-elevated))' }}>
                  <FiUser size={16} style={{ color: 'rgb(var(--text-secondary))' }} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgb(var(--text-tertiary))' }}>{t('profile.fullName')}</p>
                  <p className="text-sm truncate" style={{ color: 'rgb(var(--text-primary))' }}>{user?.full_name || t('profile.notSet')}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-4 py-3 border-b" style={{ borderColor: 'rgb(var(--border))' }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgb(var(--surface-elevated))' }}>
                  <FiMail size={16} style={{ color: 'rgb(var(--text-secondary))' }} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgb(var(--text-tertiary))' }}>Email</p>
                  <p className="text-sm truncate" style={{ color: 'rgb(var(--text-primary))' }}>{user?.email}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-4 py-3 border-b" style={{ borderColor: 'rgb(var(--border))' }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgb(var(--surface-elevated))' }}>
                  <FiPhone size={16} style={{ color: 'rgb(var(--text-secondary))' }} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgb(var(--text-tertiary))' }}>{t('profile.phone')}</p>
                  <p className="text-sm" style={{ color: 'rgb(var(--text-primary))' }}>{user?.phone || t('profile.notSet')}</p>
                </div>
              </div>

              {/* Role */}
              <div className="flex items-center gap-4 py-3 border-b" style={{ borderColor: 'rgb(var(--border))' }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgb(var(--surface-elevated))' }}>
                  <FiShield size={16} style={{ color: 'rgb(var(--text-secondary))' }} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgb(var(--text-tertiary))' }}>{t('profile.role', 'Role')}</p>
                  <p className="text-sm capitalize" style={{ color: 'rgb(var(--text-primary))' }}>{user?.role}</p>
                </div>
              </div>

              {/* Account Status */}
              <div className="flex items-center gap-4 py-3 border-b" style={{ borderColor: 'rgb(var(--border))' }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgb(var(--surface-elevated))' }}>
                  <FiCheckCircle size={16} style={{ color: 'rgb(var(--text-secondary))' }} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgb(var(--text-tertiary))' }}>{t('profile.status', 'Status')}</p>
                  <span className={user?.is_active !== false ? 'badge-success' : 'badge-danger'}>
                    {user?.is_active !== false ? t('profile.active', 'Active') : t('profile.inactive', 'Inactive')}
                  </span>
                </div>
              </div>

              {/* Joined */}
              <div className="flex items-center gap-4 py-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgb(var(--surface-elevated))' }}>
                  <FiCalendar size={16} style={{ color: 'rgb(var(--text-secondary))' }} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgb(var(--text-tertiary))' }}>{t('profile.joined')}</p>
                  <p className="text-sm" style={{ color: 'rgb(var(--text-primary))' }}>
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : t('common.notAvailable')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ===== Update Email Card ===== */}
        <div className="dash-card p-6 sm:p-8 animate-slide-up">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgb(var(--surface-elevated))' }}>
              <FiMail size={16} style={{ color: 'rgb(var(--text-secondary))' }} />
            </div>
            <h2 className="text-lg font-bold" style={{ color: 'rgb(var(--text-primary))' }}>
              {t('profile.updateEmail', 'Update Email')}
            </h2>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-5">
            {/* Current Email (readonly) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'rgb(var(--text-secondary))' }}>
                {t('profile.currentEmail', 'Current Email')}
              </label>
              <div className="relative">
                <FiMail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'rgb(var(--text-tertiary))' }} />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="dash-input pl-10 opacity-60 cursor-not-allowed"
                />
              </div>
            </div>

            {/* New Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'rgb(var(--text-secondary))' }}>
                {t('profile.newEmail', 'New Email')}
              </label>
              <div className="relative">
                <FiMail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'rgb(var(--text-tertiary))' }} />
                <input
                  type="email"
                  value={emailForm.newEmail}
                  onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                  className="dash-input pl-10"
                  placeholder={t('profile.newEmailPlaceholder', 'Enter new email')}
                />
              </div>
            </div>

            {/* Confirm New Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'rgb(var(--text-secondary))' }}>
                {t('profile.confirmEmail', 'Confirm New Email')}
              </label>
              <div className="relative">
                <FiMail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'rgb(var(--text-tertiary))' }} />
                <input
                  type="email"
                  value={emailForm.confirmEmail}
                  onChange={(e) => setEmailForm({ ...emailForm, confirmEmail: e.target.value })}
                  className="dash-input pl-10"
                  placeholder={t('profile.confirmEmailPlaceholder', 'Confirm new email')}
                />
              </div>
              {emailForm.confirmEmail && emailForm.newEmail !== emailForm.confirmEmail && (
                <p className="text-xs mt-1.5" style={{ color: '#ef4444' }}>{t('profile.emailsNoMatch', 'Emails do not match')}</p>
              )}
            </div>

            {/* Current Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'rgb(var(--text-secondary))' }}>
                {t('profile.currentPassword', 'Current Password')}
              </label>
              <div className="relative">
                <FiLock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'rgb(var(--text-tertiary))' }} />
                <input
                  type={showEmailPassword ? 'text' : 'password'}
                  value={emailForm.currentPassword}
                  onChange={(e) => setEmailForm({ ...emailForm, currentPassword: e.target.value })}
                  className="dash-input pl-10 pr-10"
                  placeholder={t('profile.enterPassword', 'Enter current password')}
                />
                <button
                  type="button"
                  onClick={() => setShowEmailPassword(!showEmailPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: 'rgb(var(--text-tertiary))' }}
                >
                  {showEmailPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={emailSaving} className="btn-primary">
                {emailSaving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  <FiSave size={16} />
                )}
                {emailSaving ? t('profile.updating', 'Updating...') : t('profile.saveChanges', 'Save Changes')}
              </button>
              <button
                type="button"
                onClick={() => setEmailForm({ newEmail: '', confirmEmail: '', currentPassword: '' })}
                className="btn-secondary"
              >
                <FiX size={16} />
                {t('profile.cancel')}
              </button>
            </div>
          </form>
        </div>

        {/* ===== Change Password Card ===== */}
        <div className="dash-card p-6 sm:p-8 animate-slide-up">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgb(var(--surface-elevated))' }}>
              <FiLock size={16} style={{ color: 'rgb(var(--text-secondary))' }} />
            </div>
            <h2 className="text-lg font-bold" style={{ color: 'rgb(var(--text-primary))' }}>
              {t('profile.changePassword', 'Change Password')}
            </h2>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'rgb(var(--text-secondary))' }}>
                {t('profile.currentPassword', 'Current Password')}
              </label>
              <div className="relative">
                <FiLock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'rgb(var(--text-tertiary))' }} />
                <input
                  type={showCurrentPw ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="dash-input pl-10 pr-10"
                  placeholder={t('profile.enterPassword', 'Enter current password')}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: 'rgb(var(--text-tertiary))' }}
                >
                  {showCurrentPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'rgb(var(--text-secondary))' }}>
                {t('profile.newPassword', 'New Password')}
              </label>
              <div className="relative">
                <FiLock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'rgb(var(--text-tertiary))' }} />
                <input
                  type={showNewPw ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="dash-input pl-10 pr-10"
                  placeholder={t('profile.newPasswordPlaceholder', 'Enter new password')}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: 'rgb(var(--text-tertiary))' }}
                >
                  {showNewPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {passwordForm.newPassword && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgb(var(--border))' }}>
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${(pwStrength.score / 4) * 100}%`,
                          backgroundColor: pwStrength.color,
                        }}
                      ></div>
                    </div>
                    <span className="text-xs font-semibold" style={{ color: pwStrength.color }}>
                      {pwStrength.label}
                    </span>
                  </div>

                  {/* Requirements Checklist */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-3">
                    {pwRequirements.map((req, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs" style={{ color: req.met ? '#22c55e' : 'rgb(var(--text-tertiary))' }}>
                        {req.met ? <FiCheckCircle size={14} /> : <FiAlertCircle size={14} />}
                        <span>{req.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'rgb(var(--text-secondary))' }}>
                {t('profile.confirmPassword', 'Confirm New Password')}
              </label>
              <div className="relative">
                <FiLock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'rgb(var(--text-tertiary))' }} />
                <input
                  type={showConfirmPw ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="dash-input pl-10 pr-10"
                  placeholder={t('profile.confirmPasswordPlaceholder', 'Confirm new password')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: 'rgb(var(--text-tertiary))' }}
                >
                  {showConfirmPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                <p className="text-xs mt-1.5" style={{ color: '#ef4444' }}>{t('profile.passwordsNoMatch', 'Passwords do not match')}</p>
              )}
            </div>

            <p className="text-xs" style={{ color: 'rgb(var(--text-tertiary))' }}>
              {t('profile.minCharacters', 'Minimum 8 characters required')}
            </p>

            <button type="submit" disabled={passwordSaving} className="btn-primary">
              {passwordSaving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                <FiLock size={16} />
              )}
              {passwordSaving ? t('profile.changing', 'Changing...') : t('profile.changePassword', 'Change Password')}
            </button>
          </form>
        </div>

        {/* ===== Subscription Card ===== */}
        <div className="dash-card p-6 sm:p-8 animate-slide-up">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgb(var(--surface-elevated))' }}>
              <FiCreditCard size={16} style={{ color: 'rgb(var(--text-secondary))' }} />
            </div>
            <h2 className="text-lg font-bold" style={{ color: 'rgb(var(--text-primary))' }}>
              {t('profile.subscription')}
            </h2>
          </div>

          {hasActiveSubscription && subscription ? (
            <div className="p-4 rounded-lg" style={{ background: 'rgb(var(--surface-elevated))' }}>
              <div className="flex items-center gap-3 mb-2">
                <span className="badge-success">
                  <FiCheck size={12} className="mr-1" />
                  {t('profile.activePlan', { plan: subscription.plan })}
                </span>
              </div>
              <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
                {t('profile.daysRemaining', { count: subscription.days_remaining })}
              </p>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm mb-4" style={{ color: 'rgb(var(--text-secondary))' }}>
                {t('profile.noSubscription')}
              </p>
              <Link to="/payment" className="btn-primary">
                <FiCreditCard size={16} />
                {t('profile.viewPlans')}
              </Link>
            </div>
          )}
        </div>

      </div>
    </>
  );
}

export default Profile;
