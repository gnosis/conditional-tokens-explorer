import { Connected, useWeb3Connected } from 'contexts/Web3Context'
import React from 'react'
import styled from 'styled-components'

import { truncateStringInTheMiddle } from '../../../util/tools'
import { Dropdown, DropdownItemProps, DropdownPosition } from '../../common/Dropdown'

import { ChevronDown } from './img/ChevronDown'

const Wrapper = styled(Dropdown)`
  align-items: center;
  display: flex;
  height: 100%;

  &.isOpen {
    .chevronDown {
      transform: rotateX(180deg);
    }
  }
`

const Button = styled.div`
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
  margin-bottom: -4px;
`

interface UserDropdownProps {
  data: Connected
}

const UserDropdownButton: React.FC<UserDropdownProps> = ({ data }) => {
  const { address, networkConfig } = data

  return (
    <Button>
      <Address>
        <AddressText className="addressText">
          {truncateStringInTheMiddle(address, 6, 4)}
        </AddressText>{' '}
        <ChevronDown />
      </Address>
      {networkConfig.networkId && (
        <Network>
          <NetworkStatus />
          <NetworkText>
            <>
              {networkConfig.networkId === 1 && 'Mainnet'}
              {networkConfig.networkId === 4 && 'Rinkeby'}
            </>
          </NetworkText>
        </Network>
      )}
    </Button>
  )
}

const UserDropdownContent: React.FC<UserDropdownProps> = () => {
  return <div>asdads</div>
}

export const UserDropdown: React.FC = (props) => {
  const data = useWeb3Connected()
  const headerDropdownItems: Array<DropdownItemProps> = [
    {
      content: <UserDropdownContent data={data} />,
    },
  ]

  return (
    <Wrapper
      {...props}
      activeItemHightlight={false}
      dropdownButtonContent={<UserDropdownButton data={data} />}
      dropdownPosition={DropdownPosition.right}
      items={headerDropdownItems}
    />
  )
}
