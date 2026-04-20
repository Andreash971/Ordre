import { EmptyExtra } from '@/components/ui/empty-extra'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
  InputGroupText,
} from '@/components/ui/input-group'
import { TooltipWrapper } from '@/components/ui/TooltipWrapper'

import { CornerDownLeft, X, CirclePlus } from 'lucide-react'

interface TextBoxSwapProps extends React.PropsWithChildren {
  className?: string
  showBool: boolean
  id?: string
  placeholder?: string
  textValue: string | null
  onValueChange: (value: string) => void
  onSubmit?: (value: string) => void
  extraName: string
  toggleBool?: () => void
  title?: string
  tooltipWrite?: string
  tooltipRemove?: string
}

const TextBoxSwap = ({
  showBool,
  className,
  extraName,
  toggleBool,
  textValue,
  onValueChange,
  onSubmit,
  id,
  placeholder,
  tooltipWrite,
  tooltipRemove,
  title,
}: TextBoxSwapProps) => {
  return showBool ? (
    <div className={`grid w-full min-h-40 ${className}`}>
      <InputGroup>
        <InputGroupTextarea
          id={id}
          name={id}
          autoComplete="off"
          placeholder={placeholder ?? ''}
          value={textValue ?? ''}
          onChange={(e) => onValueChange(e.target.value)}
        />
        <InputGroupAddon align="block-start" className="border-b">
          <InputGroupText>{title}</InputGroupText>
          <TooltipWrapper
            TooltipText={tooltipWrite ?? 'Overskriv kundens personlige tekst'}
          >
            <InputGroupButton
              className="ml-auto"
              variant="outline"
              size="icon-xs"
              onClick={() => onSubmit?.(textValue ?? '')}
            >
              <CornerDownLeft />
            </InputGroupButton>
          </TooltipWrapper>

          <TooltipWrapper
            TooltipText={tooltipRemove ?? 'Fjern og nullstill alle tekster'}
          >
            <InputGroupButton
              variant="default"
              size="icon-xs"
              onClick={toggleBool}
            >
              <X />
            </InputGroupButton>
          </TooltipWrapper>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ) : (
    <EmptyExtra
      icon={<CirclePlus />}
      extraName={extraName}
      className="min-h-40"
      onClick={toggleBool}
    />
  )
}
export { TextBoxSwap }
