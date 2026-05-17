import { useState, type ReactNode } from 'react';

import type { ReferenceAsset } from './referenceStyleAssets';

export const ReferenceAssetImage = ({
  asset,
  className,
  fallback,
  decorative = false,
}: {
  asset: ReferenceAsset | null | undefined;
  className?: string;
  fallback: ReactNode;
  decorative?: boolean;
}) => {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = Boolean(asset?.src && failedSrc === asset.src);

  if (!asset || failed) {
    return <>{fallback}</>;
  }

  return (
    <img
      src={asset.src}
      width={asset.width}
      height={asset.height}
      alt={decorative ? '' : asset.alt}
      aria-hidden={decorative || undefined}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setFailedSrc(asset.src)}
    />
  );
};
