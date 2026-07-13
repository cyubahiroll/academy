import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import videoService from '../../services/videoService';
import { FiPlay, FiEye, FiClock, FiSearch, FiX, FiFilm } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import apiUrl from '../../utils/apiUrl';

function Videos() {
  const { t } = useTranslation();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      const data = await videoService.getAll();
      setVideos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = Array.isArray(videos) ? videos.filter(v =>
    v.title.toLowerCase().includes(search.toLowerCase())
  ) : [];

  const formatDuration = (seconds) => {
    if (!seconds) return t('common.notAvailable');
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <Helmet><title>{t('videos.pageTitle')}</title></Helmet>

      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('videos.title')}</h1>
          <p className="mt-1 text-sm text-primary-100">{t('videos.subtitle')}</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-5 relative z-10 mb-8 animate-fade-in">
        <div className="dash-card p-3 sm:p-4">
          <div className="relative">
            <FiSearch
              className="absolute left-3.5 top-1/2 -translate-y-1/2"
              size={16}
              style={{ color: 'rgb(var(--text-tertiary))' }}
            />
            <input
              type="text"
              placeholder={t('videos.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="dash-input pl-10 pr-10"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 btn-ghost p-1"
              >
                <FiX size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {selectedVideo && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-8 animate-fade-in">
          <div className="dash-card overflow-hidden">
            <div className="relative bg-black">
              <video controls className="w-full aspect-video" autoPlay>
                <source
                  src={apiUrl(videoService.streamUrl(selectedVideo.id))}
                  type={
                    selectedVideo.video_url?.endsWith('.mkv')
                      ? 'video/x-matroska'
                      : selectedVideo.video_url?.endsWith('.avi')
                      ? 'video/x-msvideo'
                      : selectedVideo.video_url?.endsWith('.mov')
                      ? 'video/quicktime'
                      : 'video/mp4'
                  }
                />
              </video>
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/80 text-white rounded-lg transition-colors backdrop-blur-sm"
              >
                <FiX size={16} />
              </button>
            </div>
            <div className="p-4">
              <h3
                className="text-base font-semibold"
                style={{ color: 'rgb(var(--text-primary))' }}
              >
                {selectedVideo.title}
              </h3>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent border-primary-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 animate-fade-in">
          <div
            className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{
              background: 'rgb(var(--surface-elevated))',
              border: '1px solid rgb(var(--border))',
            }}
          >
            <FiFilm size={28} style={{ color: 'rgb(var(--text-tertiary))' }} />
          </div>
          <p
            className="text-sm font-medium"
            style={{ color: 'rgb(var(--text-secondary))' }}
          >
            {t('videos.noVideos')}
          </p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-stagger">
            {filtered.map((video) => (
              <div
                key={video.id}
                className="dash-card overflow-hidden cursor-pointer group"
                onClick={() => setSelectedVideo(video)}
              >
                <div className="relative aspect-video overflow-hidden">
                  {video.thumbnail ? (
                    <img
                      src={apiUrl(video.thumbnail)}
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div
                      className="flex items-center justify-center w-full h-full"
                      style={{
                        background:
                          'linear-gradient(135deg, rgb(var(--surface-elevated)), rgb(var(--border)))',
                      }}
                    >
                      <FiFilm
                        size={32}
                        style={{ color: 'rgb(var(--text-tertiary))' }}
                      />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
                    <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-600/40">
                      <FiPlay className="text-white ml-0.5" size={18} />
                    </div>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                    <div className="w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center bg-white/15">
                      <FiPlay className="text-white ml-0.5" size={14} />
                    </div>
                  </div>

                  {video.duration && (
                    <span
                      className="absolute bottom-2 right-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-md flex items-center gap-1"
                      style={{
                        background: 'rgba(0,0,0,0.75)',
                        color: '#fff',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      <FiClock size={9} /> {formatDuration(video.duration)}
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <h3
                    className="text-sm font-semibold line-clamp-1 group-hover:text-primary-600 transition-colors"
                    style={{ color: 'rgb(var(--text-primary))' }}
                  >
                    {video.title}
                  </h3>
                  <p
                    className="text-xs mt-1 line-clamp-2 leading-relaxed"
                    style={{ color: 'rgb(var(--text-secondary))' }}
                  >
                    {video.description}
                  </p>
                  <div
                    className="flex items-center justify-between mt-3 pt-3"
                    style={{ borderTop: '1px solid rgb(var(--border))' }}
                  >
                    <span
                      className="text-[11px] flex items-center gap-1"
                      style={{ color: 'rgb(var(--text-tertiary))' }}
                    >
                      <FiEye size={11} /> {video.view_count || 0}
                    </span>
                    {video.category_name && (
                      <span className="badge badge-info text-[10px]">
                        {video.category_name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default Videos;
