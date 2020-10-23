import React, { HTMLAttributes } from 'react'
import styled, { keyframes } from 'styled-components'

import { SpinnerSVG } from 'components/statusInfo/Spinner/img/SpinnerSVG'
import { SpinnerSize } from 'components/statusInfo/common'

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

const Wrapper = styled.div<{ size?: SpinnerSize | string | undefined }>`
  animation: ${rotate} 2s linear infinite;
  flex-grow: 0;
  flex-shrink: 0;
  height: ${(props) => props.size};
  width: ${(props) => props.size};

  svg {
    height: 100%;
    width: 100%;
  }
`

Wrapper.defaultProps = {
  size: SpinnerSize.regular,
}

interface Props extends HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize | string | undefined
}

export const Spinner: React.FC<Props> = (props: Props) => {
  const { size, ...restProps } = props

  return (
    <Wrapper size={size} {...restProps}>
      <SpinnerSVG />
    </Wrapper>
  )
}
