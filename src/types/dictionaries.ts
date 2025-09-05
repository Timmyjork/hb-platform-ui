export type DictStatus = 'active' | 'archived' | 'deprecated'

export type Breed = {
  code: string
  label: string
  synonyms?: string[]
  status: DictStatus
  createdAt: string
  updatedAt: string
  order?: number
}

export type Region = {
  code: string
  label: string
  status: DictStatus
  createdAt: string
  updatedAt: string
  order?: number
}
