import styled, { css } from 'styled-components'

export const TextfieldCSS = css`
  background-color: ${(props) => props.theme.textField.backgroundColor};
  border-color: ${(props) => props.theme.textField.borderColor};
  border-radius: 4px;
  border-style: solid;
  border-width: 1px;
  color: ${(props) => props.theme.textField.color};
  font-size: 16px;
  font-weight: 400;
  height: 36px;
  outline: none;
  padding: 0 11px;
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
    cursor: not-allowed;
    opacity: 0.5;
  }
`
export const Textfield = styled.input`
  ${TextfieldCSS}
`
