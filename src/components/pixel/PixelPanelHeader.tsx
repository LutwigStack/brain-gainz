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
    <div className="flex min-w-0 flex-wrap items-start justify-between gap-4">
      <PixelStack gap="xs" className="min-w-0">
        {eyebrow ? (
          <PixelText as="p" size="xs" color="textMuted" uppercase>
            {eyebrow}
          </PixelText>
        ) : null}
        <PixelText as="h3" readable size="lg" style={{ margin: 0, fontWeight: 700 }}>
          {title}
        </PixelText>
        {description ? (
          <PixelText as="p" readable color="textMuted" size="sm" style={{ margin: 0 }}>
            {description}
          </PixelText>
        ) : null}
      </PixelStack>

      {aside ? <div className="min-w-0">{aside}</div> : null}
    </div>
  </div>
);
