import React from 'react'
import { useWeb3Disconnected } from '../../contexts/Web3Context'
import { Route, Switch } from 'react-router-dom'
import { ConditionList } from 'pages/condition-list'

export const Disconnected = () => {
  const { connect } = useWeb3Disconnected()

  return (
    <>
      <button onClick={connect}>Connect</button>
      <Switch>
        <Route component={ConditionList} exact path="/conditions" />
      </Switch>
    </>
  )
}
