import React, { useEffect, useMemo, useState } from 'react'
import Blockies from 'react-blockies'
import styled from 'styled-components'
import { toChecksumAddress } from 'web3-utils'

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
import { Spinner } from 'components/statusInfo/Spinner'
import { ICON_ENDPOINT } from 'config/constants'
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

interface Props {
  token: Token
  onClick?: () => void
}

interface Resource<Payload> {
  read: () => Payload
}

// First we need a type of cache to avoid creating resources for images we have already fetched in the past
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cache = new Map<string, any>()

// this function receives the source of the image and returns a resource
const loadImage = (source: string): Resource<string> => {
  let resource = cache.get(source)

  if (resource) return resource

  resource = new Promise((resolve, reject) => {
    const img = new window.Image()
    img.src = source
    img.addEventListener('load', () => resolve(source))
    img.addEventListener('error', (err) => reject(err))
  })
  cache.set(source, resource)
  return resource
}

export const TokenIcon: React.FC<Props> = (props) => {
  const { onClick, token, ...restProps } = props
  const { address, symbol } = token

  const [loading, setLoading] = useState(false)
  const [tokenCustom, setTokenCustom] = useState<any>(null)

  const customImageUrl = useMemo(() => {
    const addressWithChecksum = toChecksumAddress(address)
    return ICON_ENDPOINT.replace(`{}`, addressWithChecksum)
  }, [address])

  const currencyData = React.useMemo(() => {
    const currenciesDataFiltered = currenciesData.filter(
      (item) => item.symbol.toUpperCase() === symbol.toUpperCase()
    )
    return currenciesDataFiltered.length > 0 ? currenciesDataFiltered[0] : null
  }, [symbol])

  useEffect(() => {
    const fetchImage = async () => {
      setLoading(true)
      try {
        const resource = await loadImage(customImageUrl)
        const tokenCustom = resource ? (
          <>{resource && <CustomIcon src={customImageUrl} />}</>
        ) : (
          <Icon>{currencyData?.icon}</Icon>
        )
        setTokenCustom(tokenCustom)
      } catch (err) {
        setTokenCustom(
          <CustomIconWrapper>
            <Blockies scale={2} seed={symbol} size={10} />
          </CustomIconWrapper>
        )
      }
      setLoading(false)
    }

    fetchImage()
  }, [currencyData, customImageUrl, symbol])

  return (
    <Wrapper onClick={onClick} {...restProps}>
      {loading && <Spinner size="20px" />}
      {!loading && tokenCustom && (
        <>
          {tokenCustom}
          <Symbol>{symbol}</Symbol>
        </>
      )}
    </Wrapper>
  )
}
