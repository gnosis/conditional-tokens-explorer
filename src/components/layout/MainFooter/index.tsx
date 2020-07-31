import React from 'react'
import { NavLink } from 'react-router-dom'
import styled, { css } from 'styled-components'

import { version as appVersion } from '../../../../package.json'

const Wrapper = styled.footer`
  margin-top: auto;
  padding: 25px 0;
`

const Items = styled.ul`
  display: flex;
  justify-content: center;
  list-style: none;
  margin: 0;
  padding: 0;
`

const Item = styled.li`
  color: ${(props) => props.theme.colors.textColor};

  &:last-child {
    .break {
      display: none;
    }
  }
`

const LinkCSS = css`
  color: ${(props) => props.theme.colors.textColor};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

const ExternalLink = styled.a`
  ${LinkCSS}
`

const FooterLink = styled(NavLink)`
  ${LinkCSS}
`

const Break = styled.span`
  margin: 0 6px;

  &:after {
    content: '|';
  }
`

const Text = styled.span``

export const MainFooter: React.FC = (props) => {
  const date = new Date()
  const year = date.getFullYear()
  const version = appVersion || 'Invalid Version Number'

  const items = [
    {
      externalLink: true,
      title: `©${year} Gnosis`,
      url: 'https://gnosis.io/',
    },
    {
      title: 'Terms & Conditions',
      url: '/terms-and-conditions',
    },
    {
      title: 'Privacy Policy',
      url: '/privacy-policy',
    },
    {
      title: 'Cookie Policy',
      url: '/cookie-policy',
    },
    {
      externalLink: true,
      title: `v${version}`,
      url: 'https://github.com/gnosis/conditional-tokens-explorer/',
    },
  ]

  return (
    <Wrapper {...props}>
      <Items>
        {items.map((item, index) => {
          return (
            <Item key={index}>
              {item.externalLink && item.url && (
                <ExternalLink href={item.url} rel="noopener noreferrer" target="_blank">
                  {item.title}
                </ExternalLink>
              )}
              {!item.externalLink && item.url && (
                <FooterLink to={item.url}>{item.title}</FooterLink>
              )}
              {!item.externalLink && !item.url && <Text>{item.title}</Text>}
              <Break className="break" />
            </Item>
          )
        })}
      </Items>
    </Wrapper>
  )
}
