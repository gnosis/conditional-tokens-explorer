import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { PrepareCondition } from '../prepare-condition'
import { SplitCondition } from '../split-condition'

export const Connected = () => {
  return (
    <Switch>
      <Route component={PrepareCondition} exact path="/" />
      <Route component={SplitCondition} path="/split/:condition?" />
    </Switch>
  )
}
