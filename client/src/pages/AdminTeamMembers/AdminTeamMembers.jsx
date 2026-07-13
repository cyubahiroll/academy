import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import teamMemberService from '../../services/teamMemberService';
import toast from 'react-hot-toast';
import { FiUpload, FiUsers, FiTrash2, FiEdit2 } from 'react-icons/fi';
import apiUrl from '../../utils/apiUrl';

function AdminTeamMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', role: '', description: '', display_order: 0, is_active: true });
  const [file, setFile] = useState(null);
  const fileRef = useRef();

  useEffect(() => { loadMembers(); }, []);

  const loadMembers = async () => {
    try {
      const data = await teamMemberService.getAll();
      setMembers(data);
    } catch (err) {
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ name: '', role: '', description: '', display_order: 0, is_active: true });
    setFile(null);
    setEditing(null);
    setShowForm(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const openEdit = (member) => {
    setForm({
      name: member.name,
      role: member.role,
      description: member.description || '',
      display_order: member.display_order || 0,
      is_active: member.is_active
    });
    setEditing(member.id);
    setShowForm(true);
    setFile(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.role) {
      toast.error('Name and role are required');
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('role', form.role);
      fd.append('description', form.description);
      fd.append('display_order', form.display_order);
      fd.append('is_active', form.is_active);
      if (file) fd.append('avatar', file);

      if (editing) {
        await teamMemberService.update(editing, fd);
        toast.success('Team member updated');
      } else {
        await teamMemberService.create(fd);
        toast.success('Team member added');
      }
      resetForm();
      loadMembers();
    } catch (err) {
      console.error('Save failed:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Save failed';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this team member?')) return;
    try {
      await teamMemberService.delete(id);
      toast.success('Team member deleted');
      loadMembers();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const styles = {
    page: {
      maxWidth: '64rem',
      margin: '0 auto',
      padding: '0 1.5rem 3rem',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '2rem',
      flexWrap: 'wrap',
      gap: '1rem',
    },
    title: {
      fontSize: '1.875rem',
      fontWeight: 700,
      color: 'rgb(var(--text-primary))',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    titleIcon: {
      width: '40px',
      height: '40px',
      borderRadius: '12px',
      background: 'rgba(var(--primary), 0.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    formOverlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.3)',
      backdropFilter: 'blur(4px)',
      zIndex: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
    },
    formCard: {
      width: '100%',
      maxWidth: '36rem',
      background: 'rgb(var(--surface))',
      border: '1px solid rgb(var(--border))',
      borderRadius: '16px',
      padding: '2rem',
      boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
      maxHeight: '90vh',
      overflowY: 'auto',
    },
    formTitle: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: 'rgb(var(--text-primary))',
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.375rem',
    },
    formGroupFull: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.375rem',
      gridColumn: '1 / -1',
    },
    label: {
      fontSize: '0.8125rem',
      fontWeight: 600,
      color: 'rgb(var(--text-secondary))',
    },
    formActions: {
      display: 'flex',
      gap: '0.75rem',
      marginTop: '1.5rem',
    },
    tableWrap: {
      overflowX: 'auto',
    },
    avatar: {
      width: '42px',
      height: '42px',
      borderRadius: '50%',
      overflow: 'hidden',
      flexShrink: 0,
      background: 'rgb(var(--bg-secondary, var(--bg)))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.875rem',
      fontWeight: 600,
      color: 'rgb(var(--text-tertiary))',
      border: '2px solid rgb(var(--border))',
    },
    avatarImg: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    cellActions: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: '0.25rem',
    },
    actionBtn: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '0.5rem',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.15s ease',
    },
    emptyState: {
      textAlign: 'center',
      padding: '3rem 1rem',
      color: 'rgb(var(--text-tertiary))',
    },
    loadingState: {
      textAlign: 'center',
      padding: '3rem 1rem',
      color: 'rgb(var(--text-tertiary))',
    },
    descCell: {
      maxWidth: '200px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    responsiveFormGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem',
    },
  };

  return (
    <>
      <Helmet><title>Manage Team - Admin</title></Helmet>
      <div style={styles.page}>
        <div className="dash-header" style={styles.header}>
          <h1 style={styles.title}>
            <span style={styles.titleIcon}><FiUsers size={20} /></span>
            Team Members
          </h1>
          {!showForm && (
            <button
              className="btn-primary"
              onClick={() => { resetForm(); setShowForm(true); }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FiUsers size={18} /> Add Member
            </button>
          )}
        </div>

        {showForm && (
          <div style={styles.formOverlay} onClick={(e) => { if (e.target === e.currentTarget) resetForm(); }}>
            <div className="dash-card" style={styles.formCard}>
              <h2 style={styles.formTitle}>
                <FiUpload />
                {editing ? 'Edit Member' : 'Add New Member'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div style={styles.responsiveFormGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Name *</label>
                    <input
                      className="dash-input"
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Full name"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Role *</label>
                    <input
                      className="dash-input"
                      type="text"
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      placeholder="e.g. Founder, Instructor"
                    />
                  </div>
                  <div style={styles.formGroupFull}>
                    <label style={styles.label}>Description</label>
                    <textarea
                      className="dash-textarea"
                      rows={3}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Brief description about this member"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Display Order</label>
                    <input
                      className="dash-input"
                      type="number"
                      value={form.display_order}
                      onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Status</label>
                    <select
                      className="dash-select"
                      value={form.is_active}
                      onChange={(e) => setForm({ ...form, is_active: e.target.value === 'true' })}
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                  <div style={styles.formGroupFull}>
                    <label style={styles.label}>Photo</label>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFile(e.target.files[0])}
                      className="dash-input"
                      style={{ padding: '0.625rem 0.75rem' }}
                    />
                  </div>
                </div>
                <div style={styles.formActions}>
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : editing ? 'Update' : 'Add Member'}
                  </button>
                  <button type="button" className="btn-secondary" onClick={resetForm}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="dash-card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgb(var(--border))' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'rgb(var(--text-primary))' }}>
              All Members
            </h2>
          </div>

          {loading ? (
            <div style={styles.loadingState}>Loading...</div>
          ) : members.length === 0 ? (
            <div style={styles.emptyState}>No team members yet</div>
          ) : (
            <div style={styles.tableWrap}>
              <table className="table-container" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th className="table-header-cell" style={{ width: '60px' }}>Photo</th>
                    <th className="table-header-cell">Name</th>
                    <th className="table-header-cell">Role</th>
                    <th className="table-header-cell">Description</th>
                    <th className="table-header-cell" style={{ width: '70px' }}>Order</th>
                    <th className="table-header-cell" style={{ width: '90px' }}>Status</th>
                    <th className="table-header-cell" style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id} className="table-row">
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <div style={styles.avatar}>
                          {member.image_url ? (
                            <img src={apiUrl(member.image_url)} alt={member.name} style={styles.avatarImg} />
                          ) : (
                            member.name.charAt(0).toUpperCase()
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '0.875rem 1rem', fontWeight: 500, color: 'rgb(var(--text-primary))' }}>
                        {member.name}
                      </td>
                      <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: 'rgb(var(--text-secondary))' }}>
                        {member.role}
                      </td>
                      <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: 'rgb(var(--text-secondary))', ...styles.descCell }}>
                        {member.description || '\u2014'}
                      </td>
                      <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: 'rgb(var(--text-secondary))' }}>
                        {member.display_order}
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <span className={member.is_active ? 'badge-success' : 'badge-danger'}>
                          {member.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <div style={styles.cellActions}>
                          <button
                            className="btn-ghost"
                            style={{ ...styles.actionBtn, color: 'rgb(var(--text-secondary))' }}
                            onClick={() => openEdit(member)}
                            title="Edit"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            className="btn-danger"
                            style={{ ...styles.actionBtn, color: '#ef4444' }}
                            onClick={() => handleDelete(member.id)}
                            title="Delete"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default AdminTeamMembers;
