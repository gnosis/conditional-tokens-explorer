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
import Blockies from 'react-blockies'

const ICON_DIMENSIONS = '20px'

const Wrapper = styled.div`
  align-items: center;
  display: flex;
`

const Icon = styled.div`
  height: ${ICON_DIMENSIONS};
  width: ${ICON_DIMENSIONS};

  svg {
    display: block;
    max-height: ${ICON_DIMENSIONS};
    max-width: ${ICON_DIMENSIONS};
  }
`

const CustomIconWrapper = styled.div`
  border-radius: 50%;
  height: ${ICON_DIMENSIONS};
  overflow: hidden;
  width: ${ICON_DIMENSIONS};

  canvas {
    border-radius: 50%;
    max-height: 100% !important;
    max-width: 100% !important;
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
  onClick?: () => void
}

export const TokenIcon: React.FC<Props> = (props) => {
  const { onClick, symbol, ...restProps } = props
  const data = getTokenData(symbol)

  return (
    <Wrapper onClick={onClick} {...restProps}>
      {data.length > 0 ? (
        <Icon>{data[0].icon}</Icon>
      ) : (
        <CustomIconWrapper>
          <Blockies scale={2} seed={symbol} size={10} />
        </CustomIconWrapper>
      )}
      <Symbol>{symbol}</Symbol>
    </Wrapper>
  )
}
