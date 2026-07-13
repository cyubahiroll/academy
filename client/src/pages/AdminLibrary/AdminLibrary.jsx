import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import libraryService from '../../services/libraryService';
import toast from 'react-hot-toast';
import { FiUpload, FiFileText, FiTrash2, FiExternalLink } from 'react-icons/fi';
import apiUrl from '../../utils/apiUrl';

function AdminLibrary() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category_id: '', is_free: true });
  const [file, setFile] = useState(null);
  const fileRef = useRef();

  useEffect(() => { loadDocuments(); }, []);

  const loadDocuments = async () => {
    try {
      const data = await libraryService.getAll();
      setDocuments(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !file) {
      toast.error('Title and file are required');
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('category_id', form.category_id || '');
      fd.append('is_free', form.is_free);
      fd.append('document', file);
      await libraryService.create(fd);
      toast.success('Document uploaded');
      setForm({ title: '', description: '', category_id: '', is_free: true });
      setFile(null);
      fileRef.current.value = '';
      loadDocuments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this document?')) return;
    try {
      await libraryService.delete(id);
      toast.success('Document deleted');
      loadDocuments();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <>
      <Helmet><title>Manage Library - Admin</title></Helmet>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="animate-fade-in">
          <h1 className="text-2xl font-semibold" style={{ color: 'rgb(var(--text-primary))' }}>
            Manage Library
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
            Upload and manage learning documents for students.
          </p>
        </div>

        <div className="dash-card p-6 animate-slide-up">
          <h2
            className="text-base font-semibold mb-5 flex items-center gap-2"
            style={{ color: 'rgb(var(--text-primary))' }}
          >
            <FiUpload size={18} /> Upload Document
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-xs font-medium mb-1.5 uppercase tracking-wider"
                style={{ color: 'rgb(var(--text-secondary))' }}
              >
                Title *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Enter document title"
                className="dash-input w-full"
              />
            </div>
            <div>
              <label
                className="block text-xs font-medium mb-1.5 uppercase tracking-wider"
                style={{ color: 'rgb(var(--text-secondary))' }}
              >
                Description
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Optional description"
                className="dash-textarea w-full"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-xs font-medium mb-1.5 uppercase tracking-wider"
                  style={{ color: 'rgb(var(--text-secondary))' }}
                >
                  Category ID
                </label>
                <input
                  type="number"
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  placeholder="1-6"
                  className="dash-input w-full"
                />
              </div>
              <div>
                <label
                  className="block text-xs font-medium mb-1.5 uppercase tracking-wider"
                  style={{ color: 'rgb(var(--text-secondary))' }}
                >
                  Access
                </label>
                <select
                  value={form.is_free}
                  onChange={(e) => setForm({ ...form, is_free: e.target.value === 'true' })}
                  className="dash-select w-full"
                >
                  <option value="true">Free</option>
                  <option value="false">Premium</option>
                </select>
              </div>
            </div>
            <div>
              <label
                className="block text-xs font-medium mb-1.5 uppercase tracking-wider"
                style={{ color: 'rgb(var(--text-secondary))' }}
              >
                File (PDF, DOC, DOCX) *
              </label>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.doc,.docx,application/pdf"
                onChange={(e) => setFile(e.target.files[0])}
                className="dash-input w-full text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-transparent"
              />
              {file && (
                <p className="mt-1.5 text-xs flex items-center gap-1.5" style={{ color: 'rgb(var(--text-tertiary))' }}>
                  <FiFileText size={12} /> {file.name}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={uploading} className="btn-primary">
                {uploading ? 'Uploading...' : 'Upload Document'}
              </button>
            </div>
          </form>
        </div>

        <div className="dash-card animate-slide-up" style={{ animationDelay: '60ms' }}>
          <div
            className="px-6 py-4 flex items-center justify-between"
            style={{ borderBottom: '1px solid rgb(var(--border))' }}
          >
            <h2 className="text-base font-semibold" style={{ color: 'rgb(var(--text-primary))' }}>
              All Documents
            </h2>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ background: 'rgb(var(--border))', color: 'rgb(var(--text-secondary))' }}
            >
              {documents.length}
            </span>
          </div>
          {loading ? (
            <div className="text-center py-16" style={{ color: 'rgb(var(--text-tertiary))' }}>
              Loading...
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-16" style={{ color: 'rgb(var(--text-tertiary))' }}>
              No documents yet
            </div>
          ) : (
            <div className="table-container">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-header-cell">Title</th>
                    <th className="table-header-cell">Downloads</th>
                    <th className="table-header-cell" style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id} className="table-row">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
                            style={{ background: 'rgb(var(--border))' }}
                          >
                            <FiFileText size={16} style={{ color: 'rgb(var(--text-secondary))' }} />
                          </div>
                          <div className="min-w-0">
                            <p
                              className="font-medium text-sm truncate"
                              style={{ color: 'rgb(var(--text-primary))' }}
                            >
                              {doc.title}
                            </p>
                            {doc.description && (
                              <p
                                className="text-xs truncate max-w-xs mt-0.5"
                                style={{ color: 'rgb(var(--text-tertiary))' }}
                              >
                                {doc.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-md"
                          style={{ background: 'rgb(var(--border))', color: 'rgb(var(--text-secondary))' }}
                        >
                          {doc.download_count || 0}
                        </span>
                      </td>
                      <td className="px-6 py-3.5" style={{ textAlign: 'right' }}>
                        <div className="flex items-center justify-end gap-1">
                          {doc.file_url && (
                            <a
                              href={apiUrl(doc.file_url)}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-ghost p-2"
                            >
                              <FiExternalLink size={14} />
                            </a>
                          )}
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="btn-ghost p-2"
                            style={{ color: 'rgb(var(--text-tertiary))' }}
                          >
                            <FiTrash2 size={14} />
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

export default AdminLibrary;
