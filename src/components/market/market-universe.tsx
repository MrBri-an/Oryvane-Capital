/**
 * Compatibility shim for route components created before the global cosmic
 * market engine moved into the root layout. Keeping this component inert
 * prevents duplicate background layers and guarantees exactly three stars.
 */
export function MarketUniverse({ compact: _compact = false }: { compact?: boolean }) {
  void _compact;
  return null;
}
