import React from 'react'

import { PageTitle } from '../../components/pureStyledComponents/PageTitle'
import { InfoCard } from '../../components/statusInfo/InfoCard'
import { InlineLoading } from '../../components/statusInfo/InlineLoading'
import { useConditionContext } from '../../contexts/ConditionContext'
import {
  isConditionErrorFetching,
  isConditionErrorInvalid,
  isConditionErrorNotFound,
} from '../../util/tools'

import { Contents } from './Contents'

interface WrapperProps {
  conditionId: string
}

export const Wrapper = (props: WrapperProps) => {
  const { conditionId } = props

  const { condition, errors, loading, setConditionId } = useConditionContext()

  React.useEffect(() => {
    setConditionId(conditionId)
  }, [conditionId, setConditionId])

  return (
    <>
      <PageTitle>Condition Details</PageTitle>
      {loading && <InlineLoading />}
      {!loading && !condition && isConditionErrorNotFound(errors) && (
        <InfoCard message="We couldn't find this condition..." title="Not Found" />
      )}
      {!loading && !condition && isConditionErrorInvalid(errors) && (
        <InfoCard message="Condition not valid..." title="Error" />
      )}
      {!loading && !condition && isConditionErrorFetching(errors) && (
        <InfoCard message="We couldn't fetch the data for this condition..." title="Error" />
      )}
      {condition && <Contents condition={condition} />}
    </>
  )
}
