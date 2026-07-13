import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import videoService from '../../services/videoService';
import toast from 'react-hot-toast';
import { FiUpload, FiVideo, FiTrash2, FiExternalLink } from 'react-icons/fi';
import apiUrl from '../../utils/apiUrl';

function AdminVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', duration: '', category_id: '', is_free: true });
  const [file, setFile] = useState(null);
  const fileRef = useRef();

  useEffect(() => { loadVideos(); }, []);

  const loadVideos = async () => {
    try {
      const data = await videoService.getAll();
      setVideos(data);
    } catch (err) {
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !file) {
      toast.error('Title and video file are required');
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('duration', form.duration || '');
      fd.append('category_id', form.category_id || '');
      fd.append('is_free', form.is_free);
      fd.append('video', file);
      await videoService.create(fd);
      toast.success('Video uploaded');
      setForm({ title: '', description: '', duration: '', category_id: '', is_free: true });
      setFile(null);
      fileRef.current.value = '';
      loadVideos();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this video?')) return;
    try {
      await videoService.delete(id);
      toast.success('Video deleted');
      loadVideos();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <>
      <Helmet><title>Manage Videos - Admin</title></Helmet>
      <div className="max-w-5xl mx-auto p-6 animate-fade-in">
        <h1 className="text-2xl font-semibold mb-8 animate-slide-up" style={{ color: 'rgb(var(--text-primary))' }}>Manage Videos</h1>

        <div className="dash-card p-6 mb-8 animate-slide-up">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'rgb(var(--text-primary))' }}>
            <FiUpload /> Upload Video
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="dash-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="dash-textarea w-full resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>Duration (seconds)</label>
                <input
                  type="number"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  placeholder="e.g. 300"
                  className="dash-input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>Category ID</label>
                <input
                  type="number"
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  placeholder="1-6"
                  className="dash-input w-full"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>Free?</label>
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
              <label className="block text-sm font-medium mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>Video File (MP4, MKV, AVI, MOV) *</label>
              <input
                ref={fileRef}
                type="file"
                accept="video/*"
                onChange={(e) => setFile(e.target.files[0])}
                className="dash-input w-full text-sm"
              />
            </div>
            <button type="submit" disabled={uploading} className="btn-primary">
              {uploading ? 'Uploading...' : 'Upload Video'}
            </button>
          </form>
        </div>

        <div className="dash-card overflow-hidden animate-slide-up">
          <div className="p-6" style={{ borderBottom: '1px solid rgb(var(--border))' }}>
            <h2 className="text-lg font-semibold" style={{ color: 'rgb(var(--text-primary))' }}>All Videos</h2>
          </div>
          {loading ? (
            <div className="text-center py-12" style={{ color: 'rgb(var(--text-tertiary))' }}>Loading...</div>
          ) : videos.length === 0 ? (
            <div className="text-center py-12" style={{ color: 'rgb(var(--text-tertiary))' }}>No videos yet</div>
          ) : (
            <div className="table-container">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-header-cell text-left px-6">Title</th>
                    <th className="table-header-cell text-left px-6">Views</th>
                    <th className="table-header-cell text-right px-6">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {videos.map((video) => (
                    <tr key={video.id} className="table-row">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <FiVideo style={{ color: 'rgb(var(--primary, 99 102 241))' }} className="shrink-0" />
                          <div>
                            <p className="font-medium" style={{ color: 'rgb(var(--text-primary))' }}>{video.title}</p>
                            {video.description && (
                              <p className="text-xs truncate max-w-xs" style={{ color: 'rgb(var(--text-tertiary))' }}>{video.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: 'rgb(var(--text-tertiary))' }}>{video.view_count || 0}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {video.video_url && (
                            <a href={apiUrl(video.video_url)} target="_blank" rel="noreferrer" className="btn-ghost p-2">
                              <FiExternalLink size={16} />
                            </a>
                          )}
                          <button onClick={() => handleDelete(video.id)} className="btn-ghost p-2" style={{ color: 'rgb(var(--text-tertiary))' }}>
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

export default AdminVideos;
