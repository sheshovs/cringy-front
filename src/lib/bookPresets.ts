import type { Book } from '../types'

export type BookColorPreset = {
  id: string
  label: string
  cover: string
  spine: string
  page: string
  pageLine: string
  accent: string
  light: string
}

export const BOOK_COLOR_PRESETS: BookColorPreset[] = [
  {
    id: 'classic-forest',
    label: 'Bosque clásico',
    cover: '#2F5D4A',
    spine: '#18382D',
    page: '#F1E4C8',
    pageLine: '#D9C69D',
    accent: '#7C9A64',
    light: '#B9D7A4',
  },
  {
    id: 'midnight-blue',
    label: 'Azul medianoche',
    cover: '#22395E',
    spine: '#14233D',
    page: '#E7E0CF',
    pageLine: '#C9BFA9',
    accent: '#7E93B8',
    light: '#B7C5E0',
  },
  {
    id: 'wine-rose',
    label: 'Rosa vino',
    cover: '#7B2E4A',
    spine: '#4B1D2F',
    page: '#F2DED8',
    pageLine: '#D9B8AF',
    accent: '#B8687E',
    light: '#E2A8B7',
  },
  {
    id: 'golden-hour',
    label: 'Hora dorada',
    cover: '#8A5A24',
    spine: '#573817',
    page: '#F5E7C6',
    pageLine: '#DEC691',
    accent: '#C18A3A',
    light: '#EAC779',
  },
  {
    id: 'deep-lilac',
    label: 'Lila profundo',
    cover: '#5C477A',
    spine: '#382B4C',
    page: '#ECE1EF',
    pageLine: '#CDBBD5',
    accent: '#9673A8',
    light: '#D4B8E0',
  },
  {
    id: 'paper-ink',
    label: 'Tinta y papel',
    cover: '#343434',
    spine: '#1E1E1E',
    page: '#EFE6D2',
    pageLine: '#CDBE9E',
    accent: '#81735B',
    light: '#D8CBAE',
  },
]

const DEFAULT_PAGE = '#F1E4C8'
const DEFAULT_PAGE_LINE = '#D9C69D'

function darkenHex(hex: string, amount = 35): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `#${Math.max(0, r - amount).toString(16).padStart(2, '0')}${Math.max(0, g - amount).toString(16).padStart(2, '0')}${Math.max(0, b - amount).toString(16).padStart(2, '0')}`
}

export function getBookColorPreset(id?: string | null): BookColorPreset | undefined {
  return BOOK_COLOR_PRESETS.find((preset) => preset.id === id)
}

export function getFallbackBookPreset(title: string): BookColorPreset {
  return BOOK_COLOR_PRESETS[title.charCodeAt(0) % BOOK_COLOR_PRESETS.length]
}

export function getBookPalette(book: Pick<Book, 'title' | 'coverColor' | 'colorPreset'>): BookColorPreset {
  const preset = getBookColorPreset(book.colorPreset)
  if (preset) return preset

  if (book.coverColor) {
    return {
      id: 'legacy-cover-color',
      label: 'Color anterior',
      cover: book.coverColor,
      spine: darkenHex(book.coverColor),
      page: DEFAULT_PAGE,
      pageLine: DEFAULT_PAGE_LINE,
      accent: book.coverColor,
      light: book.coverColor,
    }
  }

  return getFallbackBookPreset(book.title)
}
