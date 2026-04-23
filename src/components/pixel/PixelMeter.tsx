import type { CSSProperties, HTMLAttributes } from 'react';
import { PixelStack } from './PixelStack';
import { PixelSurface } from './PixelSurface';
import { PixelText } from './PixelText';
import { pixelColors } from '../../theme/pixel';

export interface PixelMeterProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  label?: string;
  tone?: 'accent' | 'success' | 'danger' | 'info';
  showValue?: boolean;
}

const toneMap = {
  accent: pixelColors.accent,
  success: pixelColors.success,
  danger: pixelColors.danger,
  info: pixelColors.info,
} as const;

export const PixelMeter = ({
  value,
  max = 100,
  label,
  tone = 'accent',
  showValue = true,
  style,
  ...props
}: PixelMeterProps) => {
  const safeMax = max <= 0 ? 1 : max;
  const clamped = Math.min(Math.max(value, 0), safeMax);
  const percent = Math.round((clamped / safeMax) * 100);

  const fillStyle: CSSProperties = {
    width: `${percent}%`,
    height: 12,
    background: toneMap[tone],
    boxShadow: `inset 2px 2px 0 ${pixelColors.accentGlow}, inset -2px -2px 0 ${pixelColors.line}`,
  };

  return (
    <PixelStack
      gap="xs"
      style={style}
      role="meter"
      aria-label={label ?? 'Meter'}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={clamped}
      {...props}
    >
      {(label || showValue) && (
        <PixelStack direction="row" justify="space-between" align="center" gap="sm">
          <PixelText as="span" size="xs" color="textMuted" uppercase>
            {label ?? 'Meter'}
          </PixelText>
          {showValue && (
            <PixelText as="span" size="xs" color="accent">
              {clamped}/{safeMax}
            </PixelText>
          )}
        </PixelStack>
      )}

      <PixelSurface frame="inset" padding="xxs">
        <div
          aria-hidden="true"
          style={{
            width: '100%',
            height: 12,
            background: pixelColors.panelInset,
            overflow: 'hidden',
          }}
        >
          <div style={fillStyle} />
        </div>
      </PixelSurface>
    </PixelStack>
  );
};
