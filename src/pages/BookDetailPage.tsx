import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { booksApi, readingsApi } from '../api'
import { ReadingForm } from '../components/ReadingForm'
import { useAuth } from '../store/AuthContext'
import type { Reading } from '../types'

const STATUS_LABELS: Record<string, string> = {
  WANT_TO_READ: 'Quiero leerlo',
  READING: 'Leyendo',
  FINISHED: 'Terminado',
  DROPPED: 'Abandonado',
}

const STATUS_COLORS: Record<string, string> = {
  WANT_TO_READ: '#1a3028',
  READING:      '#0f2535',
  FINISHED:     '#0d2a1a',
  DROPPED:      '#2a1020',
}

const COVER_PALETTES = [
  { spine: '#1a5c4e', cover: '#28917a', light: '#4abda0' }, // Esmeralda
  { spine: '#1a4f8a', cover: '#2e7fd4', light: '#5aa8f0' }, // Zafiro
  { spine: '#5e1a72', cover: '#9a35b8', light: '#c060d8' }, // Amatista
  { spine: '#8a1a38', cover: '#c8325a', light: '#e86080' }, // Rubí
  { spine: '#8a6000', cover: '#c88a1a', light: '#e8b040' }, // Ámbar
  { spine: '#1a6a38', cover: '#28a85a', light: '#40d07a' }, // Jade
]

function darkenHex(hex: string, amount = 35): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `#${Math.max(0, r - amount).toString(16).padStart(2, '0')}${Math.max(0, g - amount).toString(16).padStart(2, '0')}${Math.max(0, b - amount).toString(16).padStart(2, '0')}`
}

