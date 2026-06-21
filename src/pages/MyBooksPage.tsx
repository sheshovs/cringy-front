import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { booksApi } from '../api'
import { BookCard } from '../components/BookCard'
import { useForm } from 'react-hook-form'
import type { Resolver } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Book } from '../types'

// ── Cover customisation constants ────────────────────────────────────────────

const COVER_SWATCHES = [
  '#3a6a5a', '#2d5040', '#1a3a5a', '#4a3a7a',
  '#7a3050', '#6a3020', '#5a4a20', '#1a4a5a',
  '#5a3a6a', '#3a3a5a', '#6a2a3a', '#4a2a1a',
]

const PATTERNS = [
  { id: 'none',        label: 'Ninguno',    emoji: '—'  },
  { id: 'flowers',     label: 'Flores',     emoji: '🌸' },
  { id: 'plants',      label: 'Plantas',    emoji: '🌿' },
  { id: 'stars',       label: 'Estrellas',  emoji: '✨' },
  { id: 'waves',       label: 'Ondas',      emoji: '〰️' },
  { id: 'diamonds',    label: 'Diamantes',  emoji: '🔷' },
  { id: 'dots',        label: 'Lunares',    emoji: '⚫' },
  { id: 'butterflies', label: 'Mariposas',  emoji: '🦋' },
]

// ── Zod schema ────────────────────────────────────────────────────────────────

const bookSchema = z.object({
  title:        z.string().min(1, 'El título es obligatorio').max(100),
  description:  z.string().max(500).optional(),
  isPublic:     z.boolean().optional(),
  coverColor:   z.string().optional(),
  coverPattern: z.string().optional(),
})

type BookFormData = {
  title: string
  description?: string
  isPublic?: boolean
  coverColor?: string
  coverPattern?: string
}

// ── BookFormModal ─────────────────────────────────────────────────────────────

function BookFormModal({
  initial,
  onClose,
  onSubmit,
}: {
  initial?: Book
  onClose: () => void
  onSubmit: (data: BookFormData) => Promise<void>
}) {
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<BookFormData>({
    resolver: zodResolver(bookSchema) as Resolver<BookFormData>,
    defaultValues: {
      title:        initial?.title || '',
      description:  initial?.description || '',
      isPublic:     initial?.isPublic ?? false,
      coverColor:   initial?.coverColor || '#3a6a5a',
      coverPattern: initial?.coverPattern || 'none',
    },
  })

  const coverColor   = watch('coverColor')   || '#3a6a5a'
  const coverPattern = watch('coverPattern') || 'none'

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div
        className="rounded-2xl border border-[var(--color-border)] w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]"
        style={{ background: 'var(--color-surface)' }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[var(--color-border)] shrink-0">
          <h2 className="font-display text-2xl font-semibold text-[var(--color-ink)]">
            {initial ? 'Editar colección' : 'Nueva colección'}
          </h2>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          <form id="book-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">Título *</label>
              <input
                {...register('title')}
                className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-mauve)]"
                placeholder="Mi lista de lectura 2024"
              />
              {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">Descripción</label>
              <textarea
                {...register('description')}
                rows={2}
                className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-mauve)] resize-none"
                placeholder="¿De qué trata esta colección?"
              />
            </div>

            {/* Visibilidad */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                {...register('isPublic')}
                type="checkbox"
                className="w-4 h-4 accent-[var(--color-accent)]"
              />
              <span className="text-sm text-[var(--color-ink)]">Hacer esta colección pública</span>
            </label>

            {/* ── Portada ──────────────────────────────────────────── */}
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-parchment)] p-4 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">
                Portada
              </h3>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-ink)] mb-2">Color</label>
                <input type="hidden" {...register('coverColor')} />
                <div className="flex flex-wrap gap-2 mb-2">
                  {COVER_SWATCHES.map((swatch) => (
                    <button
                      key={swatch}
                      type="button"
                      onClick={() => setValue('coverColor', swatch)}
                      className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                      style={{
                        background: swatch,
                        borderColor: coverColor === swatch ? '#e0ede8' : 'transparent',
                        boxShadow: coverColor === swatch ? '0 0 0 1px rgba(224,237,232,0.3)' : 'none',
                      }}
                      title={swatch}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-[var(--color-ink-light)]">Personalizado:</label>
                  <input
                    type="color"
                    value={coverColor}
                    onChange={(e) => setValue('coverColor', e.target.value)}
                    className="w-8 h-7 rounded cursor-pointer border border-[var(--color-border)] p-0.5"
                    style={{ background: 'var(--color-surface)' }}
                  />
                  <span className="text-xs text-[var(--color-ink-light)] font-mono">{coverColor}</span>
                </div>
              </div>

              {/* Patrón */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-ink)] mb-2">Patrón</label>
                <input type="hidden" {...register('coverPattern')} />
                <div className="grid grid-cols-4 gap-2">
                  {PATTERNS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setValue('coverPattern', p.id)}
                      className="flex flex-col items-center gap-1 rounded-lg py-2 px-1 border transition-colors text-xs"
                      style={{
                        background: coverPattern === p.id ? 'var(--color-accent)' : 'var(--color-surface)',
                        borderColor: coverPattern === p.id ? 'var(--color-accent-light)' : 'var(--color-border)',
                        color: coverPattern === p.id ? '#fff' : 'var(--color-ink-light)',
                      }}
                    >
                      <span className="text-base leading-none">{p.emoji}</span>
                      <span className="truncate w-full text-center">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--color-border)] shrink-0 flex gap-3">
          <button
            type="submit"
            form="book-form"
            disabled={isSubmitting}
            className="flex-1 py-2.5 rounded-lg bg-[var(--color-btn-primary)] text-white font-medium hover:bg-[var(--color-btn-primary-hover)] disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? 'Guardando...' : initial ? 'Actualizar' : 'Crear'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg border border-[var(--color-border)] text-[var(--color-ink-light)] text-sm hover:bg-[var(--color-parchment)] transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── MyBooksPage ───────────────────────────────────────────────────────────────

