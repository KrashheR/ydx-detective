import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { GameLoaderProps } from './types';

const loaderAsset = (filename: string) => `${import.meta.env.BASE_URL}game-loader/${filename}`;
const desktopBackground = loaderAsset('loader-bg-desktop.webp');
const mobileBackground = loaderAsset('loader-bg-mobile.webp');

const clamp = (value: number) => Math.min(100, Math.max(0, value));

export function GameLoader({
  visible,
  progress,
  backgroundDesktopSrc = desktopBackground,
  backgroundMobileSrc = mobileBackground,
  className = '',
  style,
  zIndex = 9999,
  onExited,
}: GameLoaderProps) {
  const reduceMotion = useReducedMotion();
  const safeProgress = clamp(progress);
  const roundedProgress = Math.round(safeProgress);

  return (
    <AnimatePresence onExitComplete={onExited}>
      {visible ? (
        <motion.section
          key="game-loader"
          className={`game-loader ${className}`.trim()}
          style={{ ...style, zIndex }}
          role="status"
          aria-live="polite"
          // The splash carries no copy, so the only accessible name it can own
          // is the language-neutral percentage.
          aria-label={`${roundedProgress}%`}
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
            className="game-loader__status-card"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.16, duration: 0.38, ease: 'easeOut' }}
          >
            <div className="game-loader__status-row">
              <span className="game-loader__percent" aria-hidden="true">
                {roundedProgress}%
              </span>
            </div>

            <div
              className="game-loader__track"
              role="progressbar"
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
          </motion.div>
        </motion.section>
      ) : null}
    </AnimatePresence>
  );
}
