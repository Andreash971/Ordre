/** Page section heading: small title with an optional muted subtitle. */
export function SectionHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-heading text-sm font-semibold">{title}</span>
      {sub ? (
        <span className="text-xs text-muted-foreground">{sub}</span>
      ) : null}
    </div>
  )
}
