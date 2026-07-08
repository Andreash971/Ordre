import ModuleToggleList from '@/components/ModuleToggleList'
import type { ModuleId, ModulesSettings } from '@shared/modules'

interface ModulesStepProps {
  modules: ModulesSettings
  onModuleChange: (id: ModuleId, enabled: boolean) => void
}

/** Onboarding step 2: choose which feature modules to enable. */
export default function ModulesStep({
  modules,
  onModuleChange,
}: ModulesStepProps) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-medium">Kundetyper</h3>
        <p className="text-xs text-muted-foreground">
          Velg hvilke kundetyper bedriften bruker. Dette kan endres når som
          helst under Innstillinger.
        </p>
      </div>
      <ModuleToggleList values={modules} onModuleChange={onModuleChange} />
    </div>
  )
}
