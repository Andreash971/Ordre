/** Compare two semver strings, ignoring any pre-release suffix. */
export function isNewerVersion(candidate: string, current: string): boolean {
  const parse = (v: string) => v.replace(/-.*$/, '').split('.').map(Number)
  const [caMaj = 0, caMin = 0, caPatch = 0] = parse(candidate)
  const [cuMaj = 0, cuMin = 0, cuPatch = 0] = parse(current)
  if (caMaj !== cuMaj) return caMaj > cuMaj
  if (caMin !== cuMin) return caMin > cuMin
  return caPatch > cuPatch
}
