import { useWeb3Context } from 'contexts/Web3Context'
import React from 'react'
import { Redirect, Route, RouteProps, Switch } from 'react-router-dom'

import { ButtonConnect } from '../../components/buttons/ButtonConnect'
import { ConditionsDetailContainer } from '../condition-detail'
import { ConditionsList } from '../conditions-list'
import { PositionsList } from '../positions-list'
import { PrepareCondition } from '../prepare-condition'
import { SplitConditionContainer } from '../split-condition'

const ProtectedRoute: React.FC<RouteProps> = (props) => {
  const { component, path } = props
  const { status } = useWeb3Context()

  return (
    <>
      {status._type === 'notAsked' && (
        <>
          <p>
            This should trigger the connection prompt automatically (not show the connect button)
          </p>
          <ButtonConnect style={{ flexGrow: 0, height: 'auto' }} />
        </>
      )}
      {status._type === 'connecting' && <p>Connecting...</p>}
      {status._type === 'error' && <p>Error when trying to connect...</p>}
      {status._type === 'connected' && <Route component={component} exact path={path} />}
    </>
  )
}

export const Routes: React.FC = () => {
  return (
    <Switch>
      <Route component={ConditionsDetailContainer} exact path="/conditions/:conditionId" />
      <Route component={ConditionsList} exact path="/conditions" />
      <Route component={PositionsList} exact path="/positions" />
      <ProtectedRoute component={PrepareCondition} path="/prepare" />
      <ProtectedRoute component={SplitConditionContainer} path="/split" />
      <Route exact path="/">
        <Redirect to="/conditions" />
      </Route>
      <Route path="*">
        <div>Section not found...</div>
      </Route>
    </Switch>
  )
}
