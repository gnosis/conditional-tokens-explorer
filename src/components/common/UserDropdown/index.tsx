import React from 'react'
import styled from 'styled-components'
import { getInjectedProviderName, getProviderInfo } from 'web3modal'

import { Button } from 'components/buttons/Button'
import { ButtonType } from 'components/buttons/buttonStylingTypes'
import { Dropdown, DropdownItem, DropdownPosition } from 'components/common/Dropdown'
import { ChevronDown } from 'components/common/UserDropdown/img/ChevronDown'
import { Pill } from 'components/pureStyledComponents/Pill'
import { Connected, useWeb3Connected } from 'contexts/Web3Context'
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
      color: ${(props) => props.theme.colors.darkerGray};
    }

    .chevronDown {
      path {
        fill: ${(props) => props.theme.colors.darkerGray};
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

const Network = styled.div`
  align-items: center;
  display: flex;
`

const NetworkStatus = styled.div`
  background-color: ${(props) => props.theme.colors.holdGreen};
  border-radius: 8px;
  flex-grow: 0;
  flex-shrink: 0;
  height: 8px;
  margin-right: 4px;
  width: 8px;
`

const NetworkText = styled.div`
  color: ${(props) => props.theme.colors.holdGreen};
  font-size: 9px;
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: -2px;
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
  color: ${(props) => props.theme.colors.darkerGray};
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

interface UserDropdownProps {
  data: Connected
}

const getNetworkName = (data: Connected): string => {
  return data.provider.network.name
}

const getWalletName = (data: Connected): string => {
  const injectedName = getInjectedProviderName()
  const provider = getProviderInfo(data.provider)
  return injectedName || provider.name
}

const UserDropdownButton: React.FC<UserDropdownProps> = ({ data }) => {
  const { address, networkConfig } = data

  return (
    <DropdownButton>
      <Address>
        <AddressText className="addressText" title={address}>
          {truncateStringInTheMiddle(address, 6, 4)}
        </AddressText>{' '}
        <ChevronDown />
      </Address>
      {networkConfig.networkId && (
        <Network>
          <NetworkStatus />
          <NetworkText>{getNetworkName(data)}</NetworkText>
        </Network>
      )}
    </DropdownButton>
  )
}

const UserDropdownContent: React.FC<UserDropdownProps> = ({ data }) => {
  const items = [
    {
      title: 'Status',
      value: <StatusPill>Connected</StatusPill>,
    },
    {
      title: 'Wallet',
      value: getWalletName(data),
    },
    {
      title: 'Network',
      value: getNetworkName(data),
    },
  ]

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
            data.disconnect()
          }}
        >
          Disconnect
        </DisconnectButton>
      </Item>
    </Content>
  )
}

export const UserDropdown: React.FC = (props) => {
  const data = useWeb3Connected()
  const headerDropdownItems = [
    <DropdownItemStyled key="1">
      <UserDropdownContent data={data} />
    </DropdownItemStyled>,
  ]

  return (
    <Wrapper
      {...props}
      activeItemHighlight={false}
      dropdownButtonContent={<UserDropdownButton data={data} />}
      dropdownPosition={DropdownPosition.right}
      items={headerDropdownItems}
    />
  )
}
