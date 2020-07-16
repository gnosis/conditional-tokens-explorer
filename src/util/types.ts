export interface Question {
  id: string
  raw: string
  templateId: number
  title: string
  resolution: Date
  arbitratorAddress: string
  category: string
  outcomes: string[]
}

export interface QuestionLog {
  category: string
  lang: string
  title: string
  type: string
  outcomes?: string[]
}

export enum ConditionStatus {
  Open = 'Open',
  Resolved = 'Resolved',
}

export enum ConditionType {
  Omen = 'Omen Condition',
  Unknown = 'Unknown',
}
