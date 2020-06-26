import React from 'react'
import { useWeb3Disconnected } from '../../contexts/Web3Context'
import { Route, Switch } from 'react-router-dom'
import { ConditionsList } from 'pages/conditions-list'
import { PositionsList } from 'pages/positions-list'

export const Disconnected = () => {
  const { connect } = useWeb3Disconnected()

  return (
    <>
      <button onClick={connect}>Connect</button>
      <Switch>
        <Route component={ConditionsList} exact path="/conditions" />
        <Route component={PositionsList} exact path="/positions" />
      </Switch>
    </>
  )
}
