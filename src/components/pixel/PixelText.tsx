import type { CSSProperties, ElementType, HTMLAttributes, PropsWithChildren } from 'react';
import {
  pixelColors,
  pixelTypography,
  type PixelColorToken,
  type PixelTypographyLineHeightToken,
  type PixelTypographySizeToken,
  type PixelTypographyTrackingToken,
} from '../../theme/pixel';

export interface PixelTextProps extends PropsWithChildren, HTMLAttributes<HTMLElement> {
  as?: ElementType;
  color?: PixelColorToken;
  size?: PixelTypographySizeToken;
  lineHeight?: PixelTypographyLineHeightToken;
  tracking?: PixelTypographyTrackingToken;
  readable?: boolean;
  uppercase?: boolean;
}

export const PixelText = ({
  as: Component = 'span',
  children,
  color = 'text',
  size = 'sm',
  lineHeight = 'base',
  tracking = 'wide',
  readable = false,
  uppercase = false,
  style,
  ...props
}: PixelTextProps) => {
  const textStyle: CSSProperties = {
    color: pixelColors[color],
    fontFamily: readable ? pixelTypography.family.readable : pixelTypography.family.base,
    fontSize: pixelTypography.size[size],
    lineHeight: pixelTypography.lineHeight[lineHeight],
    letterSpacing: pixelTypography.tracking[tracking],
    fontWeight: pixelTypography.weight.bold,
    textTransform: uppercase ? 'uppercase' : undefined,
    margin: 0,
    ...style,
  };

  return (
    <Component {...props} style={textStyle}>
      {children}
    </Component>
  );
};
