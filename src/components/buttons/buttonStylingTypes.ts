import { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react'
import { FlattenInterpolation, ThemeProps, css } from 'styled-components'

export enum ButtonType {
  primary,
  danger,
}

export interface ButtonCommonProps {
  buttonType?: ButtonType
  theme?: unknown
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonCommonProps {}

export interface ButtonLinkProps
  extends AnchorHTMLAttributes<HTMLAnchorElement>,
    ButtonCommonProps {}

const PrimaryCSS = css`
  & {
    background-color: ${(props) => props.theme.buttonPrimary.backgroundColor};
    color: ${(props) => props.theme.buttonPrimary.color};
  }

  &:hover {
    background-color: ${(props) => props.theme.buttonPrimary.backgroundColorHover};
    color: ${(props) => props.theme.buttonPrimary.colorHover};
  }

  &[disabled],
  &[disabled]:hover {
    background-color: ${(props) => props.theme.buttonPrimary.backgroundColor};
    color: ${(props) => props.theme.buttonPrimary.color};
    cursor: not-allowed;
    opacity: 0.5;
  }
`

const DangerCSS = css`
  & {
    background-color: ${(props) => props.theme.buttonPrimary.backgroundColor};
    color: ${(props) => props.theme.buttonPrimary.color};
  }

  &:hover {
    background-color: ${(props) => props.theme.buttonPrimary.backgroundColorHover};
    color: ${(props) => props.theme.buttonPrimary.colorHover};
  }

  &[disabled],
  &[disabled]:hover {
    background-color: ${(props) => props.theme.buttonPrimary.backgroundColor};
    color: ${(props) => props.theme.buttonPrimary.color};
    cursor: not-allowed;
    opacity: 0.5;
  }
`

const getButtonTypeStyles = (
  buttonType: ButtonType = ButtonType.primary
): FlattenInterpolation<ThemeProps<unknown>> => {
  if (buttonType === ButtonType.primary) {
    return PrimaryCSS
  }

  if (buttonType === ButtonType.danger) {
    return DangerCSS
  }

  return PrimaryCSS
}

export const ButtonCSS = css<ButtonCommonProps>`
  align-items: center;
  border-radius: 4px;
  border-style: solid;
  border: none;
  cursor: pointer;
  display: flex;
  font-size: 20px;
  font-weight: 600;
  height: 36px;
  justify-content: center;
  line-height: 1.2;
  outline: none;
  padding: 0 30px;
  text-align: center;
  transition: all 0.15s ease-out;
  user-select: none;
  white-space: nowrap;

  ${(props) => getButtonTypeStyles(props.buttonType)}
`
