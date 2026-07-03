import { useState } from 'react'
import { Eye, EyeOff, Settings2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import type { BringApiCredentials } from '@/lib/settings'
import { getStoredSettings, updateSettings } from '@/lib/settings'

function BringApiForm() {
  const [creds, setCreds] = useState<BringApiCredentials>(
    () => getStoredSettings().bringApi,
  )
  const [stored, setStored] = useState<BringApiCredentials>(
    () => getStoredSettings().bringApi,
  )
  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved] = useState(false)

  function handleChange(field: keyof BringApiCredentials, value: string) {
    setCreds((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault()
    updateSettings({ bringApi: creds })
    setStored(creds)
    setSaved(true)
  }

  const dirty = creds.uid !== stored.uid || creds.apiKey !== stored.apiKey

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-3 w-full pt-1"
    >
      <Input
        id="bring-uid"
        name="bring-uid"
        autoComplete="off"
        value={creds.uid}
        placeholder="Bring UID (e-postadresse)"
        onChange={(e) => handleChange('uid', e.target.value)}
      />
      <div className="relative">
        <Input
          id="bring-api-key"
          name="bring-api-key"
          type={showKey ? 'text' : 'password'}
          autoComplete="off"
          value={creds.apiKey}
          placeholder="Bring API-nøkkel"
          onChange={(e) => handleChange('apiKey', e.target.value)}
          className="pr-9"
        />
        <button
          type="button"
          onClick={() => setShowKey((v) => !v)}
          aria-label={showKey ? 'Skjul API-nøkkel' : 'Vis API-nøkkel'}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {showKey ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        Bring API brukes til postnummeroppslag og adresseforslag. Få tilgang på{' '}
        <span className="font-medium">mybring.com</span>.
      </p>
      <div className="flex justify-end">
        <Button
          type="submit"
          variant="outline"
          size="sm"
          disabled={!dirty && !saved}
        >
          {saved && !dirty ? 'Lagret' : 'Lagre'}
        </Button>
      </div>
    </form>
  )
}

export default function BringApiSection() {
  return (
    <Item variant="outline" className="bg-card">
      <ItemMedia variant="icon">
        <Settings2 />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Bring API</ItemTitle>
        <ItemDescription>
          Legitimasjon for adressesøk og postnummeroppslag.
        </ItemDescription>
      </ItemContent>
      <ItemFooter>
        <BringApiForm />
      </ItemFooter>
    </Item>
  )
}
