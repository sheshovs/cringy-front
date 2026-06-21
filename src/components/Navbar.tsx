import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/AuthContext'
import cringyLogo from '../assets/cringy-logo.png'

export function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-cream)]/90 backdrop-blur">
      <div className="max-w-5xl mx-auto px-4 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src={cringyLogo} alt="Cringy Nostalgia" className="h-20 w-auto" />
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link
                to="/my-books"
                className="text-sm text-[var(--color-ink-light)] hover:text-[var(--color-mauve-dark)] transition-colors"
              >
                Mis libros
              </Link>
              <Link
                to={`/profile/${user.username}`}
                className="text-sm text-[var(--color-ink-light)] hover:text-[var(--color-mauve-dark)] transition-colors"
              >
                {user.username}
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm px-4 py-1.5 rounded-full border border-[var(--color-mauve)] text-[var(--color-mauve-dark)] hover:bg-[var(--color-btn-primary-hover)] hover:text-white transition-colors"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm text-[var(--color-ink-light)] hover:text-[var(--color-mauve-dark)] transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="text-sm px-4 py-1.5 rounded-full bg-[var(--color-btn-primary)] text-white hover:bg-[var(--color-btn-primary-hover)] transition-colors"
              >
                Únete
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
