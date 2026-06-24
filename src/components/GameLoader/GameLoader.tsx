import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { getLoaderCopy } from '../../i18n/ui';
import type { GameLoaderProps, LoaderCopy } from './types';

const loaderAsset = (filename: string) => `${import.meta.env.BASE_URL}game-loader/${filename}`;
const desktopBackground = loaderAsset('loader-bg-desktop.webp');
const mobileBackground = loaderAsset('loader-bg-mobile.webp');

const clamp = (value: number) => Math.min(100, Math.max(0, value));

function mergeCopy(base: LoaderCopy, override?: Partial<LoaderCopy>): LoaderCopy {
  return {
    ...base,
    ...override,
    phases: {
      ...base.phases,
      ...override?.phases,
    },
  };
}

export function GameLoader({
  visible,
  progress,
  locale = 'ru',
  phase = 'content',
  copy: copyOverride,
  backgroundDesktopSrc = desktopBackground,
  backgroundMobileSrc = mobileBackground,
  showTip = true,
  className = '',
  style,
  zIndex = 9999,
  onExited,
}: GameLoaderProps) {
  const reduceMotion = useReducedMotion();
  const copy = mergeCopy(getLoaderCopy(locale), copyOverride);
  const safeProgress = clamp(progress);
  const roundedProgress = Math.round(safeProgress);
  const isRtl = locale === 'ar';

  return (
    <AnimatePresence onExitComplete={onExited}>
      {visible ? (
        <motion.section
          key="game-loader"
          className={`game-loader ${className}`.trim()}
          style={{ ...style, zIndex }}
          role="status"
          aria-live="polite"
          aria-label={`${copy.phases[phase]} ${roundedProgress}%`}
          dir={isRtl ? 'rtl' : 'ltr'}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.012 }}
          transition={{ duration: 0.34, ease: 'easeOut' }}
        >
          <picture className="game-loader__background" aria-hidden="true">
            <source media="(max-width: 700px), (orientation: portrait)" srcSet={backgroundMobileSrc} />
            <img src={backgroundDesktopSrc} alt="" draggable={false} />
          </picture>

          <div className="game-loader__wash" aria-hidden="true" />
          <div className="game-loader__vignette" aria-hidden="true" />

          <motion.div
            className="game-loader__brand"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.08, duration: 0.42, ease: 'easeOut' }}
          >
            <h1 className="game-loader__title">
              <span>{copy.title.replace(/[?؟]/g, '').trim()}</span>
              <motion.span
                className="game-loader__question"
                aria-hidden="true"
                animate={reduceMotion ? undefined : { rotate: [-2, 2, -2], scale: [1, 1.035, 1] }}
                transition={{ duration: 2.25, repeat: Infinity, ease: 'easeInOut' }}
              >
                {isRtl ? '؟' : '?'}
              </motion.span>
            </h1>

            <div className="game-loader__subtitle">{copy.subtitle}</div>

            <motion.div
              className="game-loader__stamp"
              initial={reduceMotion ? false : { opacity: 0, scale: 1.12, rotate: -9 }}
              animate={{ opacity: 0.92, scale: 1, rotate: isRtl ? 6 : -6 }}
              transition={{ delay: 0.22, type: 'spring', stiffness: 170, damping: 15 }}
            >
              {copy.stamp}
            </motion.div>
          </motion.div>

          <motion.div
            className="game-loader__status-card"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.16, duration: 0.38, ease: 'easeOut' }}
          >
            <div className="game-loader__status-row">
              <motion.span
                key={phase}
                initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {copy.phases[phase]}
              </motion.span>

              <span className="game-loader__percent" aria-hidden="true">
                {roundedProgress}%
              </span>
            </div>

            <div
              className="game-loader__track"
              role="progressbar"
              aria-label={copy.phases[phase]}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={roundedProgress}
            >
              <motion.div
                className="game-loader__fill"
                initial={false}
                animate={{ width: `${safeProgress}%` }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 72, damping: 19, mass: 0.65 }
                }
              >
                {!reduceMotion ? (
                  <motion.span
                    className="game-loader__shine"
                    aria-hidden="true"
                    animate={{ x: ['-120%', '260%'] }}
                    transition={{ duration: 1.7, repeat: Infinity, ease: 'linear' }}
                  />
                ) : null}
              </motion.div>
            </div>

            {showTip ? (
              <p className="game-loader__tip">
                <span aria-hidden="true" className="game-loader__tip-icon">⌕</span>
                <span>{copy.tip}</span>
              </p>
            ) : null}
          </motion.div>
        </motion.section>
      ) : null}
    </AnimatePresence>
  );
}
