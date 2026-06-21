import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { searchApi } from '../api'
import type { OpenLibraryBook, Reading, ReadingStatus } from '../types'

const schema = z.object({
  title: z.string().min(1, 'El título es obligatorio'),
  author: z.string().optional(),
  openLibraryId: z.string().optional(),
  coverUrl: z.string().optional(),
  status: z.enum(['WANT_TO_READ', 'READING', 'FINISHED', 'DROPPED']),
  rating: z.number().int().min(1).max(5).optional().nullable(),
  cringeLevel: z.number().int().min(1).max(5).optional().nullable(),
  cringeReason: z.string().optional(),
  redFlags: z.string().optional(),
  reflection: z.string().optional(),
  recommendedTo: z.string().optional(),
  notes: z.string().optional(),
  startDate: z.string().optional(),
  finishDate: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface ReadingFormProps {
  initial?: Partial<Reading>
  onSubmit: (data: Partial<Reading>) => Promise<void>
  onCancel: () => void
}

function StarPicker({
  value,
  onChange,
}: {
  value: number | null | undefined
  onChange: (v: number | null) => void
}) {
  const [hovered, setHovered] = useState<number | null>(null)
  const active = hovered ?? value ?? 0
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(value === star ? null : star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(null)}
          className="text-2xl leading-none transition-transform hover:scale-110"
          aria-label={`${star} estrella${star > 1 ? 's' : ''}`}
        >
          <span className={star <= active ? 'text-amber-400' : 'text-gray-200'}>★</span>
        </button>
      ))}
    </div>
  )
}

function CringePicker({
  value,
  onChange,
}: {
  value: number | null | undefined
  onChange: (v: number | null) => void
}) {
  const [hovered, setHovered] = useState<number | null>(null)
  const active = hovered ?? value ?? 0
  const labels = ['Casi nada', 'Un poquito', 'Bastante', 'Mucho', 'Insoportable']
  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onChange(value === level ? null : level)}
            onMouseEnter={() => setHovered(level)}
            onMouseLeave={() => setHovered(null)}
            className="text-2xl leading-none transition-transform hover:scale-110"
            aria-label={`Cringe nivel ${level}`}
            style={{ opacity: level <= active ? 1 : 0.25 }}
          >
            😣
          </button>
        ))}
      </div>
      {active > 0 && (
        <p className="text-xs text-[var(--color-ink-light)]">{labels[active - 1]}</p>
      )}
    </div>
  )
}

