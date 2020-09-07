import React from 'react'
import styled from 'styled-components'

import { BatIcon } from 'components/common/TokenIcon/img/BatIcon'
import { CDaiIcon } from 'components/common/TokenIcon/img/CDaiIcon'
import { ChaiIcon } from 'components/common/TokenIcon/img/ChaiIcon'
import { DaiIcon } from 'components/common/TokenIcon/img/DaiIcon'
import { DxdIcon } from 'components/common/TokenIcon/img/DxdIcon'
import { EtherIcon } from 'components/common/TokenIcon/img/EtherIcon'
import { GnoIcon } from 'components/common/TokenIcon/img/GnoIcon'
import { OwlIcon } from 'components/common/TokenIcon/img/OwlIcon'
import { PnkIcon } from 'components/common/TokenIcon/img/PnkIcon'
import { UsdcIcon } from 'components/common/TokenIcon/img/UsdcIcon'
import { UsdtIcon } from 'components/common/TokenIcon/img/UsdtIcon'
import { WEthIcon } from 'components/common/TokenIcon/img/WEthIcon'
import { ZrxIcon } from 'components/common/TokenIcon/img/ZrxIcon'

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getTokenData = (symbol: string): Array<any> => {
  return currenciesData.filter((item) => item.symbol.toUpperCase() === symbol.toUpperCase())
}

interface Props {
  symbol: string
}

export const TokenIcon: React.FC<Props> = (props) => {
  const { symbol, ...restProps } = props
  const data = getTokenData(symbol)

  // TODO, add a CustomICON for the second option of the ternary
  return (
    <Wrapper {...restProps}>
      {data.length > 0 ? (
        <>
          <Icon>{data[0].icon}</Icon> <Symbol>{symbol}</Symbol>
        </>
      ) : (
        <Symbol>{symbol}</Symbol>
      )}
    </Wrapper>
  )
}
