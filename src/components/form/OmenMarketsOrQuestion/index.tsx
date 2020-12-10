import { useQuery } from '@apollo/react-hooks'
import React, { useMemo, useState } from 'react'
import styled from 'styled-components'

import { ButtonCopy } from 'components/buttons'
import { ButtonExpand } from 'components/buttons/ButtonExpand'
import { DisplayHashesTableModal } from 'components/modals/DisplayHashesTableModal'
import { ExternalLink } from 'components/navigation/ExternalLink'
import { Row } from 'components/pureStyledComponents/Row'
import { TitleValue } from 'components/text/TitleValue'
import { INFORMATION_NOT_AVAILABLE } from 'config/constants'
import { useOmenMarkets } from 'hooks/useOmenMarkets'
import {
  GetConditionWithQuestions,
  GetConditionWithQuestionsOfPosition,
} from 'queries/CTEConditionsWithQuestions'
import {
  GetConditionWithQuestions as FromConditionType,
  GetConditionWithQuestionsOfPosition_position as FromPositionType,
} from 'types/generatedGQLForCTE'
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

type Props =
  | {
      positionId: string
      conditionId?: never
    }
  | {
      positionId?: never
      conditionId: string
    }

export const OmenMarketsOrQuestion: React.FC<Props> = ({ conditionId, positionId }) => {
  // TODO Reuse as a way to ask something from position or from condition
  const { data: conditionsFromPosition, loading: loadingConditionsFromPosition } = useQuery<
    FromPositionType
  >(GetConditionWithQuestionsOfPosition, {
    skip: !!conditionId,
    variables: { id: positionId },
  })

  const { data: conditions, loading: loadingConditions } = useQuery<FromConditionType>(
    GetConditionWithQuestions,
    {
      skip: !!positionId,
      variables: { id: conditionId },
    }
  )

  const conditionsWithQuestions = useMemo(() => {
    if (!loadingConditions && !loadingConditionsFromPosition) {
      return [conditionsFromPosition?.conditions || conditions?.condition || []].flat()
    } else {
      return []
    }
  }, [conditions, conditionsFromPosition, loadingConditions, loadingConditionsFromPosition])

  const {
    areOmenMarketsMoreThanOne,
    data: dataOmenMarkets,
    firstMarket,
    loading: loadingOmenMarkets,
  } = useOmenMarkets(conditionsWithQuestions.map((c) => c.id))

  const loading = useMemo(
    () => !loadingOmenMarkets && !loadingConditions && !loadingConditionsFromPosition,
    [loadingConditions, loadingConditionsFromPosition, loadingOmenMarkets]
  )

  // TODO Narrow filtered type
  const titlesIDsPairs = useMemo(
    () =>
      conditionsWithQuestions
        .map(({ id, question }) => {
          return { id, title: question?.title }
        })
        .filter((p) => p.title),
    [conditionsWithQuestions]
  )
  const [openOmenMarkets, setOpenOmenMarkets] = useState(false)

  return loading ? (
    <Row>
      <TitleValue title="Loading" value="-" />
    </Row>
  ) : firstMarket ? (
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
          hashes={dataOmenMarkets.map(({ id, question }) => {
            return { hash: id, title: question.title, url: getOmenMarketURL(id) }
          })}
          isOpen={openOmenMarkets}
          onRequestClose={() => setOpenOmenMarkets(false)}
          title="Omen Markets"
          titleTable="Market Name"
        />
      )}
    </Row>
  ) : titlesIDsPairs.length > 0 ? (
    <Row>
      <TitleValue title="Question" value={titlesIDsPairs[0]} />
    </Row>
  ) : (
    <Row>
      <TitleValue title="Omen Markets" value={INFORMATION_NOT_AVAILABLE} />
    </Row>
  )
}
