import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { PrepareCondition } from '../prepare-condition'
import { SplitConditionContainer } from '../split-condition'
import { ConditionList } from 'pages/condition-list'

export const Connected = () => {
  return (
    <Switch>
      <Route component={PrepareCondition} exact path="/" />
      <Route component={SplitConditionContainer} exact path="/split/" />
      <Route component={ConditionList} exact path="/conditions" />
    </Switch>
  )
}
