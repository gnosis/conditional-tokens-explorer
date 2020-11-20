import React from 'react'
import styled from 'styled-components'

import { BaseCard } from 'components/pureStyledComponents/BaseCard'
import { Li, OrderedList } from 'components/pureStyledComponents/Lists'
import { PageTitle } from 'components/pureStyledComponents/PageTitle'
import { PageTitleNote } from 'components/pureStyledComponents/PageTitleNote'
import { Paragraph } from 'components/pureStyledComponents/Paragraph'
import { Title } from 'components/pureStyledComponents/Title'

const BaseCardGrow = styled(BaseCard)`
  flex-grow: 1;
`

const PageTitleStyled = styled(PageTitle)`
  margin: 0;
`

const LiTitle = styled(Title)`
  margin: 30px 0 10px 0;
`

const ColorToMakeSurePeopleNoticesTheText = styled.span`
  color: ${(props) => props.theme.colors.error};
`

export const TermsAndConditions: React.FC = () => {
  return (
    <>
      <PageTitleStyled>Terms</PageTitleStyled>
      <PageTitleNote>(last updated: October 2020)</PageTitleNote>
      <BaseCardGrow>
        <Paragraph>
          <ColorToMakeSurePeopleNoticesTheText>
            THESE TERMS CREATE A BINDING LEGAL CONTRACT BETWEEN YOU AND GNOSIS LIMITED. BY USING OUR
            SERVICES (DEFINED BELOW), YOU AGREE TO BE BOUND BY THESE TERMS. IF YOU DO NOT ACCEPT THE
            TERMS, YOU MUST NOT AND ARE NOT AUTHORIZED TO USE ANY OF OUR SERVICES. FOR PERSONS
            RESIDING IN THE USA: THESE TERMS CONTAIN ADDITIONAL PROVISIONS APPLICABLE ONLY TO YOU.
            THEY CONTAIN AN ARBITRATION PROVISION. IF WE CANNOT RESOLVE A DISPUTE AMICABLY, ALL
            DISPUTES ARISING UNDER OR IN CONNECTION WITH THIS AGREEMENT MUST BE SETTLED IN BINDING
            ARBITRATION PER CLAUSE 28.4. ENTERING INTO THIS AGREEMENT CONSTITUTES A WAIVER OF YOUR
            RIGHT, IF ANY, TO PARTICIPATE IN A CLASS ACTION LAWSUIT OR A JURY TRIAL.
          </ColorToMakeSurePeopleNoticesTheText>
        </Paragraph>
        <OrderedList>
          <Li>
            <LiTitle>What is the scope of the Terms?</LiTitle>
          </Li>
          <Li>
            <LiTitle>What do some of the capitalised terms mean in the Agreement?</LiTitle>
          </Li>
          <Li>
            <LiTitle>What are the Services of the Conditional Token Explorer and Factory?</LiTitle>
          </Li>
          <Li>
            <LiTitle>What do the Services of the CTE not consist of?</LiTitle>
          </Li>
          <Li>
            <LiTitle>
              Are we responsible for the security of your Private Keys, seed words or other
              credentials?
            </LiTitle>
          </Li>
          <Li>
            <LiTitle>
              Are you eligible to use our Services and can we check your suitability?
            </LiTitle>
          </Li>
          <Li>
            <LiTitle>Can we terminate or limit your right to use our Services?</LiTitle>
          </Li>
          <Li>
            <LiTitle>What licenses and access do we grant to you?</LiTitle>
          </Li>
          <Li>
            <LiTitle>
              What can you expect from the Services and can we make changes to them?
            </LiTitle>
          </Li>
          <Li>
            <LiTitle>Do we have any fiduciary duties to you?</LiTitle>
          </Li>
          <Li>
            <LiTitle>What about third-party risk?</LiTitle>
          </Li>
          <Li>
            <LiTitle>Can your Data Privacy be ensured?</LiTitle>
          </Li>
          <Li>
            <LiTitle>What do you agree, warrant and represent?</LiTitle>
          </Li>
          <Li>
            <LiTitle>What if you breach this Agreement?</LiTitle>
          </Li>
          <Li>
            <LiTitle>What about our liability to you?</LiTitle>
          </Li>
          <Li>
            <LiTitle>What about viruses, bugs and security vulnerabilities?</LiTitle>
          </Li>
          <Li>
            <LiTitle>Can you link to our CTE Interface?</LiTitle>
          </Li>
          <Li>
            <LiTitle>
              What if an event outside our control happens that affects our Services?
            </LiTitle>
          </Li>
          <Li>
            <LiTitle>Who is responsible for your tax liabilities?</LiTitle>
          </Li>
          <Li>
            <LiTitle>What if a court disagrees with part of this Agreement?</LiTitle>
          </Li>
          <Li>
            <LiTitle>What if we do not enforce certain rights under this Agreement?</LiTitle>
          </Li>
          <Li>
            <LiTitle>Do third parties have rights?</LiTitle>
          </Li>
          <Li>
            <LiTitle>Can this Agreement be assigned?</LiTitle>
          </Li>
          <Li>
            <LiTitle>Which clauses of this Agreement survive termination?</LiTitle>
          </Li>
          <Li>
            <LiTitle>Which laws apply to this agreement?</LiTitle>
          </Li>
          <Li>
            <LiTitle>How can you get support for the CTE and tell us about any problems?</LiTitle>
          </Li>
          <Li>
            <LiTitle>
              How can we resolve disputes and where can you bring legal proceedings?
            </LiTitle>
          </Li>
          <Li>
            <LiTitle>Is this all?</LiTitle>
          </Li>
        </OrderedList>
        <Paragraph>
          Gnosis Limited
          <br />
          World Trade Center
          <br />
          6 Bayside Rd
          <br />
          GIBRALTAR
          <br />
          GX11 1AA
        </Paragraph>
      </BaseCardGrow>
    </>
  )
}
