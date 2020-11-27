import React, { useState } from 'react'
import styled from 'styled-components'

import { ButtonCopy } from 'components/buttons'
import { ButtonExpand } from 'components/buttons/ButtonExpand'
import { DisplayHashesTableModal } from 'components/modals/DisplayHashesTableModal'
import { ExternalLink } from 'components/navigation/ExternalLink'
import { TitleValue } from 'components/text/TitleValue'
import { useOmenMarkets } from 'hooks/useOmenMarkets'
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

  return loadingOmenMarkets ? (
    <TitleValue title="Loading" value="-" />
  ) : firstMarket ? (
    <>
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
          hashes={dataOmenMarkets.map(({ id, question }) => {
            return { hash: id, title: question.title, url: getOmenMarketURL(id) }
          })}
          isOpen={openOmenMarkets}
          onRequestClose={() => setOpenOmenMarkets(false)}
          title="Omen Markets"
          titleTable="Market Name"
        />
      )}
    </>
  ) : isConditionFromOmen && title ? (
    <TitleValue title="Question" value={title} />
  ) : null
}
