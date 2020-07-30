import styled, { css } from 'styled-components'

export const CommonDisabledCSS = css`
  &.disabled,
  &.disabled:hover,
  &:disabled,
  &:disabled:hover,
  &[disabled],
  &[disabled]:hover {
    background-color: ${(props) => props.theme.form.disabled.backgroundColor};
    border-color: ${(props) => props.theme.form.disabled.borderColor};
    color: ${(props) => props.theme.form.disabled.color};
    cursor: not-allowed !important;
    user-select: none !important;
  }
`

export const BaseCard = styled.div<{ noPadding?: boolean }>`
  background-color: ${(props) => props.theme.cards.backgroundColor};
  border-radius: ${(props) => props.theme.cards.borderRadius};
  box-shadow: ${(props) => props.theme.cards.boxShadow};
  display: flex;
  flex-direction: column;
  position: relative;

  ${(props) =>
    props.noPadding
      ? 'padding: 0'
      : 'padding: ' +
        props.theme.cards.paddingVertical +
        ' ' +
        props.theme.cards.paddingHorizontal +
        ';'};
`

BaseCard.defaultProps = {
  noPadding: false,
}
