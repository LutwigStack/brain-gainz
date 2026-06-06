/**
 * Sphere catalog slug → token key map — Epic 41.
 *
 * The catalog slugs come from the existing course-catalog modules
 * (`nlh-cash-course-catalog.ts` and `cs-bachelor-course-catalog.ts`).
 * The `campaign_stats.key` field that feeds the WindRose is the same
 * slug, so this map is the only place where the catalog vocabulary
 * meets the design-token vocabulary.
 *
 * The 8 sphere tokens (code, math, navigation, systems, data,
 * engineering, society, projects) are documented in
 * `sphere-tokens.ts`. The CS bachelor catalog is the only catalog
 * whose 8 regions map 1:1 to the 8 sphere tokens; the NLH cash
 * catalog has 11 regions and is not yet wired into the sphere palette
 * (the slug is left in the catalog and is not present in this map —
 * the WindRose falls back to a neutral infra color for those stats
 * and the failure is reported by the test if a future PR adds a
 * sphere that is not in the map).
 *
 * Every key in the map MUST be unique; every value MUST be a key of
 * `sphereTokens`. A small `assertSphereMap` helper enforces both at
 * module load so that a future typo breaks the build immediately
 * rather than at runtime.
 */
import {
  SPHERE_TOKEN_COUNT,
  SPHERE_TOKEN_ORDER,
  sphereTokens,
  type SphereTokenKey,
} from './sphere-tokens.ts';

export type SphereCatalogSlug =
  | 'programming'
  | 'mathematics'
  | 'algorithms-theory'
  | 'computer-systems'
  | 'data-ai'
  | 'software-product'
  | 'society-ethics-law'
  | 'projects';

export const sphereIdToToken: Record<SphereCatalogSlug, SphereTokenKey> = {
  programming: 'code',
  mathematics: 'math',
  'algorithms-theory': 'navigation',
  'computer-systems': 'systems',
  'data-ai': 'data',
  'software-product': 'engineering',
  'society-ethics-law': 'society',
  projects: 'projects',
};

export type SphereCatalogSlugKey = keyof typeof sphereIdToToken;

export const SPHERE_CATALOG_SLUG_ORDER: readonly SphereCatalogSlug[] = [
  'programming',
  'mathematics',
  'algorithms-theory',
  'computer-systems',
  'data-ai',
  'software-product',
  'society-ethics-law',
  'projects',
] as const;

const assertSphereMap = (): void => {
  const entries = Object.entries(sphereIdToToken) as Array<[SphereCatalogSlug, SphereTokenKey]>;

  if (entries.length !== SPHERE_TOKEN_COUNT) {
    throw new Error(
      `sphere-id-to-token: expected ${SPHERE_TOKEN_COUNT} entries (one per sphere token), got ${entries.length}.`,
    );
  }

  const seenTokens = new Set<SphereTokenKey>();
  for (const [slug, tokenKey] of entries) {
    if (!SPHERE_TOKEN_ORDER.includes(tokenKey)) {
      throw new Error(
        `sphere-id-to-token: slug "${slug}" maps to unknown token key "${tokenKey}".`,
      );
    }
    if (seenTokens.has(tokenKey)) {
      throw new Error(
        `sphere-id-to-token: token key "${tokenKey}" is mapped from more than one slug.`,
      );
    }
    seenTokens.add(tokenKey);
  }

  if (seenTokens.size !== SPHERE_TOKEN_COUNT) {
    throw new Error(
      `sphere-id-to-token: only ${seenTokens.size} of ${SPHERE_TOKEN_COUNT} sphere tokens are covered.`,
    );
  }
};

assertSphereMap();

/**
 * Lookup helper. Throws a clear error if a slug is not mapped — the
 * epic spec calls for an explicit failure rather than a silent fallback
 * to a default. Use `tryGetSphereTokenKey` if a soft fallback is needed.
 */
export const getSphereTokenKey = (slug: string): SphereTokenKey => {
  if (Object.prototype.hasOwnProperty.call(sphereIdToToken, slug)) {
    return (sphereIdToToken as Record<string, SphereTokenKey>)[slug];
  }
  throw new Error(
    `sphere-id-to-token: no sphere token mapped for slug "${slug}". Add the slug to sphereIdToToken in src/theme/galaxy/sphere-id-to-token.ts.`,
  );
};

/**
 * Soft lookup. Returns `null` if the slug is not in the map; callers
 * that want a "show the WindRose stat with an infra color" fallback
 * should branch on this. The legend, the sector cards and the cosmic
 * canvas (epic 47) will use the strict `getSphereTokenKey`.
 */
export const tryGetSphereTokenKey = (slug: string): SphereTokenKey | null => {
  if (Object.prototype.hasOwnProperty.call(sphereIdToToken, slug)) {
    return (sphereIdToToken as Record<string, SphereTokenKey>)[slug];
  }
  return null;
};

/**
 * Returns every catalog slug in the canonical order. Useful for the
 * legend and for tests that want to assert coverage.
 */
export const listSphereCatalogSlugs = (): readonly SphereCatalogSlug[] =>
  SPHERE_CATALOG_SLUG_ORDER;

/**
 * Re-export the token set so consumers that already import from
 * `sphere-id-to-token` do not have to take a second dependency just
 * to read the palette.
 */
export { sphereTokens, SPHERE_TOKEN_COUNT, SPHERE_TOKEN_ORDER };
export type { SphereTokenKey } from './sphere-tokens.ts';
