import { Building2, User } from 'lucide-react'

import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  CUSTOMER_TYPE_MODULES,
  MODULE_DEFINITIONS,
  enabledCustomerTypes,
} from '@shared/modules'
import type { ModuleId, ModulesSettings } from '@shared/modules'

const MODULE_ICONS: Record<ModuleId, React.ReactNode> = {
  privateCustomers: <User className="size-4 text-foreground" />,
  businessCustomers: <Building2 className="size-4 text-foreground" />,
}

interface ModuleToggleListProps {
  values: ModulesSettings
  onModuleChange: (id: ModuleId, enabled: boolean) => void
  disabled?: boolean
}

/**
 * The registry-driven list of module switches shared by onboarding and
 * settings. The last enabled customer-type module locks so the app always
 * keeps at least one customer register.
 */
export default function ModuleToggleList({
  values,
  onModuleChange,
  disabled,
}: ModuleToggleListProps) {
  const enabledTypes = enabledCustomerTypes(values)
  const lockedId =
    enabledTypes.length === 1 ? CUSTOMER_TYPE_MODULES[enabledTypes[0]] : null

  return (
    <div className="flex flex-col gap-2">
      {MODULE_DEFINITIONS.map((module) => {
        const locked = module.id === lockedId
        const switchId = `module-${module.id}`
        return (
          <div
            key={module.id}
            className="flex items-center gap-3 rounded-md border bg-card px-3 py-2.5"
          >
            {MODULE_ICONS[module.id]}
            <div className="flex min-w-0 flex-1 flex-col">
              <Label htmlFor={switchId} className="text-sm font-medium">
                {module.name}
              </Label>
              <p className="text-xs text-muted-foreground">
                {module.description}
              </p>
            </div>
            <Switch
              id={switchId}
              checked={values[module.id]}
              disabled={disabled || locked}
              onCheckedChange={(checked) => onModuleChange(module.id, checked)}
            />
          </div>
        )
      })}
      <p className="text-xs text-muted-foreground">
        Minst én kundetype må være aktivert.
      </p>
    </div>
  )
}
