import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.svg`
  display: block;

  .fill {
    fill: ${(props) => props.theme.colors.mediumGrey};
  }

  &:hover {
    .fill {
      fill: ${(props) => props.theme.colors.primary};
    }
  }
`

export const ExternalLinkIcon: React.FC<{ className?: string }> = (props) => (
  <Wrapper
    className={`externalLinkIcon ${props.className}`}
    height="15"
    viewBox="0 0 24 24"
    width="15"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g fill="none" fillRule="evenodd">
      <path d="M0 0H24V24H0z" />
      <path
        className="fill"
        d="M20 20v-8c0-.552.448-1 1-1s1 .448 1 1v8c0 1.105-.895 2-2 2H4c-1.105 0-2-.895-2-2V4c0-1.105.895-2 2-2h8c.552 0 1 .448 1 1s-.448 1-1 1H4v16h16z"
        fillRule="nonzero"
      />
      <path
        className="fill"
        d="M18.536 4H15.95c-.553 0-1-.448-1-1s.447-1 1-1h5c.276 0 .526.112.707.293.18.18.293.43.293.707v5c0 .552-.448 1-1 1-.553 0-1-.448-1-1V5.414l-9.243 9.243c-.39.39-1.024.39-1.414 0-.39-.39-.39-1.024 0-1.414L18.536 4z"
      />
    </g>
  </Wrapper>
)
