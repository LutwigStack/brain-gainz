import type { CSSProperties, HTMLAttributes, PropsWithChildren } from 'react';
import { pixelSpacing, type PixelSpacingToken } from '../../theme/pixel';

export interface PixelStackProps extends PropsWithChildren, HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'column';
  gap?: PixelSpacingToken;
  align?: CSSProperties['alignItems'];
  justify?: CSSProperties['justifyContent'];
  wrap?: CSSProperties['flexWrap'];
}

export const PixelStack = ({
  children,
  direction = 'column',
  gap = 'md',
  align = 'stretch',
  justify = 'flex-start',
  wrap = 'nowrap',
  style,
  ...props
}: PixelStackProps) => {
  const stackStyle: CSSProperties = {
    display: 'flex',
    flexDirection: direction,
    gap: pixelSpacing[gap],
    alignItems: align,
    justifyContent: justify,
    flexWrap: wrap,
    ...style,
  };

  return (
    <div {...props} style={stackStyle}>
      {children}
    </div>
  );
};
