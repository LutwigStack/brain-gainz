import type { HTMLAttributes, ReactNode } from 'react';

import { PixelStack } from './PixelStack';
import { PixelText } from './PixelText';

export interface PixelPanelHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  aside?: ReactNode;
}

export const PixelPanelHeader = ({
  eyebrow,
  title,
  description,
  aside,
  ...props
}: PixelPanelHeaderProps) => (
  <div {...props}>
    <div className="flex flex-wrap items-start justify-between gap-4">
      <PixelStack gap="xs">
        {eyebrow ? (
          <PixelText as="p" size="xs" color="textMuted" uppercase>
            {eyebrow}
          </PixelText>
        ) : null}
        <PixelText as="h3" size="lg" style={{ margin: 0 }}>
          {title}
        </PixelText>
        {description ? (
          <PixelText as="p" readable color="textMuted" size="sm" style={{ margin: 0 }}>
            {description}
          </PixelText>
        ) : null}
      </PixelStack>

      {aside ? <div>{aside}</div> : null}
    </div>
  </div>
);
