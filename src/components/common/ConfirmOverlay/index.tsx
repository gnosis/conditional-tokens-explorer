import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  align-items: center;
  background-color: rgba(255, 255, 255, 0.8);
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  left: 0;
  padding: 0 25px;
  position: absolute;
  right: 0;
  top: 0;
  z-index: 123;
`

const ConfirmText = styled.p`
  color: ${(props) => props.theme.colors.darkerGray};
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  margin: 0 0 8px;
`

const ConfirmControls = styled.div`
  column-gap: 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin-left: auto;
  margin-right: auto;
`

const ConfirmControl = styled.span`
  color: ${(props) => props.theme.colors.darkerGray};
  cursor: pointer;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.4;
  text-transform: uppercase;

  &:hover {
    text-decoration: underline;
  }
`

const Yes = styled(ConfirmControl)`
  color: ${(props) => props.theme.colors.error};
`

const No = styled(ConfirmControl)``

interface Props {
  confirm: () => void
  deny: () => void
  text: string
}

export const ConfirmOverlay: React.FC<Props> = (props) => {
  const { confirm, deny, text, ...restProps } = props

  return (
    <Wrapper {...restProps}>
      <ConfirmText className="confirmText">{text}</ConfirmText>
      <ConfirmControls className="confirmControls">
        <Yes onClick={confirm}>Yes</Yes>
        <No onClick={deny}>No</No>
      </ConfirmControls>
    </Wrapper>
  )
}

export const ConfirmOverlayHorizontal = styled(ConfirmOverlay)`
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid ${(props) => props.theme.colors.error};
  flex-direction: row;
  justify-content: space-between;
  padding: 0 15px;
  border-left: none;
  border-right: none;

  .confirmText {
    margin: 0;
  }
  .confirmControls {
    margin-right: 0;
  }
`
