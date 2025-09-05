export type BreederId = string
export type CertificateId = string
export type ReviewId = string
export type QuestionId = string

export type Certificate = {
  id: CertificateId
  title: string
  issuer: string
  dateISO: string
  fileUrl?: string
}

export type BreederProfile = {
  breederId: BreederId
  displayName: string
  regionCode: string
  breedDefault: string
  avatarUrl?: string
  coverUrl?: string
  bio?: string
  portfolio: {
    featuredQueenIds: string[]
    galleryUrls?: string[]
  }
  certificates: Certificate[]
  ratingsPublic: boolean
  verification?: 'unverified'|'pending'|'verified'|'rejected'
  publicSlug?: string
  createdAt: string
  updatedAt: string
}

export type Review = {
  id: ReviewId
  breederId: BreederId
  authorUserId: string
  authorDisplay?: string
  rating: number
  text: string
  createdAt: string
  verifiedPurchase?: boolean
  status: 'pending'|'approved'|'rejected'
}

export type QAQuestion = {
  id: QuestionId
  breederId: BreederId
  authorUserId: string
  text: string
  createdAt: string
  status: 'pending'|'approved'|'rejected'
  answer?: {
    text: string
    authorBreederId: BreederId
    createdAt: string
  }
}
