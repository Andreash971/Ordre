import { useEffect, useState } from 'react'
import { ArrowUpCircle } from 'lucide-react'

import { SidebarMenuButton } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { PendingUpdate } from '@/lib/electron'

function formatChangelog(raw: string): Array<string> {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^#+\s*/, '').replace(/^[-*]\s*/, '• '))
    .slice(0, 12)
}

export default function UpdateCard() {
  const [pending, setPending] = useState<PendingUpdate | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const update = window.electronAPI?.update
    if (!update) return
    void update.getPending().then((info) => {
      if (info) setPending(info)
    })
    return update.onAvailable(setPending)
  }, [])

  if (!pending) return null

  const lines = formatChangelog(pending.changelog)

  return (
    <>
      <TooltipProvider>
        <SidebarMenuButton
          size="lg"
          tooltip="Oppdatering tilgjengelig"
          onClick={() => setOpen(true)}
          className="w-auto h-fit text-base border bg-background dark:bg-muted text-primary dark:text-accent-foreground bog:text-foreground hover:bg-primary/10 hover:text-primary [&>svg]:size-6 group-data-[collapsible=icon]:[&>svg]:ml-1"
        >
          <ArrowUpCircle />
          Oppdatering tilgjengelig
        </SidebarMenuButton>
      </TooltipProvider>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pending.version
                ? `Ordre ${pending.version} er klar`
                : 'Oppdatering klar'}
            </DialogTitle>
            <DialogDescription>
              {pending.downloadUrl
                ? 'En betaversjon er tilgjengelig. Last ned installasjonsfilen fra GitHub og kjør den for å installere.'
                : 'En ny versjon er lastet ned. Start appen på nytt for å fullføre oppdateringen.'}
            </DialogDescription>
          </DialogHeader>

          {lines.length > 0 ? (
            <div>
              <p className="mb-2 text-sm font-medium">Nyheter</p>
              <ScrollArea className="max-h-48 rounded-lg border bg-muted/30 p-3">
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {lines.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Endringslogg er ikke tilgjengelig.
            </p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Senere
            </Button>
            {pending.downloadUrl ? (
              <Button
                onClick={() => {
                  void window.electronAPI.shell.openExternal(
                    pending.downloadUrl!,
                  )
                  setOpen(false)
                }}
              >
                Last ned
              </Button>
            ) : (
              <Button onClick={() => void window.electronAPI.update.install()}>
                Start på nytt
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
