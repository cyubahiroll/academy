import { Link } from 'react-router-dom';
import { FiArrowRight, FiBook, FiAward, FiUsers } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import Slideshow from '../Slideshow/Slideshow';

function Hero() {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden bg-gray-950 min-h-[600px] lg:min-h-[85vh]" style={{ maxHeight: '900px' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16 h-full py-12 lg:py-0 min-h-[inherit]">

          {/* ── Left: Main Content ── */}
          <div className="w-full lg:w-[65%] text-white flex flex-col justify-center py-8 lg:py-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-white/90 mb-6 w-fit border border-white/10">
              <FiAward size={14} /> {t('hero.trustedBy')}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight tracking-tight">
              {t('hero.title')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                {t('hero.titleAccent')}
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/70 mb-8 sm:mb-10 max-w-2xl leading-relaxed">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/register"
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-all text-sm sm:text-lg shadow-xl shadow-black/20 hover:shadow-black/30 hover:-translate-y-0.5">
                {t('hero.getStarted')} <FiArrowRight size={20} />
              </Link>
              <Link to="/library"
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white/5 backdrop-blur-sm border border-white/15 text-white font-semibold rounded-xl hover:bg-white/10 transition-all text-sm sm:text-lg">
                <FiBook size={18} /> {t('hero.browseLibrary')}
              </Link>
            </div>

            <div className="flex gap-6 sm:gap-10 md:gap-14 mt-12 sm:mt-16 pt-8 border-t border-white/10">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">50+</div>
                <div className="text-xs sm:text-sm text-white/50 mt-1.5">{t('hero.videoLessons')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">200+</div>
                <div className="text-xs sm:text-sm text-white/50 mt-1.5">{t('hero.quizQuestions')}</div>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1.5">
                  <FiUsers className="text-white/50" size={18} />
                  <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">1,000+</span>
                </div>
                <div className="text-xs sm:text-sm text-white/50 mt-1.5">{t('hero.activeStudents')}</div>
              </div>
            </div>
          </div>

          {/* ── Right: Image Slideshow ── */}
          <div className="w-full lg:w-[35%] flex items-center justify-center lg:justify-end">
            <div className="w-full max-w-sm sm:max-w-md lg:max-w-none">
              <Slideshow
                interval={4000}
                showDots={true}
                showArrows={true}
                showCounter={true}
                showProgress={true}
                rounded={true}
                aspectRatio="3/4"
                overlay={false}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
