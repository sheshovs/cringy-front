import { Link } from 'react-router-dom'
import type { Book } from '../types'

// Fallback palette — jewel tones that pop against #0d1a15
const COVER_PALETTES = [
  { spine: '#1a5c4e', cover: '#28917a', light: '#4abda0' }, // Esmeralda
  { spine: '#1a4f8a', cover: '#2e7fd4', light: '#5aa8f0' }, // Zafiro
  { spine: '#5e1a72', cover: '#9a35b8', light: '#c060d8' }, // Amatista
  { spine: '#8a1a38', cover: '#c8325a', light: '#e86080' }, // Rubí
  { spine: '#8a6000', cover: '#c88a1a', light: '#e8b040' }, // Ámbar
  { spine: '#1a6a38', cover: '#28a85a', light: '#40d07a' }, // Jade
]

function darkenHex(hex: string, amount = 40): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `#${Math.max(0, r - amount).toString(16).padStart(2, '0')}${Math.max(0, g - amount).toString(16).padStart(2, '0')}${Math.max(0, b - amount).toString(16).padStart(2, '0')}`
}

function getPatternTransform(bookId: string): string {
  const hash = bookId.split('').reduce((a, c, i) => a + c.charCodeAt(0) * (i + 1), 0)
  const rotation = (hash % 60) - 30
  const ox = (hash * 3) % 14
  const oy = (hash * 7) % 14
  return `rotate(${rotation}) translate(${ox} ${oy})`
}

function getPalette(book: Book) {
  if (book.coverColor) {
    const c = book.coverColor
    return { spine: darkenHex(c, 35), cover: c, light: c }
  }
  return COVER_PALETTES[book.title.charCodeAt(0) % COVER_PALETTES.length]
}

function PatternDef({ id, pattern, transform }: { id: string; pattern: string; transform: string }) {
  switch (pattern) {
    case 'flowers':
      return (
        <pattern id={id} x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse" patternTransform={transform}>
          <circle cx="12" cy="7.5" r="2.2" fill="white" />
          <circle cx="16" cy="10.5" r="2.2" fill="white" />
          <circle cx="15" cy="15.5" r="2.2" fill="white" />
          <circle cx="9" cy="15.5" r="2.2" fill="white" />
          <circle cx="8" cy="10.5" r="2.2" fill="white" />
          <circle cx="12" cy="12" r="2.8" fill="white" />
        </pattern>
      )
    case 'plants':
      return (
        <pattern id={id} x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse" patternTransform={transform}>
          <path d="M12,22 L12,13" stroke="white" strokeWidth="1.5" fill="none" />
          <path d="M12,14 C8,9 3,11 5,15 C7,19 12,17 12,14" fill="white" />
          <path d="M12,14 C16,9 21,11 19,15 C17,19 12,17 12,14" fill="white" />
        </pattern>
      )
    case 'stars':
      return (
        <pattern id={id} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform={transform}>
          <path d="M10,3 L11.5,8 L16.5,8 L12.5,11 L14,16 L10,13 L6,16 L7.5,11 L3.5,8 L8.5,8 Z" fill="white" />
        </pattern>
      )
    case 'waves':
      return (
        <pattern id={id} x="0" y="0" width="40" height="14" patternUnits="userSpaceOnUse" patternTransform={transform}>
          <path d="M0,7 Q10,1 20,7 Q30,13 40,7" fill="none" stroke="white" strokeWidth="1.5" />
        </pattern>
      )
    case 'diamonds':
      return (
        <pattern id={id} x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform={transform}>
          <path d="M8,1 L15,8 L8,15 L1,8 Z" fill="none" stroke="white" strokeWidth="1.2" />
        </pattern>
      )
    case 'dots':
      return (
        <pattern id={id} x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform={transform}>
          <circle cx="7" cy="7" r="2" fill="white" />
        </pattern>
      )
    case 'butterflies':
      return (
        <pattern id={id} x="0" y="0" width="28" height="22" patternUnits="userSpaceOnUse" patternTransform={transform}>
          <path d="M14,11 C10,5 3,6 4,10 C5,13 10,12 14,11Z" fill="white" />
          <path d="M14,11 C18,5 25,6 24,10 C23,13 18,12 14,11Z" fill="white" />
          <path d="M14,11 C9,14 5,18 7,21 C9,22 13,17 14,11Z" fill="white" />
          <path d="M14,11 C19,14 23,18 21,21 C19,22 15,17 14,11Z" fill="white" />
        </pattern>
      )
    default:
      return null
  }
}

