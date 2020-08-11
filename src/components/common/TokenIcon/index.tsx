import React from 'react'
import styled from 'styled-components'

import { BatIcon } from './img/BatIcon'
import { CDaiIcon } from './img/CDaiIcon'
import { ChaiIcon } from './img/ChaiIcon'
import { DaiIcon } from './img/DaiIcon'
import { DxdIcon } from './img/DxdIcon'
import { EtherIcon } from './img/EtherIcon'
import { GnoIcon } from './img/GnoIcon'
import { OwlIcon } from './img/OwlIcon'
import { PnkIcon } from './img/PnkIcon'
import { UsdcIcon } from './img/UsdcIcon'
import { UsdtIcon } from './img/UsdtIcon'
import { WEthIcon } from './img/WEthIcon'
import { ZrxIcon } from './img/ZrxIcon'

const Wrapper = styled.div`
  align-items: center;
  display: flex;
`

const Icon = styled.div`
  width: 20px;
  height: 20px;

  svg {
    display: block;
    max-height: 20px;
    max-width: 20px;
  }
`

const Symbol = styled.span`
  margin-left: 8px;
`

const currenciesData = [
  {
    icon: <BatIcon />,
    symbol: 'BAT',
  },
  {
    icon: <CDaiIcon />,
    symbol: 'CDAI',
  },
  {
    icon: <DaiIcon />,
    symbol: 'DAI',
  },
  {
    icon: <ChaiIcon />,
    symbol: 'CHAI',
  },
  {
    icon: <UsdcIcon />,
    text: 'USDC',
    symbol: 'USDC',
  },
  {
    icon: <EtherIcon />,
    symbol: 'ETH',
  },
  {
    icon: <WEthIcon />,
    symbol: 'WETH',
  },
  {
    icon: <ZrxIcon />,
    symbol: 'ZRX',
  },
  {
    icon: <GnoIcon />,
    symbol: 'GNO',
  },
  {
    icon: <OwlIcon />,
    symbol: 'OWL',
  },
  {
    icon: <DxdIcon />,
    symbol: 'DXD',
  },
  {
    icon: <PnkIcon />,
    symbol: 'PNK',
  },
  {
    icon: <UsdtIcon />,
    symbol: 'USDT',
  },
]

const getTokenData = (symbol: string): Array<any> => {
  return currenciesData.filter((item) => item.symbol.toUpperCase() === symbol.toUpperCase())
}

interface Props {
  symbol: string
}

export const TokenIcon: React.FC<Props> = (props) => {
  const { symbol } = props
  const data = getTokenData(symbol)

  return (
    <Wrapper>
      {data.length > 0 ? (
        <>
          <Icon>{data[0].icon}</Icon> <Symbol>{symbol}</Symbol>
        </>
      ) : (
        'Token icon not found...'
      )}
    </Wrapper>
  )
}
