import type { ButtonHTMLAttributes, CSSProperties, PropsWithChildren } from 'react';
import { pixelColors, pixelSpacing, pixelTypography } from '../../theme/pixel';

type PixelButtonTone = 'panel' | 'accent' | 'ghost' | 'success' | 'warning' | 'danger';

export interface PixelButtonProps extends PropsWithChildren, ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: PixelButtonTone;
  fullWidth?: boolean;
}

const toneStyles: Record<PixelButtonTone, CSSProperties> = {
  panel: {
    background: '#232B39',
    color: pixelColors.text,
    borderColor: '#4e5a71',
    boxShadow: `inset 0 1px 0 rgba(184, 193, 204, 0.18)`,
  },
  accent: {
    background: '#5f4610',
    color: pixelColors.accentGlow,
    borderColor: pixelColors.accentMuted,
    boxShadow: `inset 2px 2px 0 ${pixelColors.accentGlow}, inset -2px -2px 0 #2a1f07, 2px 2px 0 ${pixelColors.line}`,
  },
  ghost: {
    background: 'transparent',
    color: pixelColors.textMuted,
    borderColor: pixelColors.lineSoft,
    boxShadow: 'none',
  },
  success: {
    background: 'rgba(110, 231, 183, 0.1)',
    color: pixelColors.success,
    borderColor: pixelColors.success,
    boxShadow: `inset 0 1px 0 rgba(110, 231, 183, 0.2)`,
  },
  warning: {
    background: 'rgba(245, 158, 11, 0.1)',
    color: pixelColors.warning,
    borderColor: pixelColors.warning,
    boxShadow: `inset 0 1px 0 rgba(245, 158, 11, 0.2)`,
  },
  danger: {
    background: 'rgba(255, 122, 144, 0.08)',
    color: pixelColors.danger,
    borderColor: pixelColors.danger,
    boxShadow: `inset 0 1px 0 rgba(255, 122, 144, 0.22)`,
  },
};

export const PixelButton = ({
  children,
  tone = 'panel',
  fullWidth = false,
  disabled = false,
  style,
  ...props
}: PixelButtonProps) => {
  const buttonStyle: CSSProperties = {
    ...toneStyles[tone],
    width: fullWidth ? '100%' : undefined,
    minHeight: 40,
    padding: `${pixelSpacing.sm}px ${pixelSpacing.lg}px`,
    borderStyle: 'solid',
    borderWidth: 2,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: pixelSpacing.sm,
    minWidth: 0,
    maxWidth: '100%',
    fontFamily: pixelTypography.family.base,
    fontSize: pixelTypography.size.xs,
    lineHeight: pixelTypography.lineHeight.tight,
    letterSpacing: pixelTypography.tracking.normal,
    textTransform: 'uppercase',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.55 : 1,
    imageRendering: 'pixelated',
    transition: 'transform 120ms ease, opacity 120ms ease',
    whiteSpace: 'normal',
    overflowWrap: 'anywhere',
    textAlign: 'center',
    ...style,
  };

  return (
    <button {...props} disabled={disabled} style={buttonStyle}>
      {children}
    </button>
  );
};
