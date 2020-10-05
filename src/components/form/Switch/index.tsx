import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  justify-content: center;
`

const SwitchWrapper = styled.div<{ active: boolean }>`
  background-color: ${(props) =>
    props.active ? props.theme.colors.primary : props.theme.colors.mediumGrey};
  border-radius: 20px;
  cursor: pointer;
  height: 20px;
  position: relative;
  transition: all 0.15 linear;
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
  transition: all 0.15 linear;
  width: 16px;
`

const Label = styled.span`
  color: ${(props) => props.theme.colors.darkerGray};
  font-size: 18px;
  font-weight: 600;
  line-height: 1.2;
  margin-left: 6px;
  text-align: left;
`

interface Props {
  active: boolean
  label?: React.ReactNode
  onClick?: () => void
}

export const Switch: React.FC<Props> = (props) => {
  const { active = false, label, onClick, ...restProps } = props

  return (
    <Wrapper onClick={onClick} {...restProps}>
      <SwitchWrapper active={active}>
        <Circle active={active} />
      </SwitchWrapper>
      {label && <Label>{label}</Label>}
    </Wrapper>
  )
}
