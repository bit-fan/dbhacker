import { Link, Navigate, Route, Routes } from 'react-router-dom'
import ChatPage from './pages/chat/ChatPage'

function AboutPage() {
  return (
    <section className="w-full rounded-md border border-blue-500/40 bg-[#001a36]/90 p-8 shadow-[0_20px_50px_rgba(0,15,40,0.45)]">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-300">
        About this setup
      </p>
      <h1 className="mt-4 text-3xl font-semibold text-blue-50 sm:text-4xl">
        Tailwind powers the UI, Redux manages state, and React Router handles navigation.
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-blue-100/80">
        You can extend this starter with your own slices, pages, and components as your app grows.
      </p>
    </section>
  )
}

function App() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#001833] text-blue-50">
      <header className="border-b border-blue-500/30 bg-[#001733]/95 backdrop-blur">
        <nav className="flex w-full items-center justify-between px-6 py-4">
          <Link to="/" className="text-lg font-semibold tracking-wide text-blue-100">
            db-hack starter
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/about" className="text-sm text-blue-200/85 transition hover:text-white">
              About
            </Link>
            <Link to="/chat/general" className="text-sm text-blue-200/85 transition hover:text-white">
              Chat
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex h-full min-h-0 w-full flex-1 overflow-hidden px-3 md:px-4">
        <Routes>
          <Route path="/" element={<Navigate to="/chat/general" replace />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/chat" element={<Navigate to="/chat/general" replace />} />
          <Route path="/chat/:id" element={<ChatPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
