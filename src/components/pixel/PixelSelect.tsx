import { useId, type CSSProperties, type ReactNode, type SelectHTMLAttributes } from 'react';

import { pixelColors, pixelSpacing, pixelTypography } from '../../theme/pixel';
import { PixelStack } from './PixelStack';
import { PixelText } from './PixelText';

interface PixelSelectBaseProps {
  label?: ReactNode;
  hint?: ReactNode;
}

const selectStyle: CSSProperties = {
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
  appearance: 'none',
  boxShadow: `inset 2px 2px 0 ${pixelColors.line}, inset -2px -2px 0 #232c3d`,
};

export interface PixelSelectProps
  extends SelectHTMLAttributes<HTMLSelectElement>,
    PixelSelectBaseProps {}

export const PixelSelect = ({ label, hint, id, style, children, ...props }: PixelSelectProps) => {
  const generatedId = useId();
  const selectId = id ?? `pixel-select-${generatedId}`;

  return (
    <PixelStack gap="xs">
      {label ? (
        <label htmlFor={selectId}>
          <PixelText as="span" size="xs" color="textMuted" uppercase>
            {label}
          </PixelText>
        </label>
      ) : null}
      <select {...props} id={selectId} style={{ ...selectStyle, ...style }}>
        {children}
      </select>
      {hint ? (
        <PixelText as="p" readable size="sm" color="textDim">
          {hint}
        </PixelText>
      ) : null}
    </PixelStack>
  );
};
