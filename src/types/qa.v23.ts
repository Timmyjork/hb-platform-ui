export type Question = {
  id: string;
  breederId: string;
  author?: { name:string, email?:string };
  text: string;
  answer?: { text:string; authorId?:string; answeredAt?:string };
  createdAt: string;
  status: 'pending'|'published'|'hidden';
}

