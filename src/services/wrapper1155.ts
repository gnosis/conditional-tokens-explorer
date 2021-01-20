import { Contract, ethers } from 'ethers'
import { TransactionReceipt } from 'ethers/providers'
import { BigNumber, Interface } from 'ethers/utils'

import { CONFIRMATIONS_TO_WAIT } from 'config/constants'
import { NetworkConfig } from 'config/networkConfig'
import { waitForBlockToSync } from 'util/tools'

const wrapper1155Abi = [
  'function unwrap(address multiToken,uint256 tokenId,uint256 amount,address recipient,bytes data) external',
  'function batchUnwrap(address multiToken, uint256[] tokenIds, uint256[] amounts, address recipient, bytes data) external',
  'function getWrapped1155(address multiToken, uint256 tokenId)',
  'function setApprovalForAll(address operator, bool approved) external',
  'function isApprovedForAll(address owner, address operator) external view returns (bool)',
]

class Wrapper1155Service {
  private contract: Contract
  private networkConfig: NetworkConfig
  private provider: ethers.providers.Provider

  constructor(
    networkConfig: NetworkConfig,
    provider: ethers.providers.Provider,
    signer?: ethers.Signer
  ) {
    const contractAddress = networkConfig.getWrapped1155FactoryAddress()
    this.networkConfig = networkConfig
    this.provider = provider
    if (signer) {
      this.contract = new ethers.Contract(contractAddress, wrapper1155Abi, provider).connect(signer)
    } else {
      this.contract = new ethers.Contract(contractAddress, wrapper1155Abi, provider)
    }
  }

  get address(): string {
    return this.contract.address
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
      '0x'
    )
    const transaction = await this.provider.waitForTransaction(tx.hash, CONFIRMATIONS_TO_WAIT)
    await waitForBlockToSync(this.networkConfig, tx.blockNumber)
    return transaction
  }

  // Method  used to unwrapp some erc1155
  static encodeUnwrap = (
    conditionalTokenAddress: string,
    tokenId: string,
    amount: BigNumber,
    userAddress: string
  ): string => {
    const unwrapInterface = new Interface(wrapper1155Abi)

    return unwrapInterface.functions.unwrap.encode([
      conditionalTokenAddress,
      tokenId,
      amount,
      userAddress,
      '0x',
    ])
  }

  static encodeSetApprovalForAll = (spenderAccount: string): string => {
    const setApprovalForAllInterface = new Interface(wrapper1155Abi)
    return setApprovalForAllInterface.functions.setApprovalForAll.encode([spenderAccount, true])
  }

  async isApprovedForAll(owner: string, spender: string): Promise<boolean> {
    return this.contract.isApprovedForAll(owner, spender)
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
    const transaction = this.provider.waitForTransaction(tx.hash, CONFIRMATIONS_TO_WAIT)
    await waitForBlockToSync(this.networkConfig, tx.blockNumber)
    return transaction
  }

  async getWrapped1155(
    conditionalTokenAddress: string,
    tokenId: string
  ): Promise<TransactionReceipt> {
    const tx = await this.contract.getWrapped1155(conditionalTokenAddress, tokenId)
    const transaction = this.provider.waitForTransaction(tx.hash, CONFIRMATIONS_TO_WAIT)
    await waitForBlockToSync(this.networkConfig, tx.blockNumber)
    return transaction
  }
}

export { Wrapper1155Service }
