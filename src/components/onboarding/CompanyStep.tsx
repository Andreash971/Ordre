import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import type { CompanyInfo } from '@shared/settings'

export type CompanyFormState = CompanyInfo
export type CompanyFieldKey = keyof CompanyFormState

export const COMPANY_FIELD_LABELS: Record<CompanyFieldKey, string> = {
  name: 'Juridisk navn',
  displayName: 'Visningsnavn',
  address: 'Adresse',
  postCode: 'Postnummer og sted',
  phone: 'Telefon',
}

interface CompanyStepProps {
  form: CompanyFormState
  touched: Record<CompanyFieldKey, boolean>
  errors: Partial<Record<CompanyFieldKey, string>>
  onChange: (field: CompanyFieldKey, value: string) => void
  onBlur: (field: CompanyFieldKey) => void
}

/** Onboarding step 1: display name and company details. */
export default function CompanyStep({
  form,
  touched,
  errors,
  onChange,
  onBlur,
}: CompanyStepProps) {
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <div>
          <h3 className="text-sm font-medium">Tittelinformasjon</h3>
          <p className="text-xs text-muted-foreground">
            Vises i sidemenyen og øverst på utskrifter. Vanligvis det korte
            merkenavnet uten selskapsform.
          </p>
        </div>
        <Field
          id="onboarding-displayName"
          label={COMPANY_FIELD_LABELS.displayName}
          placeholder="F.eks. Mitt Firma"
          autoComplete="organization"
          value={form.displayName}
          onChange={(v) => onChange('displayName', v)}
          onBlur={() => onBlur('displayName')}
          error={touched.displayName ? errors.displayName : undefined}
        />
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <div>
          <h3 className="text-sm font-medium">Bedriftsinformasjon</h3>
          <p className="text-xs text-muted-foreground">
            Brukes i adressefeltet på ordredokumenter (kjørelapper).
          </p>
        </div>
        <Field
          id="onboarding-name"
          label={COMPANY_FIELD_LABELS.name}
          placeholder="F.eks. Mitt Firma AS"
          autoComplete="organization"
          value={form.name}
          onChange={(v) => onChange('name', v)}
          onBlur={() => onBlur('name')}
          error={touched.name ? errors.name : undefined}
        />
        <Field
          id="onboarding-address"
          label={COMPANY_FIELD_LABELS.address}
          placeholder="Gateadresse"
          autoComplete="street-address"
          value={form.address}
          onChange={(v) => onChange('address', v)}
          onBlur={() => onBlur('address')}
          error={touched.address ? errors.address : undefined}
        />
        <Field
          id="onboarding-postCode"
          label={COMPANY_FIELD_LABELS.postCode}
          placeholder="0000 Sted"
          autoComplete="postal-code"
          value={form.postCode}
          onChange={(v) => onChange('postCode', v)}
          onBlur={() => onBlur('postCode')}
          error={touched.postCode ? errors.postCode : undefined}
        />
        <Field
          id="onboarding-phone"
          label={COMPANY_FIELD_LABELS.phone}
          placeholder="Telefonnummer"
          type="tel"
          autoComplete="tel"
          value={form.phone}
          onChange={(v) => onChange('phone', v)}
          onBlur={() => onBlur('phone')}
          error={touched.phone ? errors.phone : undefined}
        />
      </section>
    </div>
  )
}

type FieldProps = {
  id: string
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  error?: string
  type?: React.HTMLInputTypeAttribute
  autoComplete?: React.InputHTMLAttributes<HTMLInputElement>['autoComplete']
}

function Field({
  id,
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  type = 'text',
  autoComplete,
}: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={!!error}
      />
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
