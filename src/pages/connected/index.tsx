import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { PrepareCondition } from '../prepare-condition'
import { SplitConditionContainer } from '../split-condition'

export const Connected = () => {
  return (
    <Switch>
      <Route component={PrepareCondition} exact path="/" />
      <Route component={SplitConditionContainer} exact path="/split/" />
    </Switch>
  )
}
