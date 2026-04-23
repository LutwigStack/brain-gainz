import type { CSSProperties, InputHTMLAttributes, ReactNode } from 'react';

import { pixelColors, pixelSpacing, pixelTypography } from '../../theme/pixel';
import { PixelStack } from './PixelStack';
import { PixelText } from './PixelText';

interface PixelControlBaseProps {
  label?: ReactNode;
  hint?: ReactNode;
}

const controlStyle: CSSProperties = {
  width: '100%',
  minHeight: 42,
  border: `2px solid ${pixelColors.lineSoft}`,
  background: pixelColors.panelInset,
  color: pixelColors.text,
  padding: `${pixelSpacing.sm}px ${pixelSpacing.lg}px`,
  fontFamily: pixelTypography.family.readable,
  fontSize: pixelTypography.size.sm,
  lineHeight: pixelTypography.lineHeight.base,
  outline: 'none',
  boxShadow: `inset 2px 2px 0 ${pixelColors.line}, inset -2px -2px 0 #232c3d`,
};

export interface PixelInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    PixelControlBaseProps {}

export const PixelInput = ({ label, hint, id, style, ...props }: PixelInputProps) => (
  <PixelStack gap="xs">
    {label ? (
      <label htmlFor={id}>
        <PixelText as="span" size="xs" color="textMuted" uppercase>
          {label}
        </PixelText>
      </label>
    ) : null}
    <input {...props} id={id} style={{ ...controlStyle, ...style }} />
    {hint ? (
      <PixelText as="p" readable size="sm" color="textDim">
        {hint}
      </PixelText>
    ) : null}
  </PixelStack>
);
