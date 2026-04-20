import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

import { FileX } from 'lucide-react'

export default function NotFound() {
  return (
    <Empty className="rise-in">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileX />
        </EmptyMedia>
        <EmptyTitle>404 - Side ikke funnet</EmptyTitle>
        <EmptyDescription>
          Denne siden finnes ikke. Gå tilbake til forsiden eller en annen side.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center">
        <Link to="/">
          <Button>Tilbake til forsiden</Button>
        </Link>
      </EmptyContent>
    </Empty>
  )
}
