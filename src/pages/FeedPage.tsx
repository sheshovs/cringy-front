import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { booksApi } from '../api'
import { BookCard } from '../components/BookCard'
import { useAuth } from '../store/AuthContext'

export function FeedPage() {
  const { user } = useAuth()
  const [explore, setExplore] = useState(false)
  const [page, setPage] = useState(1)

  const showExplore = !!user && explore

  const { data, isLoading } = useQuery({
    queryKey: ['feed', showExplore, page],
    queryFn: () => showExplore
      ? booksApi.getExplore(page).then((r) => r.data)
      : booksApi.getFeed(page).then((r) => r.data),
  })

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="font-display text-5xl font-bold text-[var(--color-mauve-dark)] mb-3">
          Cringy Nostalgia
        </h1>
        <p className="text-[var(--color-ink-light)] text-lg max-w-md mx-auto">
          Un club de lectura. Un diario. Un poco vergonzoso — y nos encanta.
        </p>
        {!user && (
          <div className="mt-6 flex gap-3 justify-center">
            <Link
              to="/register"
              className="px-6 py-2.5 rounded-full bg-[var(--color-btn-primary)] text-white font-medium hover:bg-[var(--color-btn-primary-hover)] transition-colors"
            >
              Únete al club
            </Link>
            <Link
              to="/login"
              className="px-6 py-2.5 rounded-full border border-[var(--color-mauve)] text-[var(--color-mauve-dark)] font-medium hover:bg-[var(--color-parchment)] transition-colors"
            >
              Iniciar sesión
            </Link>
          </div>
        )}
      </div>

      {/* Toggle para usuarios logueados */}
      {user && (
        <div className="flex items-center gap-3 mb-6">
          <h2 className="font-display text-2xl font-semibold text-[var(--color-ink)]">
            {explore ? 'Explorar todos los libros' : 'De personas que sigues'}
          </h2>
          <button
            onClick={() => { setExplore((e) => !e); setPage(1) }}
            className="ml-auto text-sm px-4 py-1.5 rounded-full border border-[var(--color-teal-muted)] text-[var(--color-teal-text)] hover:bg-[var(--color-teal-muted)] hover:text-white transition-colors"
          >
            {explore ? 'Ver seguidos' : 'Explorar todo'}
          </button>
        </div>
      )}

      {!user && (
        <h2 className="font-display text-2xl font-semibold text-[var(--color-ink)] mb-6">
          Colecciones públicas
        </h2>
      )}

      {isLoading && (
        <div className="flex gap-8 justify-center flex-wrap">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-36 h-52 rounded bg-[var(--color-border)] animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && data?.books.length === 0 && (
        <div className="text-center py-20 text-[var(--color-ink-light)]">
          {user && !explore ? (
            <>
              <p className="text-lg mb-3">Nada por aquí todavía.</p>
              <p className="text-sm">Sigue a otros lectores para ver sus libros, o</p>
              <button
                onClick={() => setExplore(true)}
                className="mt-2 text-[var(--color-mauve-dark)] underline text-sm"
              >
                explora todos los libros públicos
              </button>
            </>
          ) : (
            <p className="text-lg">Aún no hay libros públicos. ¡Sé el primero!</p>
          )}
        </div>
      )}

      {!isLoading && data && data.books.length > 0 && (
        <>
          <div className="flex flex-wrap gap-8 justify-start">
            {data.books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>

          <div className="flex justify-center gap-4 mt-10">
            {page > 1 && (
              <button
                onClick={() => setPage((p) => p - 1)}
                className="px-5 py-2 rounded-full border border-[var(--color-border)] text-sm hover:bg-[var(--color-parchment)] transition-colors"
              >
                Anterior
              </button>
            )}
            {data.books.length === 20 && (
              <button
                onClick={() => setPage((p) => p + 1)}
                className="px-5 py-2 rounded-full border border-[var(--color-border)] text-sm hover:bg-[var(--color-parchment)] transition-colors"
              >
                Siguiente
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
