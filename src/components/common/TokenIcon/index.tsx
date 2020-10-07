import React from 'react'
import Blockies from 'react-blockies'
import styled from 'styled-components'

import { BatIcon } from 'components/common/TokenIcon/img/BatIcon'
import { CDaiIcon } from 'components/common/TokenIcon/img/CDaiIcon'
import { ChaiIcon } from 'components/common/TokenIcon/img/ChaiIcon'
import { CustomIcon } from 'components/common/TokenIcon/img/CustomIcon'
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
import { Token } from 'util/types'

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

interface CurrencyData {
  icon: React.ReactNode
  symbol: string
}

const currenciesData: CurrencyData[] = [
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
const getTokenData = (symbol: string): Maybe<CurrencyData> => {
  const currenciesDataFiltered = currenciesData.filter(
    (item) => item.symbol.toUpperCase() === symbol.toUpperCase()
  )
  return currenciesDataFiltered.length > 0 ? currenciesDataFiltered[0] : null
}

interface Props {
  token: Token
  onClick?: () => void
}

export const TokenIcon: React.FC<Props> = (props) => {
  const { onClick, token, ...restProps } = props
  const { address, symbol } = token
  const [isTokenChecked, setIsTokenChecked] = React.useState<Maybe<boolean>>(null)
  const [isTokenImageExist, setIsTokenImageExist] = React.useState<boolean>(false)

  const currencyData = getTokenData(symbol)

  // Only exist for the mainnet, not for rinkeby
  const customImageUrl = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`

  React.useEffect(() => {
    let cancelled = false

    const CheckTokenAvailability = async () => {
      try {
        const result = await fetch(customImageUrl, { method: 'HEAD' })
        if (!cancelled) setIsTokenImageExist(result.ok)
      } catch (err) {
        if (!cancelled) setIsTokenImageExist(false)
      }
      if (!cancelled) setIsTokenChecked(true)
    }

    if (!currencyData) {
      CheckTokenAvailability()
    } else {
      if (!cancelled) setIsTokenChecked(true)
    }

    return () => {
      cancelled = true
    }
  }, [currencyData, customImageUrl])

  return (
    <>
      {isTokenChecked !== null ? (
        <Wrapper onClick={onClick} {...restProps}>
          {currencyData ? (
            <Icon>{currencyData.icon}</Icon>
          ) : isTokenImageExist ? (
            <CustomIcon src={customImageUrl} />
          ) : (
            <CustomIconWrapper>
              <Blockies scale={2} seed={symbol} size={10} />
            </CustomIconWrapper>
          )}
          <Symbol>{symbol}</Symbol>
        </Wrapper>
      ) : null}
    </>
  )
}
