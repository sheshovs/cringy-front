export interface User {
  id: string
  username: string
  email?: string
  bio?: string | null
  avatar?: string | null
  createdAt: string
  _count?: {
    followers: number
    following: number
    books: number
  }
}

export interface Book {
  id: string
  title: string
  description?: string | null
  coverColor?: string | null
  coverPattern?: string | null
  isPublic: boolean
  userId: string
  createdAt: string
  updatedAt: string
  user?: Pick<User, 'id' | 'username' | 'avatar'>
  readings?: Reading[]
  _count?: { readings: number }
}

export type ReadingStatus = 'WANT_TO_READ' | 'READING' | 'FINISHED' | 'DROPPED'

export interface Reading {
  id: string
  bookId: string
  title: string
  author?: string | null
  openLibraryId?: string | null
  coverUrl?: string | null
  status: ReadingStatus
  rating?: number | null
  cringeLevel?: number | null
  cringeReason?: string | null
  redFlags?: string | null
  reflection?: string | null
  recommendedTo?: string | null
  notes?: string | null
  startDate?: string | null
  finishDate?: string | null
  createdAt: string
  updatedAt: string
}

export interface OpenLibraryBook {
  openLibraryId: string
  title: string
  author: string | null
  year: number | null
  coverUrl: string | null
}
