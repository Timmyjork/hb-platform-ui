export type ReviewStatus = 'published'|'flagged'|'removed'|'needs_review'
export type Review = {
  id: string
  queenId?: string
  breederId: string
  authorId: string
  rating: 1|2|3|4|5
  text: string
  pros?: string
  cons?: string
  photos?: string[]
  createdAt: string
  status: ReviewStatus
}

