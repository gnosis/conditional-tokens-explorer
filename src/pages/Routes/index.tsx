import { useWeb3Context } from 'contexts/Web3Context'
import React from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'

import { ButtonConnect } from '../../components/buttons/ButtonConnect'
import { ConditionsDetailContainer } from '../condition-detail'
import { ConditionsList } from '../conditions-list'
import { PositionsList } from '../positions-list'
import { PrepareCondition } from '../prepare-condition'
import { SplitConditionContainer } from '../split-condition'

interface IsConnectedProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: any
  path: string
}

const IsConnected: React.FC<IsConnectedProps> = (props: IsConnectedProps) => {
  const { component, path } = props
  const { status } = useWeb3Context()

  return status._type === 'notAsked' ? (
    <>
      <p>This should trigger the connection prompt automatically (not show the connect button)</p>
      <ButtonConnect />
    </>
  ) : status._type === 'connected' ? (
    <Route component={component} exact path={path} />
  ) : null
}

export const Routes: React.FC = () => {
  return (
    <Switch>
      <Route component={ConditionsDetailContainer} exact path="/conditions/:conditionId" />
      <Route component={ConditionsList} exact path="/conditions" />
      <Route component={PositionsList} exact path="/positions" />
      <IsConnected component={PrepareCondition} path="/prepare" />
      <IsConnected component={SplitConditionContainer} path="/split" />
      <Route exact path="/">
        <Redirect to="/conditions" />
      </Route>
      <Route path="*">
        <div>Section not found...</div>
      </Route>
    </Switch>
  )
}
