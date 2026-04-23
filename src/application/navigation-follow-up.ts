import type { JournalFollowUpPayload } from '../types/app-shell';

export const createNavigationFollowUpPayload = ({
  nodeId,
  title,
  nodeTitle,
  note,
  barrierType,
}: {
  nodeId: number;
  title?: string | null;
  nodeTitle?: string | null;
  note?: string | null;
  barrierType?: JournalFollowUpPayload['barrierType'];
}): JournalFollowUpPayload => {
  const trimmedTitle = title?.trim();
  const trimmedNote = note?.trim();

  return {
    nodeId,
    title: trimmedTitle || `Следующий шаг: ${nodeTitle?.trim() || 'узел'}`,
    note: trimmedNote ? trimmedNote : undefined,
    barrierType: barrierType ?? null,
  };
};