// ── Page content renderer ──────────────────────────────────────────────────
function PageContent({
  pageIndex,
  readings,
  book,
  palette,
  isOwner,
  onEdit,
  onDelete,
}: {
  pageIndex: number
  readings: Reading[]
  book: { title: string; description?: string | null; user?: { username: string } | null }
  palette: typeof COVER_PALETTES[0]
  isOwner: boolean
  onEdit: (r: Reading) => void
  onDelete: (r: Reading) => void
}) {
  const totalPages = readings.length

  if (pageIndex === 0) {
    // Cover
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center p-10 relative select-none"
        style={{
          background: `linear-gradient(160deg, ${palette.light}40 0%, ${palette.cover}22 100%)`,
          minHeight: '400px',
        }}
      >
        <div className="flex items-center gap-3 mb-8 opacity-70">
          <div className="h-px w-16" style={{ background: palette.light }} />
          <div className="w-2 h-2 rounded-full" style={{ background: palette.light }} />
          <div className="h-px w-16" style={{ background: palette.light }} />
        </div>
        <h1
          className="font-display text-4xl font-bold text-center leading-tight mb-4 text-[var(--color-ink)]"
        >
          {book.title}
        </h1>
        {book.user && (
          <p className="text-sm text-[var(--color-parchment-text)] mb-6">
            por <span className="text-[var(--color-mauve)]">@{book.user.username}</span>
          </p>
        )}
        {book.description && (
          <p className="text-center text-[var(--color-parchment-text)] text-sm max-w-xs italic">
            "{book.description}"
          </p>
        )}
        <div className="flex items-center gap-3 mt-8 opacity-70">
          <div className="h-px w-16" style={{ background: palette.light }} />
          <div className="w-2 h-2 rounded-full" style={{ background: palette.light }} />
          <div className="h-px w-16" style={{ background: palette.light }} />
        </div>
        <div className="absolute bottom-4 right-6 text-xs text-[var(--color-parchment-text)]">
          {totalPages} {totalPages === 1 ? 'lectura' : 'lecturas'}
        </div>
      </div>
    )
  }

  const reading = readings[pageIndex - 1]
  if (!reading) return null

  const hasCringeSection = reading.cringeLevel != null || reading.cringeReason || reading.redFlags
  const hasOpinionSection = reading.notes || reading.reflection

  return (
    <div className="flex-1 min-h-0 flex flex-col p-8 select-none">

      {/* Paginación */}
      <div className="text-xs text-[var(--color-parchment-text)] text-right mb-4 shrink-0">
        Página {pageIndex} de {totalPages}
      </div>

      {/* Área de contenido — flex-1 + min-h-0 garantizan que el scroll
          esté acotado al espacio real disponible, sin espacio muerto */}
      <div
        className="flex-1 overflow-y-auto min-h-0 pr-1 pb-2 book-scroll"
        style={{ '--scroll-color': palette.cover } as React.CSSProperties}
      >

        {/* ── 1. Identidad ─────────────────────────────── */}
        <div>
          <h2 className="font-display text-2xl font-bold text-[var(--color-ink)] leading-tight">
            {reading.title}
          </h2>
          {reading.author && (
            <p className="text-sm text-[var(--color-parchment-text)] mt-0.5">{reading.author}</p>
          )}
        </div>

        {/* ── 2. Estado + fechas ───────────────────────── */}
        <div className="mt-4 flex flex-col gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className="text-xs px-3 py-1 rounded-full font-medium"
              style={{ background: STATUS_COLORS[reading.status], color: 'var(--color-ink)' }}
            >
              {STATUS_LABELS[reading.status]}
            </span>
            {reading.rating && (
              <div className="flex gap-0.5" title={`Puntuación: ${reading.rating}/5`}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className={s <= reading.rating! ? 'text-amber-400' : 'text-[var(--color-border)]'}>★</span>
                ))}
              </div>
            )}
          </div>
          {(reading.startDate || reading.finishDate) && (
            <div className="flex gap-4 text-xs text-[var(--color-parchment-text)]">
              {reading.startDate && (
                <span>📅 Inicio: {new Date(reading.startDate).toLocaleDateString('es-ES')}</span>
              )}
              {reading.finishDate && (
                <span>🏁 Fin: {new Date(reading.finishDate).toLocaleDateString('es-ES')}</span>
              )}
            </div>
          )}
        </div>

        {/* ── 3. Opinión ────────────────────────────────── */}
        {hasOpinionSection && (
          <div className="mt-5">
            <div className="h-px mb-4" style={{ background: `${palette.cover}55` }} />
            <div className="space-y-3">
              {reading.notes && (
                <div
                  className="border-l-2 pl-3 py-0.5 italic text-sm text-[var(--color-parchment-text)] leading-relaxed"
                  style={{ borderColor: palette.cover }}
                >
                  {reading.notes}
                </div>
              )}
              {reading.reflection && (
                <div>
                  <p className="text-xs text-[var(--color-parchment-text)] uppercase tracking-wide mb-1">Reflexión</p>
                  <p className="text-sm text-[var(--color-ink)] leading-relaxed italic">{reading.reflection}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── 4. Factor cringe ─────────────────────────── */}
        {hasCringeSection && (
          <div className="mt-5">
            <div className="h-px mb-4" style={{ background: `${palette.cover}55` }} />
            <div className="space-y-3">
              {reading.cringeLevel != null && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--color-parchment-text)] uppercase tracking-wide">Cringe</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span key={n} className={n <= reading.cringeLevel! ? 'text-pink-200' : 'text-[var(--color-border)]'} style={{ fontSize: '15px' }}>😣</span>
                    ))}
                  </div>
                </div>
              )}
              {reading.cringeReason && (
                <div>
                  <p className="text-xs text-[var(--color-parchment-text)] uppercase tracking-wide mb-1">Por qué fue cringe</p>
                  <p className="text-sm text-[var(--color-ink)] leading-relaxed">{reading.cringeReason}</p>
                </div>
              )}
              {reading.redFlags && (
                <div>
                  <p className="text-xs text-[var(--color-parchment-text)] uppercase tracking-wide mb-1">Red flags</p>
                  <p className="text-sm text-[var(--color-ink)] leading-relaxed">{reading.redFlags}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── 5. Social ─────────────────────────────────── */}
        {reading.recommendedTo && (
          <div className="mt-5">
            <div className="h-px mb-3" style={{ background: `${palette.cover}55` }} />
            <p className="text-xs text-[var(--color-parchment-text)] uppercase tracking-wide mb-1">Recomendado a</p>
            <p className="text-sm text-[var(--color-ink)]">{reading.recommendedTo}</p>
          </div>
        )}

      </div>

      {/* Acciones del propietario */}
      {isOwner && (
        <div className="flex gap-2 pt-4 border-t border-[var(--color-border)] mt-4 shrink-0">
          <button
            onClick={() => onEdit(reading)}
            className="text-xs px-3 py-1.5 rounded-lg border border-[var(--color-teal-muted)] text-[var(--color-teal-text)] hover:bg-[var(--color-teal-muted)] hover:text-white transition-colors"
          >
            Editar
          </button>
          <button
            onClick={() => onDelete(reading)}
            className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-400 hover:bg-red-50 transition-colors"
          >
            Eliminar
          </button>
        </div>
      )}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export function BookDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const qc = useQueryClient()

  const [currentPage, setCurrentPage] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [editingReading, setEditingReading] = useState<Reading | null>(null)

  // Flip animation state
  const [flipDir, setFlipDir] = useState<'forward' | 'backward' | null>(null)
  const [displayPage, setDisplayPage] = useState(0)   // what's currently visible
  const [pendingPage, setPendingPage] = useState<number | null>(null)
  const isAnimating = useRef(false)

  const { data, isLoading } = useQuery({
    queryKey: ['book', id],
    queryFn: () => booksApi.getBook(id!).then((r) => r.data),
  })

  const book = data?.book
  const readings = book?.readings ?? []
  const isOwner = user?.id === book?.userId
  const totalPages = readings.length

  const palette = book
    ? book.coverColor
      ? { spine: darkenHex(book.coverColor, 35), cover: book.coverColor, light: book.coverColor }
      : COVER_PALETTES[book.title.charCodeAt(0) % COVER_PALETTES.length]
    : COVER_PALETTES[0]

  const ANIM_MS = 550

  const goToPage = useCallback((target: number) => {
    if (isAnimating.current || target === displayPage) return
    if (target < 0 || target > totalPages) return
    isAnimating.current = true
    const dir = target > displayPage ? 'forward' : 'backward'
    const originPage = displayPage

    if (dir === 'forward') {
      // Fondo salta al destino inmediatamente; el flip tapa con el origen y se dobla
      setPendingPage(originPage)  // flip muestra origen en el frente
      setFlipDir('forward')
      setDisplayPage(target)
      setCurrentPage(target)
      setTimeout(() => {
        setFlipDir(null)
        setPendingPage(null)
        isAnimating.current = false
      }, ANIM_MS)
    } else {
      // Fondo se mantiene en origen; el flip empieza doblado (mostrando destino) y se abre
      setPendingPage(target)      // flip muestra destino en el frente (cara trasera se abre)
      setFlipDir('backward')
      setTimeout(() => {
        setDisplayPage(target)
        setCurrentPage(target)
        setFlipDir(null)
        setPendingPage(null)
        isAnimating.current = false
      }, ANIM_MS)
    }
  }, [displayPage, totalPages])

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (showForm || editingReading) return
      if (e.key === 'ArrowRight') goToPage(displayPage + 1)
      if (e.key === 'ArrowLeft') goToPage(displayPage - 1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [displayPage, goToPage, showForm, editingReading])

  const addMutation = useMutation({
    mutationFn: (d: Partial<Reading>) => readingsApi.addReading(id!, d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['book', id] })
      setShowForm(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ readingId, data }: { readingId: string; data: Partial<Reading> }) =>
      readingsApi.updateReading(id!, readingId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['book', id] })
      setEditingReading(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (readingId: string) => readingsApi.deleteReading(id!, readingId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['book', id] })
      const newTotal = readings.length - 1
      if (currentPage > newTotal) goToPage(newTotal)
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-[var(--color-ink-light)]">
        Cargando...
      </div>
    )
  }

  if (!book) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-[var(--color-ink-light)]">
        Libro no encontrado.
      </div>
    )
  }

  const pageProps = {
    readings,
    book,
    palette,
    isOwner,
    onEdit: (r: Reading) => { setEditingReading(r); setShowForm(false) },
    onDelete: (r: Reading) => {
      if (confirm(`¿Eliminar "${r.title}"?`)) deleteMutation.mutate(r.id)
    },
  }

  return (
    <div className="h-full bg-[var(--color-cream)] flex flex-col">
      {/* Back */}
      <div className="max-w-4xl mx-auto w-full px-4 pt-6">
        <Link
          to={isOwner ? '/my-books' : `/profile/${book.user?.username}`}
          className="text-sm text-[var(--color-ink-light)] hover:text-[var(--color-mauve-dark)] transition-colors"
        >
          ← {isOwner ? 'Mis colecciones' : `@${book.user?.username}`}
        </Link>
      </div>

      {/* Stage */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="flex items-center gap-6 md:gap-12">

          {/* Prev */}
          <button
            onClick={() => goToPage(displayPage - 1)}
            disabled={displayPage === 0 || !!flipDir}
            className="w-10 h-10 rounded-full flex items-center justify-center border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink-light)] hover:bg-[var(--color-parchment)] disabled:opacity-20 transition-all shadow-sm text-xl select-none"
          >
            ‹
          </button>

          {/* Book */}
          <div className="book-scene" style={{ width: '560px', maxWidth: '90vw' }}>
            <div className="relative book-spread" style={{ minHeight: '420px' }}>

              {/* Shadow */}
              <div
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 h-4 rounded-full blur-xl opacity-20"
                style={{ width: '80%', background: palette.spine }}
              />

              {/* Static book shell (spine + page texture) */}
              <div
                className="absolute inset-0 rounded-r-lg overflow-hidden"
                style={{
                  boxShadow: `-6px 0 0 ${palette.spine}, -10px 4px 20px rgba(0,0,0,0.28), 4px 4px 20px rgba(0,0,0,0.12)`,
                }}
              >
                {/* Spine */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-6"
                  style={{ background: palette.spine }}
                />
                {/* Page edge right */}
                 <div
                  className="absolute right-0 top-2 bottom-2 w-2 rounded-r"
                  style={{
                    background: 'repeating-linear-gradient(to bottom, #1e2d26 0px, #162119 1px, #1e2d26 3px)',
                    boxShadow: '2px 0 4px rgba(0,0,0,0.3)',
                  }}
                />
              </div>

              {/* Current page content (static — behind the flip) */}
              <div
                className="absolute inset-0 ml-6 mr-2 flex flex-col"
                style={{ background: 'var(--color-parchment)', zIndex: 1 }}
              >
                <PageContent pageIndex={displayPage} {...pageProps} />
              </div>

              {/* Flip layer — only rendered during animation */}
              {flipDir && pendingPage !== null && (
                <div className={`page-flip ${flipDir === 'forward' ? 'flip-forward' : 'flip-backward'}`}>
                  {/* Front face:
                      - forward:  origin page (tapa el destino y se dobla revelándolo)
                      - backward: destination page (empieza doblada y se abre) */}
                  <div
                    className="page-front ml-6 mr-2 flex flex-col"
                    style={{ background: 'var(--color-parchment)' }}
                  >
                    <PageContent pageIndex={pendingPage} {...pageProps} />
                    <div className="page-shadow" />
                  </div>

                  {/* Back face: paper texture visible al medio del giro */}
                  <div
                    className="page-back ml-6 mr-2"
                    style={{ background: '#0d1f18' }}
                  >
                    <div
                      className="absolute inset-0 opacity-30"
                      style={{
                        backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 27px, #1e3828 28px)',
                        backgroundSize: '100% 28px',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Next */}
          <button
            onClick={() => goToPage(displayPage + 1)}
            disabled={displayPage >= totalPages || !!flipDir}
            className="w-10 h-10 rounded-full flex items-center justify-center border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink-light)] hover:bg-[var(--color-parchment)] disabled:opacity-20 transition-all shadow-sm text-xl select-none"
          >
            ›
          </button>
        </div>

        {/* Dots */}
        {totalPages > 0 && (
          <div className="flex gap-2 mt-8 items-center">
            {[...Array(totalPages + 1)].map((_, i) => (
              <button
                key={i}
                onClick={() => goToPage(i)}
                disabled={!!flipDir}
                className="rounded-full transition-all duration-200 disabled:cursor-default"
                style={{
                  width:  i === displayPage ? '14px' : '8px',
                  height: i === displayPage ? '14px' : '8px',
                  background: i === displayPage ? palette.spine : palette.cover,
                  opacity: i === displayPage ? 1 : 0.4,
                }}
                title={i === 0 ? 'Portada' : `Lectura ${i}`}
              />
            ))}
          </div>
        )}

        {/* Add button */}
        {isOwner && (
          <div className="mt-6">
            <button
              onClick={() => { setShowForm(true); setEditingReading(null) }}
              className="px-5 py-2 rounded-full bg-[var(--color-btn-primary)] text-white text-sm font-medium hover:bg-[var(--color-btn-primary-hover)] transition-colors shadow"
            >
              + Agregar lectura
            </button>
          </div>
        )}

        <p className="mt-3 text-xs text-[var(--color-ink-light)]">
          Usa las flechas del teclado ← → para navegar
        </p>
      </div>

      {/* Form modal */}
      {(showForm || editingReading) && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] w-full max-w-lg shadow-2xl flex flex-col max-h-[600px]">
            <div className="px-6 pt-6 pb-4 border-b border-[var(--color-border)] shrink-0">
              <h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">
                {editingReading ? 'Editar lectura' : 'Agregar lectura'}
              </h2>
            </div>
            <div className="overflow-y-auto flex-1 px-6 py-4">
              <ReadingForm
                initial={editingReading || undefined}
                onSubmit={async (d) => {
                  if (editingReading) {
                    await updateMutation.mutateAsync({ readingId: editingReading.id, data: d })
                  } else {
                    await addMutation.mutateAsync(d)
                    // Navigate to new page after data refreshes
                    setTimeout(() => goToPage(readings.length + 1), 300)
                  }
                }}
                onCancel={() => { setShowForm(false); setEditingReading(null) }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
