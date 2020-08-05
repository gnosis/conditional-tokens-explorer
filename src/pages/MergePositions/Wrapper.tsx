import { InfoCard } from 'components/common/InfoCard'
import { InlineLoading } from 'components/loading/InlineLoading'
import { PageTitle } from 'components/pureStyledComponents/PageTitle'
import React from 'react'

import { Contents } from './Contents'

export const Wrapper = () => {
  return (
    <>
      <PageTitle>Merge Positions</PageTitle>
      {/* {loading && <InlineLoading />} */}
      <Contents />
    </>
  )
}