interface BookCardProps {
  book: Book
  showUser?: boolean
  linkTo?: string
  /** Overlay buttons rendered on hover over the book cover */
  actions?: React.ReactNode
}

export function BookCard({ book, showUser = true, linkTo, actions }: BookCardProps) {
  const palette = getPalette(book)
  const href = linkTo ?? `/books/${book.id}`
  const patternId = `pat-${book.id}`
  const hasPattern = book.coverPattern && book.coverPattern !== 'none'
  const patternTransform = getPatternTransform(book.id)

  return (
    <Link to={href} className="group block" style={{ perspective: '600px' }}>
      <div
        className="relative transition-transform duration-300 group-hover:-translate-y-2"
        style={{ width: '140px' }}
      >
        {/* Shadow */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-28 h-3 rounded-full blur-md opacity-25 transition-all duration-300 group-hover:opacity-40 group-hover:blur-lg"
          style={{ background: palette.spine }}
        />

        {/* 3D container */}
        <div className="relative" style={{ transformStyle: 'preserve-3d' }}>
          {/* Spine */}
          <div
            className="absolute left-0 top-0 h-full rounded-l"
            style={{
              width: '18px',
              background: palette.spine,
              transform: 'rotateY(-90deg) translateZ(9px)',
              transformOrigin: 'left center',
            }}
          />

          {/* Cover */}
          <div
            className="relative rounded-r overflow-hidden flex flex-col"
            style={{
              width: '140px',
              height: '200px',
              background: `linear-gradient(135deg, ${palette.cover} 0%, ${palette.spine} 100%)`,
              boxShadow: `inset -3px 0 8px rgba(0,0,0,0.35), 3px 3px 16px rgba(0,0,0,0.5)`,
            }}
          >
            {/* Page edge texture — dark tone */}
            <div
              className="absolute right-0 top-0 h-full"
              style={{
                width: '6px',
                background: 'repeating-linear-gradient(to bottom, #1e2d26 0px, #162119 1px, #1e2d26 2px)',
              }}
            />

            {/* SVG pattern overlay */}
            {hasPattern && (
              <svg
                className="absolute inset-0 w-full h-full"
                xmlns="http://www.w3.org/2000/svg"
                style={{ opacity: 0.18 }}
              >
                <defs>
                  <PatternDef id={patternId} pattern={book.coverPattern!} transform={patternTransform} />
                </defs>
                <rect width="100%" height="100%" fill={`url(#${patternId})`} />
              </svg>
            )}

            {/* Shine */}
            <div
              className="absolute top-0 left-0 right-6 h-1/3 rounded-tr opacity-15"
              style={{ background: 'linear-gradient(to bottom, white, transparent)' }}
            />

            {/* Top ornament */}
            <div className="flex justify-center pt-4 pb-2">
              <div className="w-12 h-px opacity-40" style={{ background: palette.light }} />
            </div>

            {/* Title */}
            <div className="flex-1 flex items-center justify-center px-3">
              <h3
                className="font-display text-center font-bold leading-tight text-sm"
                style={{ color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
              >
                {book.title}
              </h3>
            </div>

            {/* Bottom ornament */}
            <div className="flex justify-center pb-3 pt-2">
              <div className="w-12 h-px opacity-40" style={{ background: palette.light }} />
            </div>

            {/* Private badge */}
            {!book.isPublic && (
              <div
                className="absolute top-2 right-2 text-xs px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(0,0,0,0.45)', color: '#c0d8cc', fontSize: '9px' }}
              >
                privado
              </div>
            )}

            {/* Actions overlay */}
            {actions && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                {actions}
              </div>
            )}
          </div>
        </div>

        {/* Info below */}
        <div className="mt-3 text-center">
          {showUser && book.user && (
            <p className="text-xs text-[var(--color-teal-text)] font-medium truncate">
              @{book.user.username}
            </p>
          )}
          <p className="text-xs text-[var(--color-ink-light)]">
            {book._count?.readings ?? 0} {book._count?.readings === 1 ? 'lectura' : 'lecturas'}
          </p>
        </div>
      </div>
    </Link>
  )
}
