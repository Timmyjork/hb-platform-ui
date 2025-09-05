export type Review = {
  id: string;
  breederId: string;
  author?: { name:string };
  rating: 1|2|3|4|5;
  text: string;
  createdAt: string;
  status: 'pending'|'approved'|'rejected';
}

