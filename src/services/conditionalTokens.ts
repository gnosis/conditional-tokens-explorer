import { Contract, ethers } from 'ethers'
import { NetworkConfig } from '../config/networkConfig'
import { Maybe } from '../util/types'

const conditionalTokensAbi = [
  'function prepareCondition(address oracle, bytes32 questionId, uint outcomeSlotCount) external',
  'event ConditionPreparation(bytes32 indexed conditionId, address indexed oracle, bytes32 indexed questionId, uint outcomeSlotCount)',
  'function setApprovalForAll(address operator, bool approved) external',
  'function isApprovedForAll(address owner, address operator) external view returns (bool)',
  'function payoutNumerators(bytes32, uint) public view returns (uint)',
  'function payoutDenominator(bytes32) public view returns (uint)',
  'function redeemPositions(address collateralToken, bytes32 parentCollectionId, bytes32 conditionId, uint[] indexSets) external',
  'function getCollectionId(bytes32 parentCollectionId, bytes32 conditionId, uint indexSet) external view returns (bytes32) ',
  'function getPositionId(address collateralToken, bytes32 collectionId) external pure returns (uint) ',
  'function balanceOf(address owner, uint256 positionId) external view returns (uint256)',
  'function safeTransferFrom(address from, address to, uint256 id, uint256 value, bytes data) external',
  'function getOutcomeSlotCount(bytes32 conditionId) external view returns (uint)',
  'function mergePositions(address collateralToken, bytes32 parentCollectionId, bytes32 conditionId, uint[] partition, uint amount) external',
]

export class ConditionalTokensService {
  private contract: Contract

  constructor(
    private networkConfig: NetworkConfig,
    private provider: ethers.providers.Provider,
    private signer: ethers.Signer
  ) {
    const contractAddress = networkConfig.getConditionalTokenContract()

    this.contract = new ethers.Contract(contractAddress, conditionalTokensAbi, provider).connect(
      signer
    )
  }

  static getConditionId(
    questionId: string,
    oracleAddress: string,
    outcomeSlotCount: number
  ): Maybe<string> {
    try {
      return ethers.utils.solidityKeccak256(
        ['address', 'bytes32', 'uint256'],
        [oracleAddress, questionId, outcomeSlotCount]
      )
    } catch (err) {
      return null
    }
  }

  async prepareCondition(questionId: string, oracleAddress: string, outcomeSlotCount: number) {
    const transactionObject = await this.contract.prepareCondition(
      oracleAddress,
      questionId,
      outcomeSlotCount,
      {
        value: '0x0',
        gasLimit: 750000,
      }
    )
    return this.provider.waitForTransaction(transactionObject.hash)
  }

  async conditionExists(conditionId: string) {
    return !(await this.contract.getOutcomeSlotCount(conditionId)).isZero()
  }
}
