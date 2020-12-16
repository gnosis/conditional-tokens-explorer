import React, { useMemo, useState } from 'react'
import styled from 'styled-components'

import { ButtonCopy } from 'components/buttons'
import { ButtonExpand } from 'components/buttons/ButtonExpand'
import { DisplayHashesTableModal } from 'components/modals/DisplayHashesTableModal'
import { ExternalLink } from 'components/navigation/ExternalLink'
import { Row } from 'components/pureStyledComponents/Row'
import { TitleValue } from 'components/text/TitleValue'
import { OmenMarketWithURL } from 'hooks/useOmenMarkets'
import { getOmenMarketURL } from 'util/tools'
const ButtonCopyInlineFlex = styled(ButtonCopy)`
  display: inline-flex;
`

const ButtonExpandInlineFlex = styled(ButtonExpand)`
  display: inline-flex;
`

const ExternalLinkInlineFlex = styled(ExternalLink)`
  display: inline-flex;
`

const DisplayBlock = styled.div`
  display: block;
`

interface Props {
  data: OmenMarketWithURL[]
}
export const OmenMarkets = ({ data: omenMarkets }: Props) => {
  const [openOmenMarkets, setOpenOmenMarkets] = useState(false)

  const firstMarket = useMemo(() => omenMarkets[0], [omenMarkets])
  const areOmenMarketsMoreThanOne = useMemo(() => omenMarkets.length > 1, [omenMarkets])

  return (
    <Row>
      <TitleValue
        title={areOmenMarketsMoreThanOne ? 'Omen Markets' : 'Omen Market'}
        value={
          <DisplayBlock>
            {firstMarket.question.title}
            <ButtonCopyInlineFlex value={firstMarket.id} />
            {areOmenMarketsMoreThanOne ? (
              <ButtonExpandInlineFlex onClick={() => setOpenOmenMarkets(true)} />
            ) : (
              <ExternalLinkInlineFlex href={firstMarket.url} />
            )}
          </DisplayBlock>
        }
      />
      {openOmenMarkets && areOmenMarketsMoreThanOne && (
        <DisplayHashesTableModal
          hashes={omenMarkets.map(({ id, question }) => {
            return { hash: id, title: question.title, url: getOmenMarketURL(id) }
          })}
          isOpen={openOmenMarkets}
          onRequestClose={() => setOpenOmenMarkets(false)}
          title="Omen Markets"
          titleTable="Market Name"
        />
      )}
    </Row>
  )
}
