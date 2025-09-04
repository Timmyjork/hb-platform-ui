export type Question = { id: string; context: 'breeder'|'queen'; contextId: string; authorId: string; text: string; createdAt: string; status: 'published'|'removed' }
export type Answer = { id: string; questionId: string; authorId: string; text: string; createdAt: string }

