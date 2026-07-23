import { Link, Navigate, Route, Routes } from 'react-router-dom'
import ChatPage from './pages/chat/ChatPage'

function AboutPage() {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl shadow-slate-950/50">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
        About this setup
      </p>
      <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
        Tailwind powers the UI, Redux manages state, and React Router handles navigation.
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-slate-300">
        You can extend this starter with your own slices, pages, and components as your app grows.
      </p>
    </section>
  )
}

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-lg font-semibold text-white">
            db-hack starter
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/about" className="text-sm text-slate-300 transition hover:text-white">
              About
            </Link>
            <Link to="/chat/general" className="text-sm text-slate-300 transition hover:text-white">
              Chat
            </Link>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-16">
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
