import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.svg``

export const ErrorIcon: React.FC = (props) => {
  const { ...restProps } = props

  return (
    <Wrapper
      {...restProps}
      height="48"
      viewBox="0 0 24 24"
      width="48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="none" fillRule="evenodd">
        <path d="M0 0H24V24H0z" />
        <rect fill="#F02525" height="8" rx="1" width="2" x="11" y="6" />
        <path
          d="M12 15.75c.69 0 1.25.56 1.25 1.25s-.56 1.25-1.25 1.25-1.25-.56-1.25-1.25.56-1.25 1.25-1.25z"
          fill="#F02525"
          fillRule="nonzero"
        />
        <path
          d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-2c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z"
          fill="#F02525"
          fillRule="nonzero"
        />
      </g>
    </Wrapper>
  )
}
