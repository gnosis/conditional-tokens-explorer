import styled, { css } from 'styled-components'

export const TextfieldCSS = css<{ error?: boolean }>`
  background-color: ${(props) => props.theme.textField.backgroundColor};
  border-color: ${(props) =>
    props.error ? props.theme.textField.errorColor : props.theme.textField.borderColor};
  border-radius: ${(props) => props.theme.textField.borderRadius};
  border-style: ${(props) => props.theme.textField.borderStyle};
  border-width: ${(props) => props.theme.textField.borderWidth};
  color: ${(props) =>
    props.error ? props.theme.textField.errorColor : props.theme.textField.color};
  font-size: ${(props) => props.theme.textField.fontSize};
  font-weight: ${(props) => props.theme.textField.fontWeight};
  height: ${(props) => props.theme.textField.height};
  outline: none;
  padding: 0 ${(props) => props.theme.textField.paddingHorizontal};
  width: 100%;

  &:active,
  &:focus {
    background-color: ${(props) => props.theme.textField.backgroundColorActive};
    border-color: ${(props) => props.theme.textField.borderColorActive};
  }

  &::placeholder {
    color: ${(props) => props.theme.textField.colorPlaceholder};
    font-style: normal;
  }

  &[disabled],
  &[disabled]:hover {
    background-color: ${(props) => props.theme.textField.backgroundColorActive};
    border-color: ${(props) => props.theme.textField.borderColor};
    cursor: not-allowed;
    opacity: 0.5;
  }
`

export const Textfield = styled.input`
  ${TextfieldCSS}
`
