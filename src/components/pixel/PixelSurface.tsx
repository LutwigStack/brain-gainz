import { forwardRef, type CSSProperties, type HTMLAttributes, type PropsWithChildren } from 'react';
import { createPixelFrameStyle, pixelColors, type PixelFrameToken, type PixelSpacingToken } from '../../theme/pixel';

export interface PixelSurfaceProps extends PropsWithChildren, HTMLAttributes<HTMLDivElement> {
  frame?: PixelFrameToken;
  padding?: PixelSpacingToken;
  fullWidth?: boolean;
}

export const PixelSurface = forwardRef<HTMLDivElement, PixelSurfaceProps>(({
  children,
  frame = 'panel',
  padding = 'lg',
  fullWidth = true,
  className,
  style,
  ...props
}, ref) => {
  const surfaceStyle: CSSProperties = {
    ...createPixelFrameStyle({ frame, padding }),
    color: pixelColors.text,
    width: fullWidth ? '100%' : undefined,
    position: 'relative',
    ...style,
  };

  return (
    <div ref={ref} {...props} className={className} data-pixel-frame={frame} style={surfaceStyle}>
      {children}
    </div>
  );
});

PixelSurface.displayName = 'PixelSurface';
