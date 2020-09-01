import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.svg``

export const ArrowUp: React.FC<{ className?: string }> = (props) => (
  <Wrapper
    className={`arrowUp ${props.className}`}
    height="18.667"
    viewBox="0 0 18.667 18.667"
    width="18.667"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M0 18.667h18.667V0H0z" fill="none" fillRule="evenodd" />
    <path
      d="M9.7 4.655v12.123a.778.778 0 1 0 1.556 0V4.655l3.205 3.206a.778.778 0 0 0 1.1-1.1l-4.4-4.4A.863.863 0 0 0 11.1 2.3a.778.778 0 0 0-1.226 0 .657.657 0 0 0-.07.062l-4.4 4.4a.778.778 0 0 0 1.1 1.1z"
      fill="#b2b5b2"
      fillRule="evenodd"
      transform="translate(-1.149 -.444)"
    />
  </Wrapper>
)
