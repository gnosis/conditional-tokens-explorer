import React from 'react'
import styled from 'styled-components'

import { BaseCard } from 'components/pureStyledComponents/BaseCard'
import { PageTitle } from 'components/pureStyledComponents/PageTitle'
import { Paragraph } from 'components/pureStyledComponents/Paragraph'
import { Title } from 'components/pureStyledComponents/Title'

const BaseCardGrow = styled(BaseCard)`
  flex-grow: 1;
`

export const CookiePolicy: React.FC = () => {
  return (
    <>
      <PageTitle>Cookie Policy</PageTitle>
      <BaseCardGrow>
        <Title>Donec tincidunt.</Title>
        <Paragraph>
          Pellentesque lobortis mi pharetra, fermentum libero eget, ultricies leo. Nam pulvinar
          aliquam turpis eget fermentum. Vivamus viverra neque erat. Pellentesque suscipit mollis
          rhoncus.
        </Paragraph>
        <Title>Orci varius.</Title>
        <Paragraph>
          Phasellus ac ullamcorper tellus. Sed scelerisque odio at rhoncus sagittis. Orci varius
          natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.{' '}
          <a href="/terms-and-conditions">Sed ut vulputate lacus</a>, vel semper est. Sed aliquet
          aliquet ipsum, et porttitor justo volutpat quis.
        </Paragraph>
      </BaseCardGrow>
    </>
  )
}
