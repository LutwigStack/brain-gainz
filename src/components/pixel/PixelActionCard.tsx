import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { PixelSurface } from './PixelSurface';
import { PixelStack } from './PixelStack';
import { PixelText } from './PixelText';

export interface PixelActionCardProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'title'> {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  badges?: ReactNode;
  aside?: ReactNode;
  active?: boolean;
}

export const PixelActionCard = ({
  eyebrow,
  title,
  description,
  meta,
  badges,
  aside,
  active = false,
  style,
  ...props
}: PixelActionCardProps) => (
  <button
    {...props}
    style={{
      display: 'block',
      width: '100%',
      textAlign: 'left',
      background: 'transparent',
      border: 0,
      padding: 0,
      cursor: props.disabled ? 'not-allowed' : 'pointer',
      ...style,
    }}
  >
    <PixelSurface
      frame={active ? 'accent' : 'panel'}
      padding="md"
      style={{
        opacity: props.disabled ? 0.55 : 1,
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PixelStack gap="xs">
          {eyebrow ? (
            <PixelText as="p" size="xs" color="textDim" uppercase style={{ margin: 0 }}>
              {eyebrow}
            </PixelText>
          ) : null}
          <PixelText as="p" size="sm" style={{ margin: 0 }}>
            {title}
          </PixelText>
          {description ? (
            <PixelText as="p" readable size="sm" color="textMuted" style={{ margin: 0 }}>
              {description}
            </PixelText>
          ) : null}
          {badges ? <div className="mt-2 flex flex-wrap gap-2">{badges}</div> : null}
        </PixelStack>

        <PixelStack gap="xs" align="flex-end">
          {meta ? (
            <PixelText as="div" readable size="sm" color="textMuted" style={{ textAlign: 'right' }}>
              {meta}
            </PixelText>
          ) : null}
          {aside ? <div>{aside}</div> : null}
        </PixelStack>
      </div>
    </PixelSurface>
  </button>
);
