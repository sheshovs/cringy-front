import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '../api'
import { useAuth } from '../store/AuthContext'
import { useNavigate } from 'react-router-dom'
import { AxiosError } from 'axios'

const schema = z.object({
  bio: z.string().max(300).optional(),
  avatar: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

export function SettingsPage() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      bio: user?.bio || '',
      avatar: user?.avatar || '',
    },
  })

  const mutation = useMutation({
    mutationFn: (data: FormData) => usersApi.updateMe({
      bio: data.bio || undefined,
      avatar: data.avatar || undefined,
    }),
    onSuccess: (res) => {
      setUser(res.data.user)
      qc.invalidateQueries({ queryKey: ['profile', user?.username] })
      navigate(`/profile/${user?.username}`)
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      await mutation.mutateAsync(data)
    } catch (e) {
      const err = e as AxiosError<{ error: string }>
      setError('root', { message: err.response?.data?.error || 'Error al actualizar' })
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="font-display text-3xl font-bold text-[var(--color-ink)] mb-8">Editar perfil</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-8 shadow-sm space-y-5"
      >
        {errors.root && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
            {errors.root.message}
          </div>
        )}

        <div>
          <p className="text-sm text-[var(--color-ink-light)] mb-1">Usuario</p>
          <p className="font-medium text-[var(--color-ink)]">@{user?.username}</p>
          <p className="text-xs text-[var(--color-ink-light)] mt-1">El nombre de usuario no se puede cambiar.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">Biografía</label>
          <textarea
            {...register('bio')}
            rows={3}
            className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-mauve)] resize-none"
            placeholder="Cuéntanos sobre tu gusto literario..."
          />
          {errors.bio && <p className="text-red-400 text-xs mt-1">{errors.bio.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">URL del avatar</label>
          <input
            {...register('avatar')}
            type="url"
            className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-mauve)]"
            placeholder="https://ejemplo.com/avatar.jpg"
          />
          {errors.avatar && <p className="text-red-400 text-xs mt-1">{errors.avatar.message}</p>}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-2.5 rounded-lg bg-[var(--color-btn-primary)] text-white font-medium hover:bg-[var(--color-btn-primary-hover)] disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2.5 rounded-lg border border-[var(--color-border)] text-[var(--color-ink-light)] text-sm hover:bg-[var(--color-parchment)] transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
