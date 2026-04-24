import type { CSSProperties } from 'react';

export const pixelColors = {
  canvas: '#10131A',
  background: '#161B24',
  panel: '#1F2633',
  panelRaised: '#283142',
  panelInset: '#121720',
  line: '#0B0E13',
  lineSoft: '#344157',
  accent: '#F7C948',
  accentMuted: '#A87819',
  accentGlow: '#FFF1B8',
  success: '#6EE7B7',
  danger: '#FF7A90',
  info: '#7DD3FC',
  text: '#F4F1DE',
  textMuted: '#B8C1CC',
  textDim: '#7E8A99',
} as const;

export const pixelSpacing = {
  none: 0,
  xxxs: 2,
  xxs: 4,
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const pixelFrames = {
  panel: {
    background: pixelColors.panel,
    borderLight: '#3F4A5F',
    borderDark: pixelColors.line,
    innerLight: '#617089',
    innerDark: '#151A24',
  },
  inset: {
    background: pixelColors.panelInset,
    borderLight: '#20283A',
    borderDark: '#06080C',
    innerLight: '#344157',
    innerDark: '#0E131C',
  },
  accent: {
    background: '#2C2312',
    borderLight: pixelColors.accentGlow,
    borderDark: pixelColors.accentMuted,
    innerLight: '#FFD879',
    innerDark: '#5A420D',
  },
  ghost: {
    background: 'transparent',
    borderLight: pixelColors.lineSoft,
    borderDark: pixelColors.line,
    innerLight: '#4D5A71',
    innerDark: '#10131A',
  },
} as const;

export const pixelTypography = {
  family: {
    base: '"Press Start 2P", "Pixelify Sans", "Courier New", monospace',
    readable: '"Pixelify Sans", "Trebuchet MS", sans-serif',
  },
  size: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 18,
    xl: 24,
  },
  lineHeight: {
    tight: 1.2,
    base: 1.45,
    relaxed: 1.6,
  },
  tracking: {
    normal: '0',
    tight: '0.04em',
    wide: '0.08em',
    widest: '0.14em',
  },
  weight: {
    regular: 400,
    medium: 500,
    bold: 700,
  },
} as const;

export const pixelRadii = {
  none: 0,
  sm: 2,
  md: 4,
} as const;

export const pixelCssVariables = {
  '--pixel-canvas': pixelColors.canvas,
  '--pixel-background': pixelColors.background,
  '--pixel-panel': pixelColors.panel,
  '--pixel-panel-raised': pixelColors.panelRaised,
  '--pixel-panel-inset': pixelColors.panelInset,
  '--pixel-line': pixelColors.line,
  '--pixel-line-soft': pixelColors.lineSoft,
  '--pixel-accent': pixelColors.accent,
  '--pixel-accent-muted': pixelColors.accentMuted,
  '--pixel-accent-glow': pixelColors.accentGlow,
  '--pixel-success': pixelColors.success,
  '--pixel-danger': pixelColors.danger,
  '--pixel-info': pixelColors.info,
  '--pixel-text': pixelColors.text,
  '--pixel-text-muted': pixelColors.textMuted,
  '--pixel-text-dim': pixelColors.textDim,
  '--pixel-font-display': pixelTypography.family.base,
  '--pixel-font-readable': pixelTypography.family.readable,
} as const;

export type PixelColorToken = keyof typeof pixelColors;
export type PixelSpacingToken = keyof typeof pixelSpacing;
export type PixelFrameToken = keyof typeof pixelFrames;
export type PixelTypographySizeToken = keyof typeof pixelTypography.size;
export type PixelTypographyLineHeightToken = keyof typeof pixelTypography.lineHeight;
export type PixelTypographyTrackingToken = keyof typeof pixelTypography.tracking;

export interface PixelFrameStyleOptions {
  frame?: PixelFrameToken;
  padding?: PixelSpacingToken;
}

export const applyPixelThemeCssVariables = (style: CSSStyleDeclaration) => {
  for (const [name, value] of Object.entries(pixelCssVariables)) {
    style.setProperty(name, value);
  }
};

export const createPixelFrameStyle = ({
  frame = 'panel',
  padding = 'lg',
}: PixelFrameStyleOptions = {}): CSSProperties => {
  const chrome = pixelFrames[frame];

  return {
    background: chrome.background,
    padding: pixelSpacing[padding],
    border: `${pixelRadii.sm}px solid ${chrome.borderDark}`,
    boxShadow: [
      `inset ${pixelRadii.sm}px ${pixelRadii.sm}px 0 ${chrome.borderLight}`,
      `inset -${pixelRadii.sm}px -${pixelRadii.sm}px 0 ${chrome.innerDark}`,
      `${pixelRadii.sm}px ${pixelRadii.sm}px 0 ${chrome.innerLight}`,
    ].join(', '),
    imageRendering: 'pixelated',
  };
};

export const pixelTheme = {
  colors: pixelColors,
  spacing: pixelSpacing,
  frames: pixelFrames,
  typography: pixelTypography,
  radii: pixelRadii,
  cssVariables: pixelCssVariables,
  applyCssVariables: applyPixelThemeCssVariables,
  createFrameStyle: createPixelFrameStyle,
} as const;
