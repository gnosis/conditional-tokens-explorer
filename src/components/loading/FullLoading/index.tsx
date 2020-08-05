import React, { HTMLAttributes } from 'react'
import ReactDOM from 'react-dom'
import styled, { css } from 'styled-components'

import { BaseCard } from '../../pureStyledComponents/BaseCard'
import { Spinner } from '../Spinner'
import { Text, Title } from '../common'

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

const LoadingCard = styled(BaseCard)<{ height?: string; width?: string; noOverlay?: boolean }>`
  box-shadow: 0 2px 8px 0 rgba(212, 213, 211, 0.85);
  flex-direction: column;
  justify-content: space-between;
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

interface Props extends HTMLAttributes<HTMLDivElement> {
  height?: string
  message?: string
  noOverlay?: boolean
  title?: string
  width?: string
}

export const FullLoading: React.FC<Props> = (props) => {
  const { height, message, noOverlay, title, width, ...restProps } = props
  const portal: HTMLElement | null = document.getElementById('portalContainer')
  const loadingCard = (
    <LoadingCard height={height} noOverlay={noOverlay} width={width}>
      {title && <Title>{title}</Title>}
      <LoadingSpinner />
      {message && <Text>{message}</Text>}
    </LoadingCard>
  )

  return noOverlay
    ? loadingCard
    : portal && ReactDOM.createPortal(<Wrapper {...restProps}>{loadingCard}</Wrapper>, portal)
}
