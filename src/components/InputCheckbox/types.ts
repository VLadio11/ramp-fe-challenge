import { FunctionComponent } from "react"

type InputCheckboxProps = {
  id: string | number
  checked?: boolean
  toggleCheckbox: (newValue: boolean) => void
  disabled?: boolean
}

export type InputCheckboxComponent = FunctionComponent<InputCheckboxProps>
