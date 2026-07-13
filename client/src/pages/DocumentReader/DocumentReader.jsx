import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import libraryService from '../../services/libraryService';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';
import PaymentModal from '../../components/PaymentModal/PaymentModal';
import { FiArrowLeft, FiDownload, FiBookOpen, FiMinus, FiPlus, FiSun, FiMoon, FiImage, FiMaximize, FiMinimize, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const PARAGRAPHS_PER_PAGE = 20;

function HeaderBtn({ onClick, title, children }) {
  return (
    <button onClick={onClick} title={title} className="dr-hbtn">
      {children}
    </button>
  );
}

function DocumentReader() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const contentRef = useRef(null);
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [readerData, setReaderData] = useState(null);
  const [fontSize, setFontSize] = useState(19);
  const { theme } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const [darkMode, setDarkMode] = useState(() => theme === 'dark');
  const [showPayment, setShowPayment] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [pdfReadUrl, setPdfReadUrl] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pages, setPages] = useState([]);
  const [progress, setProgress] = useState(0);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else {
      await document.exitFullscreen();
      setFullscreen(false);
    }
  };

  useEffect(() => {
    const onFsChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const handleDownload = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/reader/${id}`);
      return;
    }
    try {
      const info = await libraryService.checkAccess(id);
      if (info.hasAccess) {
        await libraryService.download(id);
        toast.success(t('documentReader.downloadStarted'));
      } else {
        setShowPayment(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || t('documentReader.accessCheckFailed'));
    }
  };

  const handlePaymentSuccess = async () => {
    setShowPayment(false);
    await libraryService.download(id);
    toast.success(t('documentReader.downloadStarted'));
  };

  const splitIntoPages = useCallback((text) => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const result = [];
    let currentPageLines = [];
    for (const line of lines) {
      currentPageLines.push(line);
      if (currentPageLines.length >= PARAGRAPHS_PER_PAGE) {
        result.push(currentPageLines);
        currentPageLines = [];
      }
    }
    if (currentPageLines.length > 0) result.push(currentPageLines);
    if (result.length === 0) result.push([]);
    return result;
  }, []);

  const formatPageContent = (pageLines) => {
    let html = '<div class="book-content">';
    let inQuestion = false;

    for (const line of pageLines) {
      const isQuestion = /^\d{1,4}\./.test(line);
      const isOption = /^\(?[a-d]\)?/.test(line) && line.length < 80;

      if (isQuestion) {
        if (inQuestion) html += '</div>';
        inQuestion = true;
        const num = line.match(/^(\d{1,4}\.)/)[1];
        const rest = line.slice(num.length).trim();
        html += `<div class="question">
          <span class="q-num">${num}</span>
          <span class="q-text">${rest}</span>`;
      } else if (isOption && inQuestion) {
        const match = line.match(/^(\(?[a-d]\)?)\s*(.*)/);
        if (match) {
          html += `<div class="option"><span class="opt-letter">${match[1]}</span><span>${match[2]}</span></div>`;
        } else {
          html += `<div class="option"><span>${line}</span></div>`;
        }
      } else {
        if (inQuestion) { html += '</div>'; inQuestion = false; }
        html += `<p class="para">${line}</p>`;
      }
    }
    if (inQuestion) html += '</div>';
    html += '</div>';
    return html;
  };

  const saveProgress = useCallback(async (page, total) => {
    if (!isAuthenticated || !user) return;
    try {
      await libraryService.saveReadingProgress(id, {
        current_page: page,
        total_pages: total
      });
    } catch {
    }
  }, [id, isAuthenticated, user]);

  const goToPage = useCallback((page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    const pct = totalPages > 1 ? Math.round(((page - 1) / (totalPages - 1)) * 100) : 100;
    setProgress(pct);
    if (contentRef.current) contentRef.current.scrollTop = 0;
    saveProgress(page, totalPages);
  }, [totalPages, saveProgress]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        goToPage(currentPage + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goToPage(currentPage - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, goToPage]);

  const loadDocument = useCallback(async () => {
    try {
      const [docData, readData] = await Promise.all([
        libraryService.getById(id),
        libraryService.read(id)
      ]);
      if (!docData) {
        navigate('/library', { replace: true });
        return;
      }
      setDoc(docData);
      setReaderData(readData);

      if (readData?.type === 'pdf') {
        if (readData.url) {
          setPdfReadUrl(readData.url);
        } else {
          setPdfReadUrl(libraryService.readFileUrl(id));
        }
        setTotalPages(1);
        setCurrentPage(1);
      } else if (readData?.type === 'text' || readData?.type === 'html') {
        const rawContent = readData.content || '';
        const textContent = readData.type === 'html'
          ? rawContent.replace(/<[^>]+>/g, '').replace(/&[^;]+;/g, ' ')
          : rawContent;
        const textPages = splitIntoPages(textContent);
        setPages(textPages);
        setTotalPages(textPages.length);

        if (isAuthenticated && user) {
          try {
            const hist = await libraryService.getReadingProgress(id);
            if (hist && hist.current_page > 1) {
              const restorePage = Math.min(hist.current_page, textPages.length);
              setCurrentPage(restorePage);
              setProgress(hist.progress);
            }
          } catch {
          }
        }
      }
    } catch (err) {
      console.error('Failed to load document:', err);
      navigate('/library', { replace: true });
    } finally {
      setLoading(false);
    }
  }, [id, navigate, splitIntoPages, isAuthenticated, user]);

  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  /* ───── Loading Skeleton ───── */
  if (loading) {
    return (
      <div className="dr-loading">
        <div className="dr-load-icon">
          <FiBookOpen size={32} />
        </div>
        <p className="dr-load-text">{t('documentReader.openingBook') || 'Opening your book...'}</p>
        <div className="dr-load-skeleton">
          <div className="dr-skel" />
          <div className="dr-skel dr-skel--w75" />
          <div className="dr-skel dr-skel--w50" />
        </div>
      </div>
    );
  }

  const hasPagination = readerData?.type !== 'pdf' && totalPages > 1;
  const isTextOrHtml = readerData?.type === 'text' || readerData?.type === 'html';

  /* ───── Main Render ───── */
  return (
    <>
      <Helmet><title>{doc?.title} - Road Rules</title></Helmet>

      <div className="dr" style={{
        '--r-bg': darkMode ? '#0c0a09' : '#f5f0e8',
        '--r-surface': darkMode ? '#1c1917' : '#ffffff',
        '--r-surface-el': darkMode ? '#292524' : '#fefdfb',
        '--r-border': darkMode ? '#292524' : '#e2ddd5',
        '--r-border-s': darkMode ? '#1c1917' : '#ede8e0',
        '--r-text': darkMode ? '#e7e5e4' : '#1a1a2e',
        '--r-text2': darkMode ? '#a8a29e' : '#64748b',
        '--r-text3': darkMode ? '#78716c' : '#94a3b8',
        '--r-accent': darkMode ? '#fbbf24' : '#b45309',
        '--r-accent-h': darkMode ? '#f59e0b' : '#92400e',
        '--r-accent-s': darkMode ? 'rgba(251,191,36,0.10)' : 'rgba(180,83,9,0.07)',
        '--r-hdr-bg': darkMode ? 'rgba(12,10,9,0.88)' : 'rgba(255,255,255,0.88)',
        '--r-tb-bg': darkMode ? 'rgba(28,25,23,0.92)' : 'rgba(255,255,255,0.92)',
        '--r-shadow-p': darkMode
          ? '0 2px 8px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.35)'
          : '0 2px 8px rgba(0,0,0,0.05), 0 8px 32px rgba(0,0,0,0.07)',
        '--r-shadow-lg': darkMode
          ? '0 4px 24px rgba(0,0,0,0.45), 0 1px 4px rgba(0,0,0,0.3)'
          : '0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)',
        '--r-q-bg': darkMode ? 'rgba(251,191,36,0.06)' : '#fffbeb',
        '--r-q-bdr': '#f59e0b',
        '--r-qnum': darkMode ? '#fbbf24' : '#92400e',
        '--r-ptrack': darkMode ? '#292524' : '#f0ebe3',
        '--r-psel': darkMode ? 'rgba(251,191,36,0.25)' : 'rgba(180,83,9,0.15)',
      }}>

        {/* ════════ Header ════════ */}
        <header className="dr-hdr">
          <div className="dr-hdr-row">
            <div className="dr-hdr-left">
              <button onClick={() => navigate('/library')}
                className="dr-back" title={t('documentReader.backToLibrary')}>
                <FiArrowLeft size={18} />
              </button>
              <div className="dr-hdr-info">
                <h1 className="dr-title">{doc?.title}</h1>
                {doc?.author && <p className="dr-author">{doc.author}</p>}
              </div>
              {doc?.category_name && (
                <span className="dr-badge">{doc.category_name}</span>
              )}
            </div>
            <div className="dr-hdr-right">
              <Link to="/library/images" className="dr-hbtn dr-hbtn--images"
                title={t('documentReader.viewImages')}>
                <FiImage size={16} />
              </Link>
              <HeaderBtn onClick={() => setDarkMode(!darkMode)}
                title={darkMode ? t('documentReader.lightMode') : t('documentReader.darkMode')}>
                {darkMode ? <FiSun size={16} /> : <FiMoon size={16} />}
              </HeaderBtn>
            </div>
          </div>
          <div className="dr-track">
            <div className="dr-fill" style={{ width: `${progress}%` }} />
          </div>
        </header>

        {/* ════════ Reading Area ════════ */}
        <main className="dr-main" ref={contentRef}>
          <div className="dr-wrap">
            <div className="dr-paper">

              {/* ──── PDF Viewer ──── */}
              {readerData?.type === 'pdf' && (
                pdfReadUrl ? (
                  <iframe src={pdfReadUrl} className="dr-pdf"
                    style={{ height: 'calc(100vh - 170px)', minHeight: '400px' }}
                    title={doc?.title} />
                ) : (
                  <div className="dr-pdf-load">
                    <div className="dr-spinner" />
                    <p className="dr-pdf-load-text">Loading PDF...</p>
                  </div>
                )
              )}

              {/* ──── HTML Content ──── */}
              {readerData?.type === 'html' && (
                <div className="dr-content"
                  style={{ fontSize: `${fontSize}px` }}
                  dangerouslySetInnerHTML={{ __html: readerData.content }} />
              )}

              {/* ──── Text Content (paginated) ──── */}
              {readerData?.type === 'text' && pages.length > 0 && (
                <div className="dr-content"
                  style={{ fontSize: `${fontSize}px` }}
                  dangerouslySetInnerHTML={{ __html: formatPageContent(pages[currentPage - 1]) }} />
              )}

              {/* ──── Empty / Cannot Preview ──── */}
              {readerData?.type !== 'pdf' && readerData?.type !== 'html'
                && !(readerData?.type === 'text' && pages.length > 0) && (
                <div className="dr-empty">
                  <div className="dr-empty-icon">
                    <FiBookOpen size={32} />
                  </div>
                  <p className="dr-empty-title">{t('documentReader.cannotPreview')}</p>
                  <p className="dr-empty-desc">
                    {readerData?.message || t('documentReader.downloadFile')}
                  </p>
                  <button onClick={handleDownload} className="dr-empty-btn">
                    <FiDownload size={18} /> {t('documentReader.downloadFile')}
                  </button>
                </div>
              )}

            </div>
          </div>
        </main>

        {/* ════════ Floating Toolbar ════════ */}
        <div className="dr-toolbar">
          <div className="dr-pill">
            {hasPagination && (
              <div className="dr-tb-group">
                <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}
                  className="dr-tb dr-tb--nav">
                  <FiChevronLeft size={17} />
                  <span className="dr-tb-label">{t('documentReader.previous') || 'Prev'}</span>
                </button>
                <span className="dr-tb-page">{currentPage}<span className="dr-tb-sep">/</span>{totalPages}</span>
                <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= totalPages}
                  className="dr-tb dr-tb--nav dr-tb--next">
                  <span className="dr-tb-label">{t('documentReader.next') || 'Next'}</span>
                  <FiChevronRight size={17} />
                </button>
              </div>
            )}

            {hasPagination && <div className="dr-tb-div" />}

            {isTextOrHtml && (
              <div className="dr-tb-group">
                <button onClick={() => setFontSize(s => Math.max(13, s - 1))}
                  className="dr-tb dr-tb--icon" title={t('documentReader.zoomOut') || 'Zoom Out'}>
                  <FiMinus size={15} />
                </button>
                <span className="dr-tb-zoom">{fontSize}<span className="dr-tb-zoom-unit">px</span></span>
                <button onClick={() => setFontSize(s => Math.min(28, s + 1))}
                  className="dr-tb dr-tb--icon" title={t('documentReader.zoomIn') || 'Zoom In'}>
                  <FiPlus size={15} />
                </button>
              </div>
            )}

            {isTextOrHtml && <div className="dr-tb-div" />}

            <div className="dr-tb-group">
              <button onClick={toggleFullscreen} className="dr-tb dr-tb--icon"
                title={fullscreen ? t('documentReader.exitFullscreen') : t('documentReader.fullscreen')}>
                {fullscreen ? <FiMinimize size={15} /> : <FiMaximize size={15} />}
              </button>
              <button onClick={handleDownload} className="dr-tb dr-tb--accent"
                title={t('documentReader.download')}>
                <FiDownload size={15} />
              </button>
            </div>
          </div>
        </div>

      </div>

      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        book={doc}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <style>{`
/* ═══════════════════════════════════════════
   DOCUMENT READER — Premium Reading Experience
   ═══════════════════════════════════════════ */

/* ──── Loading Screen ──── */
.dr-loading {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f5f0e8;
  transition: background-color 0.3s ease;
}
.dark .dr-loading { background: #0c0a09; }

.dr-load-icon {
  width: 72px; height: 72px;
  border-radius: 18px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 20px;
  background: linear-gradient(135deg, rgba(180,83,9,0.12), rgba(180,83,9,0.04));
  animation: drGlow 2.2s ease-in-out infinite;
}
.dark .dr-load-icon {
  background: linear-gradient(135deg, rgba(251,191,36,0.14), rgba(251,191,36,0.04));
}
.dr-load-icon svg { color: #b45309; }
.dark .dr-load-icon svg { color: #fbbf24; }

.dr-load-text {
  font-size: 14px; font-weight: 500;
  color: #78716c; margin-bottom: 28px;
  letter-spacing: 0.01em;
}
.dark .dr-load-text { color: #a8a29e; }

.dr-load-skeleton {
  display: flex; flex-direction: column; gap: 10px; width: 220px;
}

.dr-skel {
  height: 8px; border-radius: 4px;
  background: linear-gradient(90deg, #e2ddd5 25%, #ede8e0 50%, #e2ddd5 75%);
  background-size: 200% 100%;
  animation: drShimmer 1.6s ease-in-out infinite;
}
.dark .dr-skel {
  background: linear-gradient(90deg, #292524 25%, #3a3530 50%, #292524 75%);
  background-size: 200% 100%;
}
.dr-skel--w75 { width: 72%; }
.dr-skel--w50 { width: 48%; }

@keyframes drGlow {
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(180,83,9,0.12); }
  50% { transform: scale(1.04); box-shadow: 0 0 0 14px rgba(180,83,9,0); }
}
@keyframes drShimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ──── Root Container ──── */
.dr {
  min-height: 100vh;
  display: flex; flex-direction: column;
  overflow-x: hidden;
  background: var(--r-bg);
}

/* ──── Header ──── */
.dr-hdr {
  position: sticky; top: 0; z-index: 40;
  background: var(--r-hdr-bg);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid var(--r-border-s);
}

.dr-hdr-row {
  max-width: 960px; margin: 0 auto;
  padding: 0 10px; height: 50px;
  display: flex; align-items: center; justify-content: space-between;
  gap: 8px;
}

.dr-hdr-left {
  display: flex; align-items: center;
  gap: 8px; min-width: 0; flex: 1;
}

.dr-back {
  flex-shrink: 0;
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 10px; color: var(--r-text2);
  transition: all 0.2s ease; cursor: pointer;
  background: none; border: none; padding: 0;
}
.dr-back:hover { color: var(--r-accent); background: var(--r-accent-s); }

.dr-hdr-info { min-width: 0; flex: 1; }

.dr-title {
  font-size: 13px; font-weight: 600; color: var(--r-text);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  line-height: 1.35; letter-spacing: -0.01em;
  margin: 0;
}
.dr-author {
  font-size: 11px; color: var(--r-text2);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  line-height: 1.3; margin: 1px 0 0;
}

.dr-badge {
  display: none; flex-shrink: 0;
  font-size: 10px; font-weight: 700;
  padding: 3px 9px; border-radius: 20px;
  background: var(--r-accent-s); color: var(--r-accent);
  letter-spacing: 0.04em; text-transform: uppercase;
}

.dr-hdr-right {
  display: flex; align-items: center;
  gap: 2px; flex-shrink: 0;
}

.dr-hbtn {
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 10px; color: var(--r-text2);
  background: none; border: none; padding: 0; cursor: pointer;
  transition: all 0.2s ease;
}
.dr-hbtn:hover { color: var(--r-accent); background: var(--r-accent-s); }

/* ──── Progress Bar ──── */
.dr-track {
  height: 2px;
  background: var(--r-ptrack);
}
.dr-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--r-accent), var(--r-accent-h));
  transition: width 0.4s cubic-bezier(0.4,0,0.2,1);
  border-radius: 0 1px 1px 0;
}

/* ──── Main Reading Area ──── */
.dr-main {
  flex: 1;
  padding: 16px 12px 80px;
  overflow-y: auto;
  scroll-behavior: smooth;
}

.dr-wrap {
  max-width: 820px; margin: 0 auto;
}

/* ──── Paper Container ──── */
.dr-paper {
  background: var(--r-surface);
  border: 1px solid var(--r-border);
  border-radius: 10px;
  box-shadow: var(--r-shadow-p);
  overflow: hidden;
  min-height: 55vh;
  transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

/* ──── Content (reading text) ──── */
.dr-content {
  padding: 28px 22px;
  font-size: 19px; line-height: 1.85;
  font-family: 'Georgia', 'Cambria', 'Times New Roman', serif;
  color: var(--r-text);
  animation: drFadeIn 0.4s ease;
}

.dr-content p {
  margin-bottom: 0.95em; text-indent: 1.8em;
}
.dr-content p:first-child { text-indent: 0; }
.dr-content p:first-child::first-letter {
  font-size: 1.15em; font-weight: 700;
  color: var(--r-accent);
}

.dr-content img {
  max-width: 100%; height: auto;
  border-radius: 8px; margin: 1.2em 0;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
}
.dark .dr-content img { box-shadow: 0 2px 10px rgba(0,0,0,0.3); }

@keyframes drFadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ──── Question Cards ──── */
.book-content { padding: 0.4em 0; }

.question {
  margin-bottom: 0.95em;
  padding: 12px 16px 12px 18px;
  background: var(--r-q-bg);
  border-left: 3px solid var(--r-q-bdr);
  border-radius: 0 8px 8px 0;
  transition: background 0.2s ease;
}

.q-num {
  font-weight: 700; color: var(--r-qnum);
  margin-right: 0.3em; font-size: 1.04em;
}
.q-text { color: inherit; }

.option {
  padding: 3px 0 3px 1.6em;
  color: var(--r-text2);
  transition: color 0.2s ease;
}
.opt-letter {
  font-weight: 600; color: var(--r-qnum);
  margin-right: 0.45em;
}

.para {
  margin-bottom: 0.85em; text-indent: 1.8em;
}

/* ──── PDF Viewer ──── */
.dr-pdf {
  display: block; width: 100%; border: none;
}

.dr-pdf-load {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 80px 24px;
}
.dr-spinner {
  width: 36px; height: 36px;
  border: 3px solid var(--r-border);
  border-top-color: var(--r-accent);
  border-radius: 50%;
  animation: drSpin 0.75s linear infinite;
  margin-bottom: 14px;
}
.dr-pdf-load-text {
  font-size: 13px; color: var(--r-text2);
}
@keyframes drSpin { to { transform: rotate(360deg); } }

/* ──── Empty State ──── */
.dr-empty {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 64px 24px; text-align: center;
}
.dr-empty-icon {
  width: 72px; height: 72px;
  border-radius: 18px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 18px;
  background: var(--r-accent-s); color: var(--r-accent);
}
.dr-empty-title {
  font-size: 17px; font-weight: 600;
  color: var(--r-text); margin-bottom: 6px;
}
.dr-empty-desc {
  font-size: 13px; color: var(--r-text2);
  margin-bottom: 24px; max-width: 340px;
  line-height: 1.55;
}
.dr-empty-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 22px; min-height: 44px;
  background: var(--r-accent); color: #fff;
  border: none; border-radius: 10px;
  font-size: 14px; font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.dr-empty-btn:hover { opacity: 0.9; transform: scale(1.02); }

/* ──── Floating Toolbar ──── */
.dr-toolbar {
  position: sticky; bottom: 0; z-index: 40;
  padding: 0 12px 10px;
  pointer-events: none;
}

.dr-pill {
  max-width: 540px; margin: 0 auto;
  display: flex; align-items: center; justify-content: center;
  gap: 2px; padding: 5px 8px;
  background: var(--r-tb-bg);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-radius: 14px;
  box-shadow: var(--r-shadow-lg);
  border: 1px solid var(--r-border-s);
  pointer-events: auto;
}

.dr-tb-group {
  display: flex; align-items: center; gap: 1px;
}

.dr-tb-div {
  width: 1px; height: 18px;
  background: var(--r-border);
  margin: 0 5px; flex-shrink: 0;
}

/* Toolbar buttons */
.dr-tb {
  display: flex; align-items: center; justify-content: center;
  gap: 5px; height: 34px;
  padding: 0 9px; border-radius: 9px;
  font-size: 12px; font-weight: 500;
  color: var(--r-text2);
  background: none; border: none; cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.dr-tb:hover { color: var(--r-text); background: var(--r-accent-s); }
.dr-tb:disabled { opacity: 0.25; pointer-events: none; }

.dr-tb--next {
  background: var(--r-accent-s); color: var(--r-accent);
}
.dr-tb--next:not(:disabled):hover {
  background: var(--r-accent); color: #fff;
}

.dr-tb--icon { padding: 0; width: 34px; }

.dr-tb--accent {
  background: var(--r-accent); color: #fff;
  padding: 0 11px;
}
.dr-tb--accent:hover { opacity: 0.88; transform: scale(1.04); }

.dr-tb-label { display: none; }

.dr-tb-page {
  font-size: 12px; font-weight: 600;
  color: var(--r-text);
  padding: 0 4px; white-space: nowrap;
  font-variant-numeric: tabular-nums;
  user-select: none;
}
.dr-tb-sep {
  margin: 0 3px; color: var(--r-text3); font-weight: 400;
}

.dr-tb-zoom {
  font-size: 11px; font-weight: 600;
  color: var(--r-text3);
  min-width: 26px; text-align: center;
  font-variant-numeric: tabular-nums;
  user-select: none;
}
.dr-tb-zoom-unit {
  font-size: 9px; font-weight: 500;
  opacity: 0.7; margin-left: 1px;
}

/* ──── Scrollbar ──── */
.dr-main::-webkit-scrollbar { width: 5px; }
.dr-main::-webkit-scrollbar-track { background: transparent; }
.dr-main::-webkit-scrollbar-thumb {
  background: var(--r-border); border-radius: 3px;
}
.dr-main::-webkit-scrollbar-thumb:hover {
  background: var(--r-text3);
}

/* ──── Selection ──── */
.dr ::selection {
  background: var(--r-psel);
}

/* ═══════════════════════════════════════════
   RESPONSIVE — Mobile  ≤ 480px
   ═══════════════════════════════════════════ */
@media (max-width: 480px) {
  .dr-hdr-row { height: 46px; padding: 0 8px; gap: 6px; }
  .dr-hdr-left { gap: 6px; }
  .dr-title { font-size: 12.5px; }
  .dr-author { font-size: 10.5px; }
  .dr-back { width: 34px; height: 34px; }
  .dr-hbtn { width: 34px; height: 34px; }

  .dr-main { padding: 10px 6px 72px; }

  .dr-paper {
    border-radius: 8px;
    min-height: 45vh;
  }

  .dr-content {
    padding: 18px 14px;
    font-size: 16px; line-height: 1.75;
  }
  .dr-content p { margin-bottom: 0.75em; text-indent: 1.4em; }
  .dr-content p:first-child { text-indent: 0; }
  .dr-content img { border-radius: 6px; margin: 0.8em 0; }

  .question {
    padding: 9px 11px 9px 13px;
    margin-bottom: 0.7em;
    border-radius: 0 6px 6px 0;
  }
  .option { padding-left: 1.2em; font-size: 0.96em; }
  .para { margin-bottom: 0.65em; }

  .dr-toolbar { padding: 0 6px 8px; }
  .dr-pill { padding: 4px 6px; border-radius: 12px; gap: 1px; }
  .dr-tb { height: 32px; padding: 0 7px; border-radius: 8px; }
  .dr-tb--icon { width: 32px; }
  .dr-tb--accent { padding: 0 9px; }
  .dr-tb-page { font-size: 11px; padding: 0 2px; }
  .dr-tb-zoom { font-size: 10px; min-width: 20px; }
  .dr-tb-div { height: 14px; margin: 0 3px; }

  .dr-empty { padding: 40px 20px; }
  .dr-empty-icon { width: 56px; height: 56px; border-radius: 14px; }
  .dr-empty-icon svg { font-size: 24px; }
  .dr-empty-title { font-size: 15px; }
  .dr-empty-desc { font-size: 12.5px; }
}

/* ═══════════════════════════════════════════
   RESPONSIVE — Tablet  481–768px
   ═══════════════════════════════════════════ */
@media (min-width: 481px) and (max-width: 768px) {
  .dr-hdr-row { height: 50px; padding: 0 14px; }
  .dr-title { font-size: 13.5px; }

  .dr-main { padding: 14px 10px 80px; }

  .dr-paper { border-radius: 10px; min-height: 50vh; }

  .dr-content { padding: 24px 20px; font-size: 17.5px; }

  .dr-tb-label { display: none; }
}

/* ═══════════════════════════════════════════
   RESPONSIVE — Laptop  769–1024px
   ═══════════════════════════════════════════ */
@media (min-width: 769px) {
  .dr-hdr-row { height: 54px; padding: 0 20px; gap: 12px; }
  .dr-title { font-size: 14.5px; }
  .dr-author { font-size: 12px; }
  .dr-badge { display: inline-flex; }

  .dr-main { padding: 24px 20px 88px; }

  .dr-paper { border-radius: 12px; min-height: 55vh; }

  .dr-content {
    padding: 36px 44px;
    font-size: 19px;
  }

  .dr-tb-label { display: inline; }
  .dr-tb { height: 36px; padding: 0 11px; }
  .dr-tb--icon { width: 36px; }
}

/* ═══════════════════════════════════════════
   RESPONSIVE — Desktop  ≥ 1025px
   ═══════════════════════════════════════════ */
@media (min-width: 1025px) {
  .dr-hdr-row { height: 56px; padding: 0 28px; }

  .dr-main { padding: 32px 24px 96px; }

  .dr-paper { border-radius: 14px; }

  .dr-content {
    padding: 48px 56px;
    font-size: 19.5px;
  }
  .dr-content p { margin-bottom: 1em; }

  .dr-pill { padding: 6px 10px; }
  .dr-tb { height: 38px; padding: 0 12px; }
  .dr-tb--icon { width: 38px; }
  .dr-tb--accent { padding: 0 14px; }
  .dr-tb-page { font-size: 13px; }
  .dr-tb-zoom { font-size: 12px; }
}
      `}</style>
    </>
  );
}

export default DocumentReader;
