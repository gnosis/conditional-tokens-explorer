import styled, { css } from 'styled-components'

export enum PillTypes {
  primary,
  open,
}

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

const PillPrimaryCSS = css`
  color: ${(props) => props.theme.pillPrimary.color};
  background-color: ${(props) => props.theme.pillPrimary.backgroundColor};
`

const PillOpenCSS = css`
  color: ${(props) => props.theme.pillOpen.color};
  background-color: ${(props) => props.theme.pillOpen.backgroundColor};
`

export const Pill = styled.div<{ type?: PillTypes }>`
  align-items: center;
  border-radius: 4px;
  display: flex;
  font-size: 12px;
  font-weight: 600;
  height: 22px;
  justify-content: center;
  line-height: 1;
  padding: 0 10px;

  ${(props) => props.type === PillTypes.primary && PillPrimaryCSS}
  ${(props) => props.type === PillTypes.open && PillOpenCSS}
`

Pill.defaultProps = {
  type: PillTypes.primary,
}

BaseCard.defaultProps = {
  noPadding: false,
}
