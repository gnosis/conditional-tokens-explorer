import React from 'react'
import styled from 'styled-components'

import { BaseCard } from 'components/pureStyledComponents/BaseCard'
import { PageTitle } from 'components/pureStyledComponents/PageTitle'
import { Paragraph } from 'components/pureStyledComponents/Paragraph'
import { Title } from 'components/pureStyledComponents/Title'

const BaseCardGrow = styled(BaseCard)`
  flex-grow: 1;
`

export const TermsAndConditions: React.FC = () => {
  return (
    <>
      <PageTitle>Terms And Conditions</PageTitle>
      <BaseCardGrow>
        <Title>Donec tincidunt, justo a pharetra feugiat.</Title>
        <Paragraph>
          Pellentesque lobortis mi pharetra, fermentum libero eget, ultricies leo. Nam pulvinar
          aliquam turpis eget fermentum. Vivamus viverra neque erat. Pellentesque suscipit mollis
          rhoncus. <a href="/terms-and-conditions">Proin vulputate</a> augue ut laoreet pretium. Sed
          in viverra metus. Cras dapibus lorem at eleifend cursus. Proin a rutrum elit, ac faucibus
          nisl. Sed tincidunt rhoncus tempor. <strong>Morbi fermentum</strong> mi dolor, vel
          consectetur elit ultricies sed. Cras convallis risus eu urna consectetur mollis. Mauris ut
          eros faucibus nunc maximus cursus vel non enim. Nulla id orci ex.
        </Paragraph>
        <Title>Orci varius natoque penatibus et magnis.</Title>
        <Paragraph>
          Vestibulum eros lacus, lobortis vitae diam non, dignissim iaculis risus. Fusce vulputate
          faucibus velit at dignissim. Morbi vitae consectetur est, eget scelerisque tortor. Sed
          cursus libero vitae rutrum tempor. Pellentesque porttitor risus velit, sagittis dignissim
          ipsum vulputate sed. <strong>Nunc ut mauris ut tellus</strong> ultricies placerat.
          Praesent tincidunt lorem id enim auctor, in pulvinar nulla dapibus. Suspendisse potenti.
        </Paragraph>
        <Paragraph>
          Pellentesque rhoncus cursus urna, a ultricies lorem imperdiet in. Nunc scelerisque ipsum
          et diam vulputate, sed sagittis ligula condimentum. Donec sagittis dui ac urna malesuada
          porttitor. Nunc fringilla libero quis pulvinar dapibus. Vivamus vehicula, quam id vehicula
          congue, elit lacus dapibus leo, at condimentum sapien leo ac orci. Donec maximus est nec
          lorem volutpat lobortis. Phasellus ac ullamcorper tellus. Sed scelerisque odio at rhoncus
          sagittis. Orci varius natoque penatibus et magnis dis parturient montes, nascetur
          ridiculus mus. <a href="/terms-and-conditions">Sed ut vulputate lacus</a>, vel semper est.
          Sed aliquet aliquet ipsum, et porttitor justo volutpat quis.
        </Paragraph>
      </BaseCardGrow>
    </>
  )
}
