import { Link } from '@tanstack/react-router'
import { RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'

export default function RerunOnboardingSection() {
  return (
    <Item variant="outline" className="bg-card">
      <ItemMedia variant="icon">
        <RotateCcw />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Kjør oppsett på nytt</ItemTitle>
        <ItemDescription>
          Gå gjennom oppsettsveiviseren igjen. Dagens valg er forhåndsutfylt, så
          du endrer bare det du vil.
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button variant="outline" asChild>
          <Link to="/onboarding">Start oppsett</Link>
        </Button>
      </ItemActions>
    </Item>
  )
}
