import React from 'react'
import { useHistory } from 'react-router-dom'

import { ButtonType } from 'components/buttons/buttonStylingTypes'
import { FullLoading } from 'components/statusInfo/FullLoading'
import { InfoCard } from 'components/statusInfo/InfoCard'
import { InlineLoading } from 'components/statusInfo/InlineLoading'
import { IconTypes } from 'components/statusInfo/common'
import { PageTitle } from 'components/text/PageTitle'
import { useConditionContext } from 'contexts/ConditionContext'
import { Contents } from 'pages/ConditionDetails/Contents'
import {
  isConditionErrorFetching,
  isConditionErrorInvalid,
  isConditionErrorNotFound,
  isConditionErrorNotIndexed,
} from 'util/tools'

interface WrapperProps {
  conditionId: string
}

export const Wrapper = (props: WrapperProps) => {
  const { conditionId } = props
  const history = useHistory()

  const { condition, errors, loading, setConditionId } = useConditionContext()

  React.useEffect(() => {
    setConditionId(conditionId)
  }, [conditionId, setConditionId])

  const DisplayErrors = React.useCallback(() => {
    const isNotLoadingAndThereIsNoCondition: boolean = !loading && !condition
    if (isNotLoadingAndThereIsNoCondition && isConditionErrorNotIndexed(errors)) {
      return (
        <FullLoading
          actionButton={{
            buttonType: ButtonType.primary,
            text: 'OK',
            onClick: () => history.push(`/conditions`),
          }}
          icon={IconTypes.spinner}
          message="Transaction successfully finished, now waiting for the condition to be indexed. Check again in a few minutes."
          title="Condition details"
          width="400px"
        />
      )
    } else if (isNotLoadingAndThereIsNoCondition && isConditionErrorInvalid(errors)) {
      return <InfoCard message="Condition not valid..." title="Error" />
    } else if (isNotLoadingAndThereIsNoCondition && isConditionErrorFetching(errors)) {
      return <InfoCard message="We couldn't fetch the data for this condition..." title="Error" />
    } else if (isNotLoadingAndThereIsNoCondition && isConditionErrorNotFound(errors)) {
      return <InfoCard message="We couldn't find this condition..." title="Not Found" />
    } else {
      return null
    }
  }, [condition, errors, history, loading])

  return (
    <>
      <PageTitle>Condition Details</PageTitle>
      {loading && errors.length === 0 && <InlineLoading />}
      {<DisplayErrors />}
      {!loading && condition && <Contents condition={condition} />}
    </>
  )
}
