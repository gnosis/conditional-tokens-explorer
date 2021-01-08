import React from 'react'
import styled from 'styled-components'

import { Button } from 'components/buttons/Button'
import { ButtonCopy } from 'components/buttons/ButtonCopy'
import { ButtonType } from 'components/buttons/buttonStylingTypes'
import { Dropdown, DropdownItem, DropdownPosition } from 'components/common/Dropdown'
import { Switch } from 'components/form/Switch'
import { ChevronDown } from 'components/icons/ChevronDown'
import { Pill } from 'components/pureStyledComponents/Pill'
import { FormatHash } from 'components/text/FormatHash'
import { useWeb3Connected } from 'contexts/Web3Context'
import { useLocalStorage } from 'hooks/useLocalStorageValue'
import { truncateStringInTheMiddle } from 'util/tools'

const Wrapper = styled(Dropdown)`
  align-items: center;
  display: flex;
  height: 100%;

  .dropdownButton {
    height: 100%;
  }

  &.isOpen {
    .chevronDown {
      transform: rotateX(180deg);
    }
  }
`

const DropdownButton = styled.div`
  align-items: flex-start;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;

  &:hover {
    .addressText {
      color: ${(props) => props.theme.colors.darkerGrey};
    }

    .chevronDown {
      .fill {
        fill: ${(props) => props.theme.colors.darkerGrey};
      }
    }
  }
`

const Address = styled.div`
  align-items: center;
  display: flex;
`

const AddressText = styled.div`
  color: ${(props) => props.theme.colors.textColor};
  font-size: 15px;
  font-weight: 400;
  line-height: 1.2;
  margin-right: 8px;
`

const Connection = styled.div`
  align-items: center;
  display: flex;
`

const ConnectionStatus = styled.div`
  background-color: ${(props) => props.theme.colors.holdGreen};
  border-radius: 8px;
  flex-grow: 0;
  flex-shrink: 0;
  height: 8px;
  margin-right: 4px;
  width: 8px;
`

const ConnectionText = styled.div`
  color: ${(props) => props.theme.colors.holdGreen};
  font-size: 9px;
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: -2px;
  text-transform: capitalize;
`

const Content = styled.div`
  width: 245px;
`
const DropdownItemStyled = styled(DropdownItem)`
  cursor: default;
  padding: 0;

  &:hover {
    background-color: transparent;
  }
`

const Item = styled.div`
  align-items: center;
  border-bottom: 1px solid ${(props) => props.theme.dropdown.item.borderColor};
  color: ${(props) => props.theme.colors.darkerGrey};
  display: flex;
  font-size: 13px;
  justify-content: space-between;
  line-height: 1.2;
  padding: 12px;
  width: 100%;
`

const Title = styled.div`
  padding-right: 10px;
`

const Value = styled.div`
  font-weight: 600;
  text-transform: capitalize;
  position: relative;
`

const DisconnectButton = styled(Button)`
  font-size: 14px;
  height: 28px;
  line-height: 1;
  width: 100%;
`

const StatusPill = styled(Pill)`
  border-radius: 2px;
  height: 18px;
  padding-left: 8px;
  padding-right: 8px;
`
const TextAndButton = styled.span`
  align-items: center;
  display: flex;
  justify-content: space-between;
`

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getWalletName = (provider: any): string => {
  const isMetaMask =
    Object.prototype.hasOwnProperty.call(provider._web3Provider, 'isMetaMask') &&
    provider._web3Provider.isMetaMask
  const isWalletConnect = Object.prototype.hasOwnProperty.call(provider._web3Provider, 'wc')

  return isMetaMask ? 'MetaMask' : isWalletConnect ? 'WalletConnect' : 'Unknown'
}

const UserDropdownButton = () => {
  const { address, networkConfig, provider } = useWeb3Connected()

  return (
    <DropdownButton>
      <Address>
        <AddressText className="addressText" title={address}>
          <FormatHash hash={truncateStringInTheMiddle(address, 6, 4)} />
        </AddressText>
        <ChevronDown />
      </Address>
      {networkConfig.networkId && (
        <Connection>
          <ConnectionStatus />
          <ConnectionText>
            {networkConfig.getNetworkName()} / {getWalletName(provider)}
          </ConnectionText>
        </Connection>
      )}
    </DropdownButton>
  )
}

const UserDropdownContent = () => {
  const { cpkAddress, disconnect, networkConfig, provider } = useWeb3Connected()
  const { getValue: getIsUsingTheCPK, setValue: setIsUsingTheCPK } = useLocalStorage(
    `isUsingTheCPK`
  )

  const isUsingTheCPKFromTheStorage = React.useMemo(() => getIsUsingTheCPK(false), [
    getIsUsingTheCPK,
  ])
  const [isCPKActive, setIsCPKActive] = React.useState(isUsingTheCPKFromTheStorage)

  const toggleCpkActive = React.useCallback(() => {
    setIsUsingTheCPK(!isCPKActive)
    setIsCPKActive(!isCPKActive)
  }, [isCPKActive, setIsUsingTheCPK])

  const items = [
    {
      title: 'Status',
      value: <StatusPill>Connected</StatusPill>,
    },
    {
      title: 'Network',
      value: networkConfig.getNetworkName(),
    },
    {
      title: 'Wallet',
      value: getWalletName(provider),
    },
    {
      onClick: toggleCpkActive,
      title: 'Use CPK Address',
      value: <Switch active={isCPKActive} onClick={toggleCpkActive} small />,
    },
  ]

  if (isCPKActive) {
    items.push({
      title: 'CPK Address',
      value: (
        <TextAndButton>
          <span>{truncateStringInTheMiddle(cpkAddress, 6, 4)}</span>{' '}
          <ButtonCopy value={cpkAddress} />
        </TextAndButton>
      ),
    })
  }

  return (
    <Content>
      {items.map((item, index) => {
        return (
          <Item key={index}>
            <Title>{item.title}</Title>
            <Value>{item.value}</Value>
          </Item>
        )
      })}
      <Item>
        <DisconnectButton
          buttonType={ButtonType.danger}
          onClick={() => {
            disconnect()
          }}
        >
          Disconnect
        </DisconnectButton>
      </Item>
    </Content>
  )
}

export const UserDropdown: React.FC = (props) => {
  const headerDropdownItems = [
    <DropdownItemStyled key="1">
      <UserDropdownContent />
    </DropdownItemStyled>,
  ]

  return (
    <Wrapper
      activeItemHighlight={false}
      dropdownButtonContent={<UserDropdownButton />}
      dropdownPosition={DropdownPosition.right}
      items={headerDropdownItems}
      {...props}
    />
  )
}
