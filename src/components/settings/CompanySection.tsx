import { useState } from 'react'
import { Building2 } from 'lucide-react'

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
import { Separator } from '@/components/ui/separator'
import type { CompanyInfo } from '@/lib/settings'
import { getStoredSettings, updateSettings } from '@/lib/settings'

function CompanyInfoForm() {
  const [company, setCompany] = useState<CompanyInfo>(
    () => getStoredSettings().company,
  )
  const [saved, setSaved] = useState(false)

  function handleChange(field: keyof CompanyInfo, value: string) {
    setCompany((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault()
    updateSettings({ company })
    setSaved(true)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full pt-1">
      <div className="flex flex-col gap-2">
        <div>
          <h4 className="text-sm font-medium">Visningsnavn</h4>
          <p className="text-xs text-muted-foreground">
            Vises i sidemenyen og øverst på utskrifter.
          </p>
        </div>
        <Input
          id="company-display-name"
          name="company-display-name"
          autoComplete="organization"
          value={company.displayName}
          placeholder="F.eks. Mitt Firma"
          onChange={(e) => handleChange('displayName', e.target.value)}
        />
      </div>

      <Separator />

      <div className="flex flex-col gap-2">
        <div>
          <h4 className="text-sm font-medium">Bedriftsinformasjon</h4>
          <p className="text-xs text-muted-foreground">
            Brukes i adressefeltet på ordredokumenter.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            id="company-name"
            name="company-name"
            autoComplete="organization"
            value={company.name}
            placeholder="Juridisk navn (f.eks. Mitt Firma AS)"
            onChange={(e) => handleChange('name', e.target.value)}
          />
          <Input
            id="company-address"
            name="company-address"
            autoComplete="street-address"
            value={company.address}
            placeholder="Adresse"
            onChange={(e) => handleChange('address', e.target.value)}
          />
          <Input
            id="company-postcode"
            name="company-postcode"
            autoComplete="postal-code"
            value={company.postCode}
            placeholder="Postnummer og sted"
            onChange={(e) => handleChange('postCode', e.target.value)}
          />
          <Input
            id="company-phone"
            name="company-phone"
            type="tel"
            autoComplete="tel"
            value={company.phone}
            placeholder="Telefon"
            onChange={(e) => handleChange('phone', e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" variant="outline" size="sm">
          {saved ? 'Lagret' : 'Lagre'}
        </Button>
      </div>
    </form>
  )
}

export default function CompanySection() {
  return (
    <Item variant="outline" className="bg-card">
      <ItemMedia variant="icon">
        <Building2 />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Bedriftsinformasjon</ItemTitle>
        <ItemDescription>
          Bedriftsinformasjonen som vises i ordredokumenter under utfører
          seksjonen.
        </ItemDescription>
      </ItemContent>
      <ItemFooter>
        <CompanyInfoForm />
      </ItemFooter>
    </Item>
  )
}
