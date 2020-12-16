import { useQuery } from '@apollo/react-hooks'
import React, { useMemo } from 'react'

import { OmenMarkets } from 'components/form/OmenMarketsOrQuestion/OmenMarkets'
import { Questions } from 'components/form/OmenMarketsOrQuestion/Questions'
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
    conditionsFromConditionId?.condition,
    conditionsFromPositionId?.position?.conditions,
    loadingConditionsFromConditionId,
    loadingConditionsFromPositionId,
  ])

  const conditionsIds = useMemo(() => conditionsMerged.map((c) => c.id), [conditionsMerged])

  const { data: omenMarkets, loading: loadingOmenMarkets } = useOmenMarkets(conditionsIds)

  const loading = useMemo(
    () => loadingOmenMarkets || loadingConditionsFromConditionId || loadingConditionsFromPositionId,
    [loadingConditionsFromConditionId, loadingOmenMarkets, loadingConditionsFromPositionId]
  )

  return loading ? (
    <Row>
      <TitleValue title="Loading" value="-" />
    </Row>
  ) : (
    <>
      {omenMarkets.length > 0 && <OmenMarkets data={omenMarkets} />}
      {conditionsMerged.length > 0 && <Questions data={conditionsMerged} />}
    </>
  )
}
