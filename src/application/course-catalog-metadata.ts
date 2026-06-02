export interface CourseCatalogNodeMetadata {
  kind: string;
  courseKey: string;
  atlasHubType?: string | null;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const parseCourseCatalogNodeMetadata = (links: string | null | undefined): CourseCatalogNodeMetadata | null => {
  if (!links) {
    return null;
  }

  try {
    const metadata: unknown = JSON.parse(links);
    if (!isRecord(metadata)) {
      return null;
    }

    const kind = typeof metadata.kind === 'string' ? metadata.kind.trim() : '';
    const courseKey = typeof metadata.courseKey === 'string' ? metadata.courseKey.trim() : '';
    if (!kind || !courseKey) {
      return null;
    }

    const normalizedKind = kind.toLowerCase();
    if (normalizedKind !== 'course' && !normalizedKind.endsWith('_course')) {
      return null;
    }

    return {
      kind,
      courseKey,
      atlasHubType: typeof metadata.atlasHubType === 'string' ? metadata.atlasHubType : null,
    };
  } catch {
    return null;
  }
};

export const isCourseCatalogNodeMetadata = (links: string | null | undefined) =>
  parseCourseCatalogNodeMetadata(links) !== null;
