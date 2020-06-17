import { ethers, Signer, Contract } from 'ethers'
import { BigNumber } from 'ethers/utils'
import { Provider, TransactionReceipt } from 'ethers/providers'
import { Token } from '../config/networkConfig'

const erc20Abi = [
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function approve(address spender, uint256 amount) external returns (bool)',
]

class ERC20Service {
  private contract: Contract
  constructor(private provider: Provider, private signer: Signer, tokenAddress: string) {
    this.contract = new ethers.Contract(tokenAddress, erc20Abi, provider).connect(signer)
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
  approve = async (spender: string, amount: BigNumber): Promise<TransactionReceipt> => {
    const transactionObject = await this.contract.approve(spender, amount, {
      value: '0x0',
    })
    return this.provider.waitForTransaction(transactionObject.hash)
  }

  /**
   * Approve `spender` to transfer an "unlimited" amount of tokens on behalf of the connected user.
   */
  approveUnlimited = async (spender: string): Promise<TransactionReceipt> => {
    const transactionObject = await this.contract.approve(spender, ethers.constants.MaxUint256, {
      value: '0x0',
    })
    return this.provider.waitForTransaction(transactionObject.hash)
  }
}

export { ERC20Service }
