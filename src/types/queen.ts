export type QueenId = string; // UA.7.45.1.25.2025

export type TenTraits = {
  honey: number; // 0..100
  winter: number; // 0..100
  temperament: number; // 0..100 (higher = calmer)
  calmOnFrames: number; // 0..100
  swarming: number; // 0..100 (higher = less swarming)
  hygienic: number; // 0..100
  varroaResist: number; // 0..100
  springBuildUp: number; // 0..100
  colonyStrength: number; // 0..100
  broodFrames: number; // represented as 0..100 normalized in UI (source may be 0..12)
};

export type Queen = {
  id: QueenId;
  breederId: string;
  unionCode?: string;
  breedCode: string;
  breederNo: string;
  queenNo: string;
  year: number;
  country: 'UA';
  baseTraits: TenTraits;
  ownerUserId?: string;
  motherId?: QueenId;
  isMother?: boolean;
  status: 'draft' | 'listed' | 'sold' | 'active' | 'retired';
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

export type Observation = {
  queenId: QueenId;
  observerId: string; // userId of beekeeper-owner
  date: string; // ISO
  traits: Partial<TenTraits>;
  note?: string;
};