export function ReadingForm({ initial, onSubmit, onCancel }: ReadingFormProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<OpenLibraryBook[]>([])
  const [searching, setSearching] = useState(false)

  const { register, handleSubmit, setValue, watch, control, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initial?.title || '',
      author: initial?.author || '',
      openLibraryId: initial?.openLibraryId || '',
      coverUrl: initial?.coverUrl || '',
      status: (initial?.status as ReadingStatus) || 'WANT_TO_READ',
      rating: initial?.rating ?? null,
      cringeLevel: initial?.cringeLevel ?? null,
      cringeReason: initial?.cringeReason || '',
      redFlags: initial?.redFlags || '',
      reflection: initial?.reflection || '',
      recommendedTo: initial?.recommendedTo || '',
      notes: initial?.notes || '',
      startDate: initial?.startDate?.slice(0, 10) || '',
      finishDate: initial?.finishDate?.slice(0, 10) || '',
    },
  })

  const selectedTitle = watch('title')
  const coverUrl = watch('coverUrl')
  const status = watch('status')

  const handleSearch = async () => {
    if (!query.trim()) return
    setSearching(true)
    try {
      const res = await searchApi.searchBooks(query)
      setResults(res.data.books)
    } finally {
      setSearching(false)
    }
  }

  const selectBook = (book: OpenLibraryBook) => {
    setValue('title', book.title)
    setValue('author', book.author || '')
    setValue('openLibraryId', book.openLibraryId)
    setValue('coverUrl', book.coverUrl || '')
    setResults([])
    setQuery('')
  }

  const submit = async (data: FormData) => {
    await onSubmit({
      ...data,
      startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
      finishDate: data.finishDate ? new Date(data.finishDate).toISOString() : undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">

      {/* ── SECCIÓN 1: Info general del libro ─────────────────── */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-parchment)] p-4 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">
          Info general del libro
        </h3>

        {/* Búsqueda Open Library */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">
            Buscar en Open Library
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
              placeholder="Busca por título o autor..."
              className="flex-1 border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-mauve)]"
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={searching}
              className="px-4 py-2 text-sm rounded-lg bg-[var(--color-teal-muted)] text-white hover:bg-[var(--color-accent)] disabled:opacity-50 transition-colors"
            >
              {searching ? '...' : 'Buscar'}
            </button>
          </div>

          {results.length > 0 && (
            <div className="mt-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] shadow-md max-h-52 overflow-y-auto">
              {results.map((book) => (
                <button
                  key={book.openLibraryId}
                  type="button"
                  onClick={() => selectBook(book)}
                  className="w-full text-left px-3 py-2 hover:bg-[var(--color-parchment)] border-b border-[var(--color-border)] last:border-0 flex gap-3 items-center"
                >
                  {book.coverUrl && (
                    <img src={book.coverUrl} alt="" className="w-8 h-12 object-cover rounded shrink-0" />
                  )}
                  <div>
                    <div className="text-sm font-medium text-[var(--color-ink)]">{book.title}</div>
                    <div className="text-xs text-[var(--color-ink-light)]">
                      {book.author} {book.year ? `(${book.year})` : ''}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Portada + título + autor */}
        <div className="flex gap-4 items-start">
          {coverUrl && (
            <img
              src={coverUrl}
              alt="Portada"
              className="w-16 h-24 object-cover rounded-lg shadow-sm shrink-0"
            />
          )}
          <div className="flex-1 space-y-2">
            <div>
              <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">Título *</label>
              <input
                {...register('title')}
                className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-mauve)]"
                placeholder={selectedTitle || 'Título del libro'}
              />
              {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">Autor</label>
              <input
                {...register('author')}
                className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-mauve)]"
                placeholder="Nombre del autor"
              />
            </div>
          </div>
        </div>

        {/* Estado */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">Estado</label>
          <select
            {...register('status')}
            className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-mauve)]"
          >
            <option value="WANT_TO_READ">Quiero leerlo</option>
            <option value="READING">Leyendo</option>
            <option value="FINISHED">Terminado</option>
            <option value="DROPPED">Abandonado</option>
          </select>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">Inicio</label>
            <input
              {...register('startDate')}
              type="date"
              className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-mauve)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">Fin</label>
            <input
              {...register('finishDate')}
              type="date"
              className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-mauve)]"
            />
          </div>
        </div>
      </div>

      {/* ── SECCIÓN 2: Tu valoración ──────────────────────────── */}
      {status !== 'WANT_TO_READ' && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-parchment)] p-4 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">
            Tu valoración
          </h3>

          {/* Estrellas */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-ink)] mb-2">
              ¿Cuántas estrellas le das?
            </label>
            <Controller
              name="rating"
              control={control}
              render={({ field }) => (
                <StarPicker value={field.value} onChange={field.onChange} />
              )}
            />
          </div>

          {/* Nivel de cringe */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-ink)] mb-2">
              Nivel de cringe 😣
            </label>
            <Controller
              name="cringeLevel"
              control={control}
              render={({ field }) => (
                <CringePicker value={field.value} onChange={field.onChange} />
              )}
            />
          </div>
        </div>
      )}

      {/* ── SECCIÓN 3: El análisis cringy ─────────────────────── */}
      {status !== 'WANT_TO_READ' && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-parchment)] p-4 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">
            El análisis cringy
          </h3>

          {/* ¿Por qué te dio cringe? */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">
              ¿Por qué te dio cringe?
            </label>
            <textarea
              {...register('cringeReason')}
              rows={2}
              className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-mauve)] resize-none"
              placeholder="Ese diálogo que hizo que quisieras cerrar el libro..."
            />
          </div>

          {/* Red flags */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">
              ¿Qué red flags encontraste? 🚩
            </label>
            <textarea
              {...register('redFlags')}
              rows={2}
              className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-mauve)] resize-none"
              placeholder="Él la llamaba 'mi posesión', por ejemplo..."
            />
          </div>

          {/* Reflexión */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">
              Reflexión que te generó
            </label>
            <textarea
              {...register('reflection')}
              rows={3}
              className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-mauve)] resize-none"
              placeholder="A pesar del cringe, me hizo pensar en..."
            />
          </div>

          {/* ¿A quién se lo recomendarías? */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">
              ¿A quién se lo recomendarías?
            </label>
            <input
              {...register('recommendedTo')}
              className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-mauve)]"
              placeholder="A esa amiga a la que le acaban de pegar la PLR..."
            />
          </div>
        </div>
      )}

      {/* ── SECCIÓN 4: Notas libres ───────────────────────────── */}
      {status !== 'WANT_TO_READ' && (
        <div>
          <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">Notas adicionales</label>
          <textarea
            {...register('notes')}
            rows={3}
            className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-mauve)] resize-none"
            placeholder="Lo que sea que quieras anotar..."
          />
        </div>
      )}

      {/* ── Acciones ──────────────────────────────────────────── */}
      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 py-2 rounded-lg bg-[var(--color-btn-primary)] text-white text-sm font-medium hover:bg-[var(--color-btn-primary-hover)] disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'Guardando...' : initial ? 'Actualizar lectura' : 'Agregar lectura'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-ink-light)] text-sm hover:bg-[var(--color-parchment)] transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