export function MyBooksPage() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<Book | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['myBooks'],
    queryFn: () => booksApi.getMyBooks().then((r) => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (d: BookFormData) => booksApi.createBook(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['myBooks'] }); setShowCreate(false) },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: BookFormData }) => booksApi.updateBook(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['myBooks'] })
      qc.invalidateQueries({ queryKey: ['book', id] })
      setEditing(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => booksApi.deleteBook(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['myBooks'] }),
  })

  const togglePublic = useMutation({
    mutationFn: ({ id, isPublic }: { id: string; isPublic: boolean }) =>
      booksApi.updateBook(id, { isPublic }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['myBooks'] }),
  })

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-10">
        <h1 className="font-display text-3xl font-bold text-[var(--color-ink)]">Mis colecciones</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="px-5 py-2 rounded-full bg-[var(--color-btn-primary)] text-white text-sm font-medium hover:bg-[var(--color-btn-primary-hover)] transition-colors"
        >
          + Nueva colección
        </button>
      </div>

      {isLoading && (
        <div className="flex flex-wrap gap-10">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-36 h-52 rounded bg-[var(--color-border)] animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && (!data?.books || data.books.length === 0) && (
        <div className="text-center py-20 text-[var(--color-ink-light)]">
          <p className="text-lg mb-2">Sin colecciones todavía.</p>
          <p className="text-sm">¡Crea tu primera colección de lectura!</p>
        </div>
      )}

      {!isLoading && data && data.books.length > 0 && (
        <div className="flex flex-wrap gap-10">
          {data.books.map((book) => (
            <div key={book.id} className="relative group/book" style={{ width: '140px' }}>
              <BookCard
                book={book}
                showUser={false}
                linkTo={`/my-books/${book.id}`}
                actions={
                  <>
                    {/* Ver lecturas — primario */}
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/my-books/${book.id}`) }}
                      className="w-28 py-2 rounded-md text-xs font-semibold transition-colors duration-150 bg-white/15 hover:bg-white/28 text-white border border-white/30 hover:border-white/50"
                    >
                      Ver lecturas →
                    </button>

                    {/* Editar */}
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditing(book) }}
                      className="w-28 py-1.5 rounded-md text-xs font-medium transition-colors duration-150 bg-[#3a6a5a]/80 hover:bg-[#4a8a72]/90 text-[#e0ede8] border border-[#4a8a72]/40 hover:border-[#4a8a72]/70"
                    >
                      Editar
                    </button>

                    {/* Público / Privado */}
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        togglePublic.mutate({ id: book.id, isPublic: !book.isPublic })
                      }}
                      className="w-28 py-1.5 rounded-md text-xs font-medium transition-colors duration-150 bg-[#1e2d26]/80 hover:bg-[#2a3d32]/90 text-[#7fa898] hover:text-[#9fc8b8] border border-[#2a3d32]/60 hover:border-[#3a5a48]/80"
                    >
                      {book.isPublic ? 'Hacer privado' : 'Hacer público'}
                    </button>

                    {/* Eliminar */}
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        if (confirm(`¿Eliminar "${book.title}"?`)) deleteMutation.mutate(book.id)
                      }}
                      className="w-28 py-1.5 rounded-md text-xs font-medium transition-colors duration-150 bg-[#7a1e32]/80 hover:bg-[#a02040]/90 text-[#f4a0a0] hover:text-[#ffb8b8] border border-[#a02040]/40 hover:border-[#c03050]/60"
                    >
                      Eliminar
                    </button>
                  </>
                }
              />
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <BookFormModal
          onClose={() => setShowCreate(false)}
          onSubmit={(d) => createMutation.mutateAsync(d).then(() => {})}
        />
      )}

      {editing && (
        <BookFormModal
          initial={editing}
          onClose={() => setEditing(null)}
          onSubmit={(d) => updateMutation.mutateAsync({ id: editing.id, data: d }).then(() => {})}
        />
      )}
    </div>
  )
}
