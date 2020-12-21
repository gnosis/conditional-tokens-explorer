import { useQuery } from '@apollo/react-hooks'
import React, { useMemo } from 'react'

import { OmenMarkets } from 'components/form/OmenMarketsOrQuestion/OmenMarkets'
import { Questions } from 'components/form/OmenMarketsOrQuestion/Questions'
import { Row } from 'components/pureStyledComponents/Row'
import { TitleValue } from 'components/text/TitleValue'
import { useOmenMarkets } from 'hooks/useOmenMarkets'
import {
  GetConditionWithQuestions,
  GetConditionWithQuestionsOfPosition,
} from 'queries/CTEConditionsWithQuestions'
import {
  GetConditionWithQuestions as FromConditionType,
  GetConditionWithQuestionsOfPosition as FromPositionType,
} from 'types/generatedGQLForCTE'

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
  const variables = useMemo(() => {
    return { id: positionId || conditionId }
  }, [positionId, conditionId])

  const { data: conditionsFromPositionId, loading: loadingConditionsFromPositionId } = useQuery<
    FromPositionType
  >(GetConditionWithQuestionsOfPosition, {
    skip: !!conditionId,
    variables,
  })

  const { data: conditionsFromConditionId, loading: loadingConditionsFromConditionId } = useQuery<
    FromConditionType
  >(GetConditionWithQuestions, {
    skip: !!positionId,
    variables,
  })

  const conditionsMerged = useMemo(() => {
    if (!loadingConditionsFromPositionId && !loadingConditionsFromConditionId) {
      return [
        conditionsFromPositionId?.position?.conditions ||
          conditionsFromConditionId?.condition ||
          [],
      ].flat()
    } else {
      return []
    }
  }, [
    conditionsFromConditionId,
    conditionsFromPositionId,
    loadingConditionsFromConditionId,
    loadingConditionsFromPositionId,
  ])

  const conditionsIds = useMemo(() => conditionsMerged.map((c) => c.id), [conditionsMerged])

  const { data: omenMarkets, loading: loadingOmenMarkets } = useOmenMarkets(conditionsIds)

  const loading = useMemo(
    () => loadingOmenMarkets || loadingConditionsFromConditionId || loadingConditionsFromPositionId,
    [loadingConditionsFromConditionId, loadingOmenMarkets, loadingConditionsFromPositionId]
  )

  const omenMarketsComponent = useMemo(() => omenMarkets.length > 0 && <OmenMarkets data={omenMarkets} />, [omenMarkets])
  const questionComponent = useMemo(() => omenMarkets.length === 0 && conditionsMerged.length > 0 && conditionsMerged[0].question && <Questions data={conditionsMerged} /> , [conditionsMerged, omenMarkets])

  return loading ? (
    <Row>
      <TitleValue title="Loading" value="-" />
    </Row>
  ) : (
    <>
      {omenMarketsComponent}
      {questionComponent}
    </>
  )
}
