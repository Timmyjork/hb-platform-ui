export type BreederPublic = {
  breederId: string
  slug: string
  displayName: string
  regionCode: string
  breedCodes: string[]
  isPublished?: boolean
  avatarUrl?: string
  coverUrl?: string
  bio?: string
  badges?: ('verified'|'union'|'top_seller'|'research')[]
  stats?: { sales:number; queens:number; years:number; rating:number }
  links?: { site?:string; fb?:string; insta?:string; yt?:string }
  createdAt: string; updatedAt: string
}
