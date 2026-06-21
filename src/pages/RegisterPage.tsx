import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/AuthContext'
import { AxiosError } from 'axios'

const schema = z.object({
  username: z.string().min(3, 'Mínimo 3 caracteres').max(30).regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guiones bajos'),
  email: z.string().email('Correo inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type FormData = z.infer<typeof schema>

export function RegisterPage() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      await registerUser(data.username, data.email, data.password)
      navigate('/')
    } catch (e) {
      const err = e as AxiosError<{ error: string }>
      setError('root', { message: err.response?.data?.error || 'Error al registrarse' })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-cream)] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold text-[var(--color-mauve-dark)]">
            Únete al club
          </h1>
          <p className="text-[var(--color-ink-light)] mt-2">Empieza tu diario de lectura</p>
        </div>

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
            <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">Usuario</label>
            <input
              {...register('username')}
              autoComplete="username"
              className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-mauve)]"
              placeholder="lector_42"
            />
            {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">Correo electrónico</label>
            <input
              {...register('email')}
              type="email"
              autoComplete="email"
              className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-mauve)]"
              placeholder="tu@correo.com"
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">Contraseña</label>
            <input
              {...register('password')}
              type="password"
              autoComplete="new-password"
              className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-mauve)]"
              placeholder="Mínimo 6 caracteres"
            />
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-lg bg-[var(--color-btn-primary)] text-white font-medium hover:bg-[var(--color-btn-primary-hover)] disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--color-ink-light)] mt-4">
          ¿Ya eres miembro?{' '}
          <Link to="/login" className="text-[var(--color-mauve-dark)] hover:underline font-medium">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
