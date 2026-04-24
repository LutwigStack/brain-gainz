import type { ButtonHTMLAttributes, CSSProperties, PropsWithChildren } from 'react';
import { pixelColors, pixelSpacing, pixelTypography, type PixelFrameToken } from '../../theme/pixel';

type PixelButtonTone = 'panel' | 'accent' | 'ghost';

export interface PixelButtonProps extends PropsWithChildren, ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: PixelButtonTone;
  fullWidth?: boolean;
}

const toneStyles: Record<PixelButtonTone, CSSProperties> = {
  panel: {
    background: pixelColors.panelRaised,
    color: pixelColors.text,
    borderColor: '#4e5a71',
    boxShadow: `inset 2px 2px 0 #72819a, inset -2px -2px 0 ${pixelColors.line}, 2px 2px 0 ${pixelColors.lineSoft}`,
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
    boxShadow: `inset 2px 2px 0 #4e5a71, inset -2px -2px 0 ${pixelColors.line}`,
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
    fontFamily: pixelTypography.family.base,
    fontSize: pixelTypography.size.xs,
    lineHeight: pixelTypography.lineHeight.tight,
    letterSpacing: pixelTypography.tracking.normal,
    textTransform: 'uppercase',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.55 : 1,
    imageRendering: 'pixelated',
    transition: 'transform 120ms ease, opacity 120ms ease',
    ...style,
  };

  return (
    <button {...props} disabled={disabled} style={buttonStyle}>
      {children}
    </button>
  );
};
