import React, { HTMLAttributes } from 'react'
import styled, { keyframes } from 'styled-components'

import { SpinnerSVG } from './img/SpinnerSVG'

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

const Wrapper = styled.div<{ height: string | undefined; width: string | undefined }>`
  animation: ${rotate} 2s linear infinite;
  flex-grow: 0;
  flex-shrink: 0;
  height: ${(props) => props.height};
  width: ${(props) => props.width};

  svg {
    height: 100%;
    width: 100%;
  }
`

Wrapper.defaultProps = {
  height: '48px',
  width: '48px',
}

interface Props extends HTMLAttributes<HTMLDivElement> {
  height?: string | undefined
  width?: string | undefined
}

export const Spinner: React.FC<Props> = (props: Props) => {
  const { height, width, ...restProps } = props

  return (
    <Wrapper height={height} width={width} {...restProps}>
      <SpinnerSVG />
    </Wrapper>
  )
}
