import type { CSSProperties, ReactNode, TextareaHTMLAttributes } from 'react';

import { pixelColors, pixelSpacing, pixelTypography } from '../../theme/pixel';
import { PixelStack } from './PixelStack';
import { PixelText } from './PixelText';

interface PixelTextareaBaseProps {
  label?: ReactNode;
  hint?: ReactNode;
}

const textareaStyle: CSSProperties = {
  width: '100%',
  minHeight: 108,
  resize: 'vertical',
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

export interface PixelTextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>,
    PixelTextareaBaseProps {}

export const PixelTextarea = ({
  label,
  hint,
  id,
  style,
  ...props
}: PixelTextareaProps) => (
  <PixelStack gap="xs">
    {label ? (
      <label htmlFor={id}>
        <PixelText as="span" size="xs" color="textMuted" uppercase>
          {label}
        </PixelText>
      </label>
    ) : null}
    <textarea {...props} id={id} style={{ ...textareaStyle, ...style }} />
    {hint ? (
      <PixelText as="p" readable size="sm" color="textDim">
        {hint}
      </PixelText>
    ) : null}
  </PixelStack>
);
