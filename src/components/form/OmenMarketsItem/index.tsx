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
import { getOmenMarketURL } from 'util/tools'

interface Props {
  conditionsIds: string[]
}

export const OmenMarketsItem: React.FC<Props> = ({ conditionsIds }) => {
  const {
    data: dataOmenMarkets,
    error: errorOmenMarkets,
    loading: loadingOmenMarkets,
  } = useOmenMarkets(conditionsIds)
  const [openOmenMarkets, setOpenOmenMarkets] = useState(false)

  const omenMarkets = useMemo(() => {
    if (
      !loadingOmenMarkets &&
      !errorOmenMarkets &&
      dataOmenMarkets?.condition?.fixedProductMarketMakers &&
      dataOmenMarkets?.condition?.fixedProductMarketMakers?.length > 0
    ) {
      return dataOmenMarkets.condition.fixedProductMarketMakers
    } else {
      return []
    }
  }, [dataOmenMarkets, errorOmenMarkets, loadingOmenMarkets])

  const areOmenMarketsMoreThanOne = useMemo(() => omenMarkets.length > 1, [omenMarkets])
  if (omenMarkets.length > 0) {
    return (
      <Row>
        <TitleValue
          title={areOmenMarketsMoreThanOne ? 'Omen Markets' : 'Omen Market'}
          value={
            <FlexRow>
              {omenMarkets[0].question ? omenMarkets[0].question.title : omenMarkets[0].id}
              {!areOmenMarketsMoreThanOne && <ButtonCopy value={omenMarkets[0].id} /> && (
                <ExternalLink href={getOmenMarketURL(omenMarkets[0].id)} />
              )}
              {areOmenMarketsMoreThanOne && (
                <ButtonExpand onClick={() => setOpenOmenMarkets(true)} />
              )}
            </FlexRow>
          }
        />

        {openOmenMarkets && omenMarkets.length > 0 && (
          <DisplayHashesTableModal
            hashes={omenMarkets.map(({ id, question }) => {
              return { hash: id, title: question?.title || undefined }
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
    return null
  }
}
