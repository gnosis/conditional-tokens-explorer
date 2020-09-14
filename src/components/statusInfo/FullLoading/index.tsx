import React, { HTMLAttributes } from 'react'
import ReactDOM from 'react-dom'
import styled, { css } from 'styled-components'

import { Button } from 'components/buttons/Button'
import { ButtonType } from 'components/buttons/buttonStylingTypes'
import { Spinner } from 'components/statusInfo/Spinner'
import { Card, Icon, IconTypes, Text, Title } from 'components/statusInfo/common'
import { AlertIcon } from 'components/statusInfo/icons/AlertIcon'
import { ErrorIcon } from 'components/statusInfo/icons/ErrorIcon'
import { OkIcon } from 'components/statusInfo/icons/OkIcon'

const Wrapper = styled.div`
  align-items: center;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  flex-direction: column;
  height: 100vh;
  justify-content: center;
  left: 0;
  position: fixed;
  top: 0;
  width: 100vw;
  z-index: 100;
`

const NoOverlayCSS = css`
  margin: auto;
`

const LoadingCard = styled(Card)<{ height?: string; width?: string; noOverlay?: boolean }>`
  min-height: ${(props) => props.height};
  width: ${(props) => props.width};

  ${(props) => props.noOverlay && NoOverlayCSS}
`

LoadingCard.defaultProps = {
  height: '240px',
  noOverlay: false,
  width: '280px',
}

const LoadingSpinner = styled(Spinner)`
  align-self: center;
  margin-bottom: auto;
  margin-top: auto;
`

const ButtonContainer = styled.div`
  padding-top: 25px;
`

const ActionButton = styled(Button)`
  width: 100%;
`

export interface ActionButtonProps {
  buttonType?: ButtonType | undefined
  onClick: () => void
  text: string
}

interface Props extends HTMLAttributes<HTMLDivElement> {
  actionButton?: ActionButtonProps | undefined
  height?: string
  icon?: IconTypes
  message?: string
  bodyComponent?: React.ReactNode | undefined
  noOverlay?: boolean
  title?: string
  width?: string
}

export const FullLoading: React.FC<Props> = (props) => {
  const {
    actionButton,
    icon = IconTypes.spinner,
    height,
    message,
    bodyComponent,
    noOverlay,
    title,
    width,
    ...restProps
  } = props
  const portal: HTMLElement | null = document.getElementById('portalContainer')
  const loadingCard = (
    <LoadingCard height={height} noOverlay={noOverlay} width={width}>
      {title && <Title>{title}</Title>}
      <Icon>
        {icon === IconTypes.spinner && <LoadingSpinner />}
        {icon === IconTypes.alert && <AlertIcon />}
        {icon === IconTypes.error && <ErrorIcon />}
        {icon === IconTypes.ok && <OkIcon />}
      </Icon>
      {message && <Text>{message}</Text>}
      {bodyComponent}
      {actionButton && (
        <ButtonContainer>
          <ActionButton buttonType={actionButton.buttonType} onClick={actionButton.onClick}>
            {actionButton.text}
          </ActionButton>
        </ButtonContainer>
      )}
    </LoadingCard>
  )

  return noOverlay
    ? loadingCard
    : portal && ReactDOM.createPortal(<Wrapper {...restProps}>{loadingCard}</Wrapper>, portal)
}
