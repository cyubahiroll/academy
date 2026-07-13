import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import userService from '../../services/userService';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiUsers, FiTrash2, FiUserCheck, FiUserX, FiSearch } from 'react-icons/fi';
import apiUrl from '../../utils/apiUrl';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const limit = 10;

  useEffect(() => { loadUsers(); }, [page]);

  const loadUsers = async () => {
    try {
      const data = await userService.getAll(page, limit);
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const result = await userService.toggleStatus(id);
      toast.success(result.message);
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      const result = await userService.updateRole(id, role);
      toast.success(result.message);
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this user?')) return;
    try {
      const result = await userService.delete(id);
      toast.success(result.message);
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const totalPages = Math.ceil(total / limit);

  const filteredUsers = users.filter((user) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (user.full_name || '').toLowerCase().includes(q) ||
      (user.email || '').toLowerCase().includes(q) ||
      (user.phone || '').toLowerCase().includes(q)
    );
  });

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  };

  return (
    <>
      <Helmet><title>Manage Users - Admin</title></Helmet>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-slide-up">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="btn-ghost p-2.5"
              aria-label="Back to Home"
            >
              <FiArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>
                Manage Users
              </h1>
              <p className="text-sm mt-0.5" style={{ color: 'rgb(var(--text-secondary))' }}>
                {total} total users
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6 animate-slide-up" style={{ animationDelay: '0.05s' }}>
          <div className="relative max-w-md">
            <FiSearch
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2"
              style={{ color: 'rgb(var(--text-tertiary))' }}
            />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="dash-input pl-10 w-full"
            />
          </div>
        </div>

        {/* Card */}
        <div className="dash-card overflow-hidden animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {/* Card Header */}
          <div className="px-6 py-4 flex items-center gap-2.5" style={{ borderBottom: '1px solid rgb(var(--border))' }}>
            <FiUsers size={18} style={{ color: 'rgb(var(--text-secondary))' }} />
            <h2 className="text-base font-semibold" style={{ color: 'rgb(var(--text-primary))' }}>
              All Users
            </h2>
            <span
              className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: 'rgb(var(--border))',
                color: 'rgb(var(--text-secondary))',
              }}
            >
              {total}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center gap-3" style={{ color: 'rgb(var(--text-tertiary))' }}>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-sm font-medium">Loading users...</span>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-16">
              <FiUsers size={40} className="mx-auto mb-3" style={{ color: 'rgb(var(--text-tertiary))', opacity: 0.5 }} />
              <p className="text-sm font-medium" style={{ color: 'rgb(var(--text-tertiary))' }}>
                {search ? 'No users match your search' : 'No users found'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block table-container">
                <table className="w-full">
                  <thead className="table-header-cell">
                    <tr>
                      <th className="text-left">User</th>
                      <th className="text-left">Email</th>
                      <th className="text-left">Phone</th>
                      <th className="text-left">Role</th>
                      <th className="text-left">Status</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="table-row">
                        <td>
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-semibold"
                              style={{
                                backgroundColor: user.is_active ? 'rgb(var(--primary-rgb, 99, 102, 241) / 0.1)' : 'rgb(var(--text-tertiary) / 0.1)',
                                color: 'rgb(var(--text-secondary))',
                              }}
                            >
                              {user.avatar ? (
                                <img src={apiUrl(user.avatar)} alt="" className="w-full h-full rounded-full object-cover" />
                              ) : (
                                getInitials(user.full_name)
                              )}
                            </div>
                            <span className="font-medium text-sm" style={{ color: 'rgb(var(--text-primary))' }}>
                              {user.full_name}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
                            {user.email}
                          </span>
                        </td>
                        <td>
                          <span className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
                            {user.phone || '—'}
                          </span>
                        </td>
                        <td>
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className="dash-select text-xs"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td>
                          <span className={`badge-${user.is_active ? 'success' : 'danger'}`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleToggleStatus(user.id)}
                              title={user.is_active ? 'Deactivate' : 'Activate'}
                              className="btn-ghost p-2"
                            >
                              {user.is_active ? <FiUserX size={15} /> : <FiUserCheck size={15} />}
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              title="Deactivate user"
                              className="btn-ghost btn-danger p-2"
                            >
                              <FiTrash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y" style={{ borderColor: 'rgb(var(--border))' }}>
                {filteredUsers.map((user) => (
                  <div key={user.id} className="p-4 space-y-3" style={{ borderBottom: '1px solid rgb(var(--border))' }}>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-semibold"
                        style={{
                          backgroundColor: 'rgb(var(--border))',
                          color: 'rgb(var(--text-secondary))',
                        }}
                      >
                        {user.avatar ? (
                          <img src={apiUrl(user.avatar)} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          getInitials(user.full_name)
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate" style={{ color: 'rgb(var(--text-primary))' }}>
                          {user.full_name}
                        </p>
                        <p className="text-xs truncate" style={{ color: 'rgb(var(--text-secondary))' }}>
                          {user.email}
                        </p>
                      </div>
                      <span className={`badge-${user.is_active ? 'success' : 'danger'}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs" style={{ color: 'rgb(var(--text-secondary))' }}>
                      <span>{user.phone || '—'}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="dash-select text-xs"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleStatus(user.id)}
                          title={user.is_active ? 'Deactivate' : 'Activate'}
                          className="btn-ghost p-2"
                        >
                          {user.is_active ? <FiUserX size={15} /> : <FiUserCheck size={15} />}
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          title="Deactivate user"
                          className="btn-ghost btn-danger p-2"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div
                  className="flex items-center justify-between px-6 py-4"
                  style={{ borderTop: '1px solid rgb(var(--border))' }}
                >
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn-secondary text-xs"
                  >
                    Previous
                  </button>
                  <span className="text-xs font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="btn-secondary text-xs"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default AdminUsers;
