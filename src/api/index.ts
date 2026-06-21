import api from './client'
import type { User, Book, Reading, OpenLibraryBook } from '../types'

// Auth
export const authApi = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post<{ user: User }>('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<{ user: User }>('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get<{ user: User }>('/auth/me'),
}

// Users
export const usersApi = {
  getProfile: (username: string) =>
    api.get<{ user: User }>(`/users/${username}`),
  updateMe: (data: { bio?: string; avatar?: string }) =>
    api.put<{ user: User }>('/users/me', data),
  follow: (id: string) => api.post(`/users/${id}/follow`),
  unfollow: (id: string) => api.delete(`/users/${id}/follow`),
  getFollowers: (id: string) => api.get<{ followers: User[] }>(`/users/${id}/followers`),
  getFollowing: (id: string) => api.get<{ following: User[] }>(`/users/${id}/following`),
}

// Books
export const booksApi = {
  getFeed: (page = 1) => api.get<{ books: Book[]; page: number }>(`/books?page=${page}`),
  getExplore: (page = 1) => api.get<{ books: Book[]; page: number }>(`/books/explore?page=${page}`),
  getMyBooks: () => api.get<{ books: Book[] }>('/books/me'),
  getBook: (id: string) => api.get<{ book: Book }>(`/books/${id}`),
  getUserBooks: (userId: string) => api.get<{ books: Book[] }>(`/books/user/${userId}`),
  createBook: (data: { title: string; description?: string; isPublic?: boolean; coverColor?: string; coverPattern?: string }) =>
    api.post<{ book: Book }>('/books', data),
  updateBook: (id: string, data: Partial<{ title: string; description: string; isPublic: boolean; coverColor: string; coverPattern: string }>) =>
    api.put<{ book: Book }>(`/books/${id}`, data),
  deleteBook: (id: string) => api.delete(`/books/${id}`),
}

// Readings
export const readingsApi = {
  getReadings: (bookId: string) =>
    api.get<{ readings: Reading[] }>(`/books/${bookId}/readings`),
  addReading: (bookId: string, data: Partial<Reading>) =>
    api.post<{ reading: Reading }>(`/books/${bookId}/readings`, data),
  updateReading: (bookId: string, id: string, data: Partial<Reading>) =>
    api.put<{ reading: Reading }>(`/books/${bookId}/readings/${id}`, data),
  deleteReading: (bookId: string, id: string) =>
    api.delete(`/books/${bookId}/readings/${id}`),
}

// Search
export const searchApi = {
  searchBooks: (q: string) =>
    api.get<{ books: OpenLibraryBook[] }>(`/search?q=${encodeURIComponent(q)}`),
}
