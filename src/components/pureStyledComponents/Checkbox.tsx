import styled, { css } from 'styled-components'

const CheckboxSelectedCSS = css`
  &:before {
    background-color: ${(props) => props.theme.colors.primary};
    content: '';
    height: 8px;
    left: 1px;
    position: absolute;
    top: 1px;
    width: 8px;
  }
`

export const Checkbox = styled.div<{ checked?: boolean }>`
  background-color: #fff;
  border: solid 1px ${(props) => props.theme.colors.primary};
  height: 12px;
  position: relative;
  width: 12px;

  ${(props) => props.checked && CheckboxSelectedCSS}
`
