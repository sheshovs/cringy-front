import { Navigate } from 'react-router-dom'
import { useAuth } from '../store/AuthContext'

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-mauve-dark font-display text-xl animate-pulse">
          Cringy Nostalgia...
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}
