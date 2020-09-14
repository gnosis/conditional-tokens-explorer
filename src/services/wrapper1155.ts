import { Contract, Signer, ethers } from 'ethers'
import { Provider, TransactionReceipt } from 'ethers/providers'
import { BigNumber } from 'ethers/utils'

import { CONFIRMATIONS_TO_WAIT } from 'config/constants'

const wrapper1155Abi = [
  'function unwrap(address multiToken,uint256 tokenId,uint256 amount,address recipient,bytes data) external',
  'function batchUnwrap(address multiToken, uint256[] tokenIds, uint256[] amounts, address recipient, bytes data) external',
  'function getWrapped1155(address multiToken, uint256 tokenId)',
]

class Wrapper1155Service {
  private contract: Contract
  constructor(private provider: Provider, private address: string, private signer?: Signer) {
    if (signer) {
      this.contract = new ethers.Contract(address, wrapper1155Abi, provider).connect(signer)
    } else {
      this.contract = new ethers.Contract(address, wrapper1155Abi, provider)
    }
  }

  async unwrap(
    conditionalTokenAddress: string,
    tokenId: string,
    amount: BigNumber,
    userAddress: string
  ): Promise<TransactionReceipt> {
    const tx = await this.contract.unwrap(
      conditionalTokenAddress,
      tokenId,
      amount,
      userAddress,
      ethers.constants.HashZero
    )
    return this.provider.waitForTransaction(tx.hash, CONFIRMATIONS_TO_WAIT)
  }

  async batchUnwrap(
    conditionalTokenAddress: string,
    tokenIds: string[],
    amounts: BigNumber[],
    userAddress: string
  ): Promise<TransactionReceipt> {
    const tx = await this.contract.batchUnwrap(
      conditionalTokenAddress,
      tokenIds,
      amounts,
      userAddress,
      ethers.constants.HashZero
    )
    return this.provider.waitForTransaction(tx.hash, CONFIRMATIONS_TO_WAIT)
  }

  async getWrapped1155(
    conditionalTokenAddress: string,
    tokenId: string
  ): Promise<TransactionReceipt> {
    const tx = await this.contract.getWrapped1155(conditionalTokenAddress, tokenId)
    return this.provider.waitForTransaction(tx.hash, CONFIRMATIONS_TO_WAIT)
  }
}

export { Wrapper1155Service }
