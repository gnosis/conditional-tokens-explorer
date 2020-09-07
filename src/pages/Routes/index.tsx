import React from 'react'
import { Redirect, Route, RouteProps, Switch } from 'react-router-dom'

import { InfoCard } from 'components/statusInfo/InfoCard'
import { Web3ContextStatus, useWeb3Context } from 'contexts/Web3Context'
import { ConditionDetails } from 'pages/ConditionDetails'
import { ConditionsList } from 'pages/ConditionsList'
import { MergePositions } from 'pages/MergePositions'
import { PositionDetails } from 'pages/PositionDetails'
import { PositionsList } from 'pages/PositionsList'
import { PrepareCondition } from 'pages/PrepareCondition'
import { RedeemPosition } from 'pages/RedeemPosition'
import { ReportPayoutsContainer } from 'pages/ReportPayouts'
import { SplitPosition } from 'pages/SplitPosition'

const ProtectedRoute: React.FC<RouteProps> = (props) => {
  const { component, path } = props
  const { status } = useWeb3Context()

  return (
    <>
      {status._type === 'error' && (
        <InfoCard message="Error when trying to connect..." title="Error" />
      )}
      {(status._type === Web3ContextStatus.Connected ||
        status._type === Web3ContextStatus.Infura) && (
        <Route component={component} exact path={path} />
      )}
    </>
  )
}

export const Routes: React.FC = () => {
  return (
    <Switch>
      <ProtectedRoute component={ConditionsList} exact path="/conditions" />
      <ProtectedRoute component={ConditionDetails} exact path="/conditions/:conditionId" />
      <ProtectedRoute component={PositionsList} exact path="/positions" />
      <ProtectedRoute component={PositionDetails} exact path="/positions/:positionId" />
      <ProtectedRoute component={PrepareCondition} path="/prepare" />
      <ProtectedRoute component={SplitPosition} path="/split" />
      <ProtectedRoute component={ReportPayoutsContainer} path="/report" />
      <ProtectedRoute component={RedeemPosition} path="/redeem" />
      <ProtectedRoute component={MergePositions} path="/merge" />
      <Route exact path="/">
        <Redirect to="/conditions" />
      </Route>
      <Route path="*">
        <InfoCard message="Page not found..." title="Error 404" />
      </Route>
    </Switch>
  )
}
