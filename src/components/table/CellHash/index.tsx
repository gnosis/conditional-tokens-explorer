import React from 'react'
import { NavLink } from 'react-router-dom'
import styled, { css } from 'styled-components'

import { ButtonCopy } from 'components/buttons/ButtonCopy'
import { ExternalLinkIcon } from 'components/icons/ExternalLinkIcon'
import { truncateStringInTheMiddle } from 'util/tools'

const Wrapper = styled.span`
  align-items: center;
  display: flex;
  flex-grow: 1;
  flex-wrap: nowrap;
  white-space: nowrap;
`

const TextCSS = css`
  color: ${(props) => props.theme.colors.textColor};
  font-family: 'Roboto Mono', monospace;
  text-transform: uppercase;
`

const Text = styled.span`
  ${TextCSS}
`

const Link = styled(NavLink)`
  ${TextCSS}
`

const ExternalLink = styled.a`
  align-items: center;
  display: flex;
  justify-content: center;
  margin-left: 10px;
  text-decoration: none;
`

interface Props {
  externalLink?: boolean
  href?: string
  onClick?: () => void
  truncateInTheMiddle?: boolean
  value: string
}

export const CellHash: React.FC<Props> = (props) => {
  const { externalLink, href, onClick, truncateInTheMiddle = true, value, ...restProps } = props
  const shownValue = truncateInTheMiddle ? truncateStringInTheMiddle(value, 10, 8) : value
  const port = window.location.port !== '' ? `:${window.location.port}` : ''

  return (
    <Wrapper {...restProps}>
      {href ? (
        <Link className="cellHashText" to={href}>
          {shownValue}
        </Link>
      ) : (
        <Text className="cellHashText" onClick={onClick}>
          {shownValue}
        </Text>
      )}
      <ButtonCopy light value={value} />
      {externalLink && (
        <ExternalLink
          href={`${window.location.protocol}//${window.location.hostname}${port}/#/${href}`}
          target="_blank"
        >
          <ExternalLinkIcon />
        </ExternalLink>
      )}
    </Wrapper>
  )
}
