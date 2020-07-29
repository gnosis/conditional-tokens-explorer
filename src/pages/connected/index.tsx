import { ConditionsDetailContainer } from 'pages/condition-detail'
import { ConditionsList } from 'pages/conditions-list'
import { PositionsList } from 'pages/positions-list'
import React from 'react'
import { Route, Switch } from 'react-router-dom'

import { PrepareCondition } from '../prepare-condition'
import { SplitConditionContainer } from '../split-condition'

export const Connected = () => {
  return (
    <Switch>
      <Route component={PrepareCondition} exact path="/" />
      <Route component={SplitConditionContainer} exact path="/split/" />
      <Route component={ConditionsList} exact path="/conditions" />
      <Route component={ConditionsDetailContainer} exact path="/conditions/:conditionId" />
      <Route component={PositionsList} exact path="/positions" />
    </Switch>
  )
}
