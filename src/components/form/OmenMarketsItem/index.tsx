import React, { useMemo, useState } from 'react'

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

export const OmenMarketsItem: React.FC<Props> = ({ conditionsIds, isConditionFromOmen, title }) => {
  const {
    data: dataOmenMarkets,
    error: errorOmenMarkets,
    loading: loadingOmenMarkets,
  } = useOmenMarkets(conditionsIds)
  const [openOmenMarkets, setOpenOmenMarkets] = useState(false)

  const omenMarkets = useMemo(() => {
    if (!loadingOmenMarkets && !errorOmenMarkets && dataOmenMarkets && dataOmenMarkets.length) {
      return dataOmenMarkets
    } else {
      return []
    }
  }, [dataOmenMarkets, errorOmenMarkets, loadingOmenMarkets])

  const areOmenMarketsMoreThanOne = useMemo(() => omenMarkets.length > 1, [omenMarkets])
  const firstMarket = useMemo(() => omenMarkets[0], [omenMarkets])

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
              {!areOmenMarketsMoreThanOne && <ButtonCopy value={firstMarket.id} /> && (
                <ExternalLink href={firstMarket.url} />
              )}
              {areOmenMarketsMoreThanOne && (
                <ButtonExpand onClick={() => setOpenOmenMarkets(true)} />
              )}
            </FlexRow>
          }
        />

        {openOmenMarkets && areOmenMarketsMoreThanOne && (
          <DisplayHashesTableModal
            hashes={omenMarkets.map(({ id, question }) => {
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
  } else {
    return isConditionFromOmen && title ? (
      <Row cols="1fr" marginBottomXL>
        <TitleValue title="Question" value={title} />
      </Row>
    ) : null
  }
}
