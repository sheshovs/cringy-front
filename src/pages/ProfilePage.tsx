import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi, booksApi } from '../api'
import { BookCard } from '../components/BookCard'
import { useAuth } from '../store/AuthContext'

export function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const { user: me } = useAuth()
  const qc = useQueryClient()

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => usersApi.getProfile(username!).then((r) => r.data),
  })

  const profile = profileData?.user

  const { data: followersData } = useQuery({
    queryKey: ['followers', profile?.id],
    queryFn: () => usersApi.getFollowers(profile!.id).then((r) => r.data),
    enabled: !!profile,
  })

  const { data: booksData } = useQuery({
    queryKey: ['userBooks', profile?.id],
    queryFn: () => booksApi.getUserBooks(profile!.id).then((r) => r.data),
    enabled: !!profile,
  })

  const isFollowing = followersData?.followers.some((f) => f.id === me?.id)
  const isMe = me?.username === username

  const followMutation = useMutation({
    mutationFn: () => isFollowing
      ? usersApi.unfollow(profile!.id)
      : usersApi.follow(profile!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['followers', profile?.id] })
      qc.invalidateQueries({ queryKey: ['profile', username] })
    },
  })

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-[var(--color-ink-light)]">
        Cargando...
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-[var(--color-ink-light)]">
        Usuario no encontrado.
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Cabecera de perfil */}
      <div className="flex items-start gap-6 mb-10">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-[var(--color-parchment)] border-2 border-[var(--color-mauve)] flex items-center justify-center shrink-0">
          {profile.avatar ? (
            <img src={profile.avatar} alt={profile.username} className="w-full h-full object-cover" />
          ) : (
            <span className="font-display text-3xl text-[var(--color-mauve-dark)]">
              {profile.username[0].toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="font-display text-3xl font-bold text-[var(--color-ink)]">
              @{profile.username}
            </h1>
            {isMe ? (
              <Link
                to="/settings"
                className="text-sm px-4 py-1.5 rounded-full border border-[var(--color-border)] text-[var(--color-ink-light)] hover:bg-[var(--color-parchment)] transition-colors"
              >
                Editar perfil
              </Link>
            ) : me && (
              <button
                onClick={() => followMutation.mutate()}
                disabled={followMutation.isPending}
                className={`text-sm px-4 py-1.5 rounded-full transition-colors ${
                  isFollowing
                    ? 'border border-[var(--color-border)] text-[var(--color-ink-light)] hover:bg-[var(--color-parchment)]'
                    : 'bg-[var(--color-btn-primary)] text-white hover:bg-[var(--color-btn-primary-hover)]'
                }`}
              >
                {isFollowing ? 'Dejar de seguir' : 'Seguir'}
              </button>
            )}
          </div>

          {profile.bio && (
            <p className="text-[var(--color-ink-light)] mt-2">{profile.bio}</p>
          )}

          <div className="flex gap-6 mt-3 text-sm text-[var(--color-ink-light)]">
            <span><strong className="text-[var(--color-ink)]">{profile._count?.books ?? 0}</strong> libros</span>
            <span><strong className="text-[var(--color-ink)]">{profile._count?.followers ?? 0}</strong> seguidores</span>
            <span><strong className="text-[var(--color-ink)]">{profile._count?.following ?? 0}</strong> siguiendo</span>
          </div>
        </div>
      </div>

      {/* Libros públicos */}
      <h2 className="font-display text-2xl font-semibold text-[var(--color-ink)] mb-4">
        Colecciones
      </h2>

      {(!booksData?.books || booksData.books.length === 0) && (
        <p className="text-[var(--color-ink-light)] text-sm">Sin colecciones públicas todavía.</p>
      )}

      <div className="flex flex-wrap gap-8">
        {booksData?.books.map((book) => (
          <BookCard key={book.id} book={book} showUser={false} />
        ))}
      </div>
    </div>
  )
}
