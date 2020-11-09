import { useQuery } from '@apollo/react-hooks'

import { queryGetOmenMarketsByConditionID } from 'queries/OMENMarkets'
import { GetOmenMarketsByConditionID } from 'types/generatedGQLForOMEN'

export const useOmenMarkets = (conditionsIds: string[]) => {
  const { data, error, loading } = useQuery<GetOmenMarketsByConditionID>(
    queryGetOmenMarketsByConditionID,
    {
      context: { clientName: 'Omen' },
      variables: {
        id: conditionsIds[0],
      },
    }
  )

  return {
    data,
    error,
    loading,
  }
}
