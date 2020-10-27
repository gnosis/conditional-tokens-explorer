import React from 'react'
import { NavLink } from 'react-router-dom'
import styled, { css } from 'styled-components'

import { ButtonCopy } from 'components/buttons/ButtonCopy'
import { ExternalLink } from 'components/navigation/ExternalLink'
import { FormatHash } from 'components/text/FormatHash'
import { truncateStringInTheMiddle } from 'util/tools'

const Wrapper = styled.span`
  align-items: center;
  display: inline-flex;
  flex-wrap: nowrap;
  white-space: nowrap;
`

const TextCSS = css`
  color: ${(props) => props.theme.colors.textColor};
  font-family: 'Roboto Mono', monospace;
`

const Text = styled.span`
  ${TextCSS}
`

const Link = styled(NavLink)`
  ${TextCSS}
`

const ButtonCopyStyled = styled(ButtonCopy)`
  position: relative;
  top: 1px;
`

const ExternalLinkStyled = styled(ExternalLink)`
  position: relative;
  top: 1px;
`

interface Props {
  externalLink?: boolean
  href?: string
  onClick?: () => void
  truncateInTheMiddle?: boolean
  value: string
}

export const Hash: React.FC<Props> = (props) => {
  const { externalLink, href, onClick, truncateInTheMiddle = true, value, ...restProps } = props
  const shownValue = truncateInTheMiddle ? truncateStringInTheMiddle(value, 10, 8) : value
  const port = window.location.port !== '' ? `:${window.location.port}` : ''

  return (
    <Wrapper {...restProps}>
      {href ? (
        <Link className="hashText" to={href}>
          <FormatHash hash={shownValue} />
        </Link>
      ) : (
        <Text className="hashText" onClick={onClick}>
          <FormatHash hash={shownValue} />
        </Text>
      )}
      <ButtonCopyStyled light value={value} />
      {externalLink && (
        <ExternalLinkStyled
          href={`${window.location.protocol}//${window.location.hostname}${port}/#${href}`}
        />
      )}
    </Wrapper>
  )
}
