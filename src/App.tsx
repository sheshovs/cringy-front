import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './store/AuthContext'
import { Navbar } from './components/Navbar'
import { PrivateRoute } from './components/PrivateRoute'
import { FeedPage } from './pages/FeedPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ProfilePage } from './pages/ProfilePage'
import { SettingsPage } from './pages/SettingsPage'
import { MyBooksPage } from './pages/MyBooksPage'
import { BookDetailPage } from './pages/BookDetailPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 30,
    },
  },
})

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <Navbar />
      <main className="flex-1 min-h-0 overflow-y-auto">{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Routes with Navbar */}
            <Route
              path="/"
              element={<Layout><FeedPage /></Layout>}
            />
            <Route
              path="/profile/:username"
              element={<Layout><ProfilePage /></Layout>}
            />
            <Route
              path="/books/:id"
              element={<Layout><BookDetailPage /></Layout>}
            />

            {/* Private routes */}
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <Layout><SettingsPage /></Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/my-books"
              element={
                <PrivateRoute>
                  <Layout><MyBooksPage /></Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/my-books/:id"
              element={
                <PrivateRoute>
                  <Layout><BookDetailPage /></Layout>
                </PrivateRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
