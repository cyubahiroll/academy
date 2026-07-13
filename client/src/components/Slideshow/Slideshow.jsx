import { useState, useEffect, useCallback, useRef } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './Slideshow.css';

const imageModules = import.meta.glob('../../image/*.{jpg,jpeg,png,gif,webp,avif,jfif}', { eager: true });

const loadedImages = Object.entries(imageModules)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([, mod]) => mod.default);

function Slideshow({
  images = loadedImages,
  interval = 4000,
  className = '',
  showDots = true,
  showArrows = true,
  showCounter = true,
  showProgress = true,
  rounded = true,
  aspectRatio = '16/9',
  overlay = false,
  overlayClassName = '',
  children,
}) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [imageStatus, setImageStatus] = useState({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const timerRef = useRef(null);
  const progressRef = useRef(null);
  const [progress, setProgress] = useState(0);

  const total = images.length;

  // Preload images
  useEffect(() => {
    images.forEach((src, i) => {
      if (imageStatus[i]) return;
      const img = new Image();
      img.onload = () => setImageStatus(prev => ({ ...prev, [i]: 'loaded' }));
      img.onerror = () => setImageStatus(prev => ({ ...prev, [i]: 'error' }));
      img.src = src;
    });
  }, [images]);

  const goTo = useCallback((index) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setProgress(0);
    setCurrent(index);
    setTimeout(() => setIsTransitioning(false), 800);
  }, [isTransitioning]);

  const goNext = useCallback(() => {
    goTo((current + 1) % total);
  }, [current, total, goTo]);

  const goPrev = useCallback(() => {
    goTo((current - 1 + total) % total);
  }, [current, total, goTo]);

  // Autoplay timer
  useEffect(() => {
    if (isPaused || total <= 1) {
      clearInterval(timerRef.current);
      cancelAnimationFrame(progressRef.current);
      return;
    }

    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / interval) * 100, 100);
      setProgress(pct);

      if (elapsed >= interval) {
        goNext();
        return;
      }
      progressRef.current = requestAnimationFrame(tick);
    };

    progressRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(progressRef.current);
    };
  }, [isPaused, goNext, interval, total, current]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev]);

  // Touch gestures
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      diff > 0 ? goNext() : goPrev();
    }
  };

  if (total === 0) return null;

  return (
    <div
      className={`slideshow ${rounded ? 'slideshow--rounded' : ''} ${className}`}
      style={{ aspectRatio }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-label="Image slideshow"
      aria-roledescription="carousel"
    >
      <div className="slideshow__viewport">
        {images.map((src, i) => (
          <div
            key={i}
            className={`slideshow__slide ${i === current ? 'slideshow__slide--active' : ''}`}
            aria-hidden={i !== current}
            role="group"
            aria-roledescription="slide"
            aria-label={`Slide ${i + 1} of ${total}`}
          >
            {imageStatus[i] === 'error' ? (
              <div className="slideshow__placeholder">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <span>Image not available</span>
              </div>
            ) : (
              <>
                {imageStatus[i] !== 'loaded' && (
                  <div className="slideshow__loader">
                    <div className="slideshow__spinner" />
                  </div>
                )}
                <img
                  src={src}
                  alt={`Slide ${i + 1}`}
                  className={`slideshow__image ${imageStatus[i] === 'loaded' ? 'slideshow__image--loaded' : ''}`}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  draggable={false}
                />
              </>
            )}
          </div>
        ))}

        {overlay && (
          <div className={`slideshow__overlay ${overlayClassName}`} />
        )}

        {children && (
          <div className="slideshow__content">
            {children}
          </div>
        )}
      </div>

      {showArrows && total > 1 && (
        <>
          <button
            className="slideshow__arrow slideshow__arrow--prev"
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            aria-label="Previous slide"
            type="button"
          >
            <FiChevronLeft size={20} />
          </button>
          <button
            className="slideshow__arrow slideshow__arrow--next"
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            aria-label="Next slide"
            type="button"
          >
            <FiChevronRight size={20} />
          </button>
        </>
      )}

      {showDots && total > 1 && (
        <div className="slideshow__dots" role="tablist" aria-label="Slide navigation">
          {images.map((_, i) => (
            <button
              key={i}
              className={`slideshow__dot ${i === current ? 'slideshow__dot--active' : ''}`}
              onClick={(e) => { e.stopPropagation(); goTo(i); }}
              role="tab"
              aria-selected={i === current}
              aria-label={`Go to slide ${i + 1}`}
              type="button"
            />
          ))}
        </div>
      )}

      {showCounter && total > 1 && (
        <div className="slideshow__counter" aria-live="polite">
          {current + 1} / {total}
        </div>
      )}

      {showProgress && total > 1 && !isPaused && (
        <div className="slideshow__progress">
          <div
            className="slideshow__progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {isPaused && (
        <div className="slideshow__pause-indicator" aria-hidden="true">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1"/>
            <rect x="14" y="4" width="4" height="16" rx="1"/>
          </svg>
          Paused
        </div>
      )}
    </div>
  );
}

export default Slideshow;
