import React, { useState } from 'react'

import { ButtonCopy } from 'components/buttons'
import { ButtonExpand } from 'components/buttons/ButtonExpand'
import { DisplayHashesTableModal } from 'components/modals/DisplayHashesTableModal'
import { ExternalLink } from 'components/navigation/ExternalLink'
import { FlexRow } from 'components/pureStyledComponents/FlexRow'
import { Row } from 'components/pureStyledComponents/Row'
import { TitleValue } from 'components/text/TitleValue'
import { OMEN_URL_DAPP } from 'config/constants'
import { useOmenMarkets } from 'hooks/useOmenMarkets'

interface Props {
  conditionsIds: string[]
  title?: string
  isConditionFromOmen?: boolean
}

export const OmenMarketsOrQuestion: React.FC<Props> = ({
  conditionsIds,
  isConditionFromOmen,
  title,
}) => {
  const {
    areOmenMarketsMoreThanOne,
    data: dataOmenMarkets,
    firstMarket,
    loading: loadingOmenMarkets,
  } = useOmenMarkets(conditionsIds)
  const [openOmenMarkets, setOpenOmenMarkets] = useState(false)

  if (loadingOmenMarkets) {
    return (
      <Row>
        <TitleValue title={'Loading...'} value={'-'} />
      </Row>
    )
  }

  if (firstMarket) {
    return (
      <Row>
        <TitleValue
          title={areOmenMarketsMoreThanOne ? 'Omen Markets' : 'Omen Market'}
          value={
            <FlexRow>
              {firstMarket.question.title}
              <ButtonCopy value={firstMarket.id} />
              {areOmenMarketsMoreThanOne ? (
                <ButtonExpand onClick={() => setOpenOmenMarkets(true)} />
              ) : (
                <ExternalLink href={firstMarket.url} />
              )}
            </FlexRow>
          }
        />

        {openOmenMarkets && areOmenMarketsMoreThanOne && (
          <DisplayHashesTableModal
            hashes={dataOmenMarkets.map(({ id, question }) => {
              return { hash: id, title: question.title }
            })}
            isOpen={openOmenMarkets}
            onRequestClose={() => setOpenOmenMarkets(false)}
            title="Omen Markets"
            titleTable="Market Name"
            url={OMEN_URL_DAPP}
          />
        )}
      </Row>
    )
  }

  if (isConditionFromOmen && title) {
    return (
      <Row cols="1fr" marginBottomXL>
        <TitleValue title="Question" value={title} />
      </Row>
    )
  }
  return null
}
