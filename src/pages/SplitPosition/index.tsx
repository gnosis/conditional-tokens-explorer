import React from 'react'

import { InlineLoading } from 'components/statusInfo/InlineLoading'
import { PageTitle } from 'components/text/PageTitle'
import { useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { Form } from 'pages/SplitPosition/Form'

export const SplitPosition = () => {
  const { networkConfig } = useWeb3ConnectedOrInfura()

  const tokens = networkConfig.getTokens()

  return (
    <>
      <PageTitle>Split Position</PageTitle>
      {!tokens && <InlineLoading />}
      {tokens && <Form tokens={tokens} />}
    </>
  )
}
