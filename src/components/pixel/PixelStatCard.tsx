import type { HTMLAttributes, ReactNode } from 'react';

import { PixelSurface } from './PixelSurface';
import { PixelText } from './PixelText';

export interface PixelStatCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: ReactNode;
  tone?: 'panel' | 'inset' | 'ghost';
  compact?: boolean;
}

export const PixelStatCard = ({
  label,
  value,
  tone = 'panel',
  compact = false,
  ...props
}: PixelStatCardProps) => (
  <PixelSurface frame={tone} padding={compact ? 'xxs' : 'md'} {...props}>
    <PixelText as="p" size="xs" color="textDim" uppercase style={{ margin: 0, lineHeight: 1 }}>
      {label}
    </PixelText>
    <PixelText
      as="p"
      size={compact ? 'sm' : 'lg'}
      lineHeight="tight"
      style={{ margin: compact ? '4px 0 0' : '10px 0 0' }}
    >
      {value}
    </PixelText>
  </PixelSurface>
);
