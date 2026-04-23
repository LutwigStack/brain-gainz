import type { CSSProperties, HTMLAttributes, PropsWithChildren } from 'react';
import { createPixelFrameStyle, pixelColors, type PixelFrameToken, type PixelSpacingToken } from '../../theme/pixel';

export interface PixelSurfaceProps extends PropsWithChildren, HTMLAttributes<HTMLDivElement> {
  frame?: PixelFrameToken;
  padding?: PixelSpacingToken;
  fullWidth?: boolean;
}

export const PixelSurface = ({
  children,
  frame = 'panel',
  padding = 'lg',
  fullWidth = true,
  style,
  ...props
}: PixelSurfaceProps) => {
  const surfaceStyle: CSSProperties = {
    ...createPixelFrameStyle({ frame, padding }),
    color: pixelColors.text,
    display: 'block',
    width: fullWidth ? '100%' : undefined,
    position: 'relative',
    ...style,
  };

  return (
    <div {...props} style={surfaceStyle}>
      {children}
    </div>
  );
};
