import type { HTMLAttributes, ReactNode } from 'react';

import { PixelSurface } from './PixelSurface';
import { PixelText } from './PixelText';

export interface PixelStatCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: ReactNode;
  tone?: 'panel' | 'inset' | 'ghost';
}

export const PixelStatCard = ({
  label,
  value,
  tone = 'panel',
  ...props
}: PixelStatCardProps) => (
  <PixelSurface frame={tone} padding="md" {...props}>
    <PixelText as="p" size="xs" color="textDim" uppercase style={{ margin: 0 }}>
      {label}
    </PixelText>
    <PixelText as="p" size="lg" style={{ margin: '10px 0 0' }}>
      {value}
    </PixelText>
  </PixelSurface>
);
