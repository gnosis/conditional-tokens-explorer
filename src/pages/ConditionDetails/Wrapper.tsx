import React from 'react'

import { PageTitle } from 'components/pureStyledComponents/PageTitle'
import { InfoCard } from 'components/statusInfo/InfoCard'
import { InlineLoading } from 'components/statusInfo/InlineLoading'
import { useConditionContext } from 'contexts/ConditionContext'
import { Contents } from 'pages/ConditionDetails/Contents'
import {
  isConditionErrorFetching,
  isConditionErrorInvalid,
  isConditionErrorNotFound,
} from 'util/tools'

interface WrapperProps {
  conditionId: string
}

export const Wrapper = (props: WrapperProps) => {
  const { conditionId } = props

  const { condition, errors, loading, setConditionId } = useConditionContext()

  React.useEffect(() => {
    setConditionId(conditionId)
  }, [conditionId, setConditionId])

  const DisplayErrors = (): JSX.Element => {
    const isNotLoadingAndThereIsNoCondition: boolean = !loading && !condition
    if (isNotLoadingAndThereIsNoCondition && isConditionErrorNotFound(errors)) {
      return <InfoCard message="We couldn't find this condition..." title="Not Found" />
    } else if (isNotLoadingAndThereIsNoCondition && isConditionErrorInvalid(errors)) {
      return <InfoCard message="Condition not valid..." title="Error" />
    } else if (isNotLoadingAndThereIsNoCondition && isConditionErrorFetching(errors)) {
      return <InfoCard message="We couldn't fetch the data for this condition..." title="Error" />
    } else {
      return <></>
    }
  }

  return (
    <>
      <PageTitle>Condition Details</PageTitle>
      {loading && <InlineLoading />}
      {<DisplayErrors />}
      {!loading && condition && <Contents condition={condition} />}
    </>
  )
}
