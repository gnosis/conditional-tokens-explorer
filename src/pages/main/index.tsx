import React from 'react'
import { useQuery } from '@apollo/react-hooks'

import { Disconnected } from 'pages/disconnected'
import { Connected } from 'pages/connected'
import { useWeb3Context } from 'contexts/Web3Context'
import { ConditionsList } from 'queries/conditions'
import { ConditionList_conditions } from 'types/generatedGQL'

export const Main = () => {
  const { data, error, fetchMore, loading } = useQuery<ConditionList_conditions>(ConditionsList)

  console.log(data)

  const { status } = useWeb3Context()
  if (status._type === 'notAsked') {
    return <Disconnected></Disconnected>
  }
  if (status._type === 'connected') {
    return <Connected></Connected>
  } else {
    return null
  }
}
