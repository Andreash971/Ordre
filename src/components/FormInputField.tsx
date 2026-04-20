import { Field, FieldError } from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'

interface FormInputFieldProps {
  field: {
    name: string
    state: {
      value: string
      meta: {
        isTouched: boolean
        isValid: boolean
        errors: Array<{ message?: string } | undefined>
      }
    }
    handleChange: (value: string) => void
    handleBlur: () => void
  }
  id: string
  icon: React.ReactNode
  placeholder: string
  type?: React.HTMLInputTypeAttribute
  disabled?: boolean
  autoComplete?: React.InputHTMLAttributes<HTMLInputElement>['autoComplete']
}

export default function FormInputField({
  field,
  id,
  icon,
  placeholder,
  type = 'text',
  disabled,
  autoComplete,
}: FormInputFieldProps) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field data-invalid={isInvalid} data-disabled>
      <InputGroup>
        <InputGroupAddon>{icon}</InputGroupAddon>
        <InputGroupInput
          id={id}
          name={field.name}
          type={type}
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={field.handleBlur}
          aria-invalid={isInvalid}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
        />
      </InputGroup>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
