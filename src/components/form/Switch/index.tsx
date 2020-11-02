import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div<{ disabled?: boolean }>`
  align-items: center;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  justify-content: center;
  opacity: ${(props) => (props.disabled ? '0.5' : '1')};
  pointer-events: ${(props) => (props.disabled ? 'none' : 'all')};
`

const SwitchWrapper = styled.div<{ active: boolean }>`
  background-color: ${(props) =>
    props.active ? props.theme.colors.primary : props.theme.colors.mediumGrey};
  border-radius: 20px;
  cursor: pointer;
  height: 20px;
  position: relative;
  transition: all 0.1s linear;
  width: 36px;
`

const Circle = styled.div<{ active: boolean }>`
  background-color: #fff;
  border-radius: 50%;
  box-shadow: 0 0 2px 0 rgba(0, 0, 0, 0.16);
  cursor: pointer;
  height: 16px;
  left: ${(props) => (props.active ? '18px' : '2px')};
  position: absolute;
  top: 2px;
  transition: all 0.1s linear;
  width: 16px;
`

const Label = styled.span`
  color: ${(props) => props.theme.colors.darkerGrey};
  font-size: 18px;
  font-weight: 600;
  line-height: 1.2;
  margin-left: 6px;
  text-align: left;
`

interface Props {
  active: boolean
  disabled?: boolean
  label?: React.ReactNode
  onClick?: () => void
}

export const Switch: React.FC<Props> = (props) => {
  const { active = false, disabled, label, onClick, ...restProps } = props

  return (
    <Wrapper disabled={disabled} onClick={onClick} {...restProps}>
      <SwitchWrapper active={active}>
        <Circle active={active} />
      </SwitchWrapper>
      {label && <Label>{label}</Label>}
    </Wrapper>
  )
}
