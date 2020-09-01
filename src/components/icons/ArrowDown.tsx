import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.svg``

export const ArrowDown: React.FC<{ className?: string }> = (props) => (
  <Wrapper
    className={`arrowDown ${props.className}`}
    height="18.667"
    viewBox="0 0 18.667 18.667"
    width="18.667"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M0 0h18.667v18.667H0z" fill="none" fillRule="evenodd" />
    <path
      d="M9.7 14.9V2.778a.778.778 0 1 1 1.556 0V14.9l3.205-3.206a.778.778 0 0 1 1.1 1.1l-4.4 4.4a.863.863 0 0 1-.071.062.778.778 0 0 1-1.226 0 .657.657 0 0 1-.07-.062l-4.4-4.4a.778.778 0 1 1 1.1-1.1z"
      fill="#b2b5b2"
      fillRule="evenodd"
      transform="translate(-1.149 -.444)"
    />
  </Wrapper>
)
