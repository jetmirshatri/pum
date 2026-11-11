// The X-ray layer outlines every element that carries these attributes and
// labels it with where it renders. Spread them on the element itself, so the
// page keeps its markup: <section {...xray('server', 'its code stays on the
// server')}>. A client island uses useIslandXRay, which adds when it hydrated.

export type XRayKind = 'server' | 'client' | 'suspense';

const KIND_NAMES: Record<XRayKind, string> = {
  server: 'Server Component',
  client: 'Client island',
  suspense: 'Suspense boundary'
};

export const xray = (kind: XRayKind, detail: string) => ({
  'data-xray-kind': kind,
  'data-xray-label': `${KIND_NAMES[kind]} · ${detail}`
});
