import { clsx } from 'clsx';
import { useCallback, useEffect, useRef, useState } from 'react';

import * as styles from './image.module.css';

import type { FC } from 'react';

type BaseProps = {
  alt: string;
  loading?: 'lazy' | 'eager';
};

// One source per breakpoint of app/styles/mediaqueries.css, mobile first:
// `base` under --sm, `sm` from --sm, `md` from --md, `lg` from --lg.
type ResponsiveSources = {
  base: string;
  sm: string;
  md: string;
  lg: string;
};

type SimpleProps = BaseProps & { src: string };

type ResponsiveProps = BaseProps & { sources: ResponsiveSources };

type Props = SimpleProps | ResponsiveProps;

const isResponsive = (props: Props): props is ResponsiveProps =>
  'sources' in props;

/**
 * Renders a blur-up image. The simple variant (`src`) flows at the image's
 * intrinsic dimensions. The responsive variant (`sources`) renders into a fixed
 * 16/9 box (see `.mediabox` in image.module.css) with object-fit: cover, so
 * sources whose intrinsic ratio differs are cropped to fill.
 */
export const Image: FC<Props> = (props) => {
  const loading = props.loading ?? 'lazy';
  const activeSrc = isResponsive(props) ? props.sources.lg : props.src;

  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const ref = useCallback((img: HTMLImageElement | null) => {
    imgRef.current = img;
    if (img?.complete && img.naturalHeight > 0) {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalHeight > 0) {
      setLoaded(true);
    } else {
      setLoaded(false);
    }
    // oxlint-disable-next-line react/exhaustive-effect-dependencies -- activeSrc triggers re-check on source change
  }, [activeSrc]);

  const onLoad = useCallback(() => setLoaded(true), []);

  if (isResponsive(props)) {
    const { alt } = props;
    const { base, sm, md, lg } = props.sources;
    return (
      <div className={styles.mediabox}>
        <picture>
          <source media="(width < 37.5em)" srcSet={base} />
          <source media="(width < 56.25em)" srcSet={sm} />
          <source media="(width < 75em)" srcSet={md} />
          <img
            ref={ref}
            className={clsx(styles.mediaboxImg, !loaded && styles.blur)}
            src={lg}
            onLoad={onLoad}
            loading={loading}
            decoding="async"
            alt={alt}
          />
        </picture>
      </div>
    );
  }

  return (
    <img
      ref={ref}
      className={clsx(styles.simple, !loaded && styles.blur)}
      src={props.src}
      onLoad={onLoad}
      loading={loading}
      decoding="async"
      alt={props.alt}
    />
  );
};
