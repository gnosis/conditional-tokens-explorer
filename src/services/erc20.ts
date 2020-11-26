import { Contract, Signer, ethers } from 'ethers'
import { Provider, TransactionResponse } from 'ethers/providers'
import { BigNumber, Interface, toUtf8String } from 'ethers/utils'

import { Token } from 'util/types'

const erc20Abi = [
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function balanceOf(address owner) external view returns (uint256)',
  'function symbol() external view returns (string)',
  'function name() external view returns (string)',
  'function decimals() external view returns (uint8)',
  'function transferFrom(address sender, address recipient, uint256 amount) public returns (bool)',
  'function transfer(address to, uint256 value) public returns (bool)',
]

const erc20Bytes32Abi = [
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function balanceOf(address owner) external view returns (uint256)',
  'function symbol() external view returns (bytes32)',
  'function name() external view returns (string)',
  'function decimals() external view returns (uint8)',
  'function transferFrom(address sender, address recipient, uint256 amount) public returns (bool)',
  'function transfer(address to, uint256 value) public returns (bool)',
]

class ERC20Service {
  private contract: Contract
  private contractBytes32: Contract
  constructor(
    private provider: Provider,
    private address: string,
    private signer?: Signer | string
  ) {
    if (signer) {
      this.contract = new ethers.Contract(address, erc20Abi, provider).connect(signer)
      this.contractBytes32 = new ethers.Contract(address, erc20Bytes32Abi, provider).connect(signer)
    } else {
      this.contract = new ethers.Contract(address, erc20Abi, provider)
      this.contractBytes32 = new ethers.Contract(address, erc20Bytes32Abi, provider)
    }
  }

  /**
   * @returns The allowance given by `owner` to `spender`.
   */
  allowance = async (owner: string, spender: string): Promise<BigNumber> => {
    return this.contract.allowance(owner, spender)
  }

  /**
   * Approve `spender` to transfer `amount` tokens on behalf of the connected user.
   */
  approve = async (spender: string, amount: BigNumber): Promise<TransactionResponse> => {
    const tx = await this.contract.approve(spender, amount, {
      value: '0x0',
    })

    return tx
  }

  /**
   * Approve `spender` to transfer an "unlimited" amount of tokens on behalf of the connected user.
   */
  approveUnlimited = async (spender: string): Promise<TransactionResponse> => {
    const tx = await this.contract.approve(spender, ethers.constants.MaxUint256, {
      value: '0x0',
    })
    return tx
  }

  getProfileSummary = async (): Promise<Token> => {
    const decimals = await this.contract.decimals()
    let symbol = ''

    try {
      symbol = await this.contract.symbol()
    } catch (err) {
      const hexString = await this.contractBytes32.symbol()
      symbol = toUtf8String(hexString)
    }

    return {
      address: this.contract.address,
      decimals,
      symbol,
    }
  }

  balanceOf = async (owner: string): Promise<BigNumber> => {
    return await this.contract.balanceOf(owner)
  }

  static encodeApprove = (spenderAccount: string, amount: BigNumber): string => {
    const approveInterface = new Interface(erc20Abi)

    return approveInterface.functions.approve.encode([spenderAccount, amount])
  }

  static encodeApproveUnlimited = (spenderAccount: string): string => {
    const approveInterface = new Interface(erc20Abi)

    return approveInterface.functions.approve.encode([spenderAccount, ethers.constants.MaxUint256])
  }

  static encodeTransferFrom = (from: string, to: string, amount: BigNumber): string => {
    const transferFromInterface = new Interface(erc20Abi)

    return transferFromInterface.functions.transferFrom.encode([from, to, amount])
  }

  static encodeTransfer = (to: string, amount: BigNumber): string => {
    const transferInterface = new Interface(erc20Abi)

    return transferInterface.functions.transfer.encode([to, amount])
  }
}

export { ERC20Service }
