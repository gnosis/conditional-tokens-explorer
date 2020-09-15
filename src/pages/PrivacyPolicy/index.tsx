import React from 'react'
import styled from 'styled-components'

import { BaseCard } from 'components/pureStyledComponents/BaseCard'
import { PageTitle } from 'components/pureStyledComponents/PageTitle'
import { Paragraph } from 'components/pureStyledComponents/Paragraph'
import { Title } from 'components/pureStyledComponents/Title'

const BaseCardGrow = styled(BaseCard)`
  flex-grow: 1;
`

export const PrivacyPolicy: React.FC = () => {
  return (
    <>
      <PageTitle>Privacy Policy</PageTitle>
      <BaseCardGrow>
        <Title>Donec tincidunt, justo a pharetra feugiat.</Title>
        <Paragraph>
          Pellentesque lobortis mi pharetra, fermentum libero eget, ultricies leo. Nam pulvinar
          aliquam turpis eget fermentum. Vivamus viverra neque erat. Pellentesque suscipit mollis
          rhoncus.
        </Paragraph>
        <Title>Orci varius natoque penatibus et magnis.</Title>
        <Paragraph>
          Vestibulum eros lacus, lobortis vitae diam non, dignissim iaculis risus. Fusce vulputate
          faucibus velit at dignissim. Morbi vitae consectetur est, eget scelerisque tortor. Sed
          cursus libero vitae rutrum tempor. Pellentesque porttitor risus velit, sagittis dignissim
          ipsum vulputate sed. <strong>Nunc ut mauris ut tellus</strong> ultricies placerat.
          Praesent tincidunt lorem id enim auctor, in pulvinar nulla dapibus. Suspendisse potenti.
        </Paragraph>
      </BaseCardGrow>
    </>
  )
}
