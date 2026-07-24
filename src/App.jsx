import { Link, Navigate, Route, Routes } from 'react-router-dom'
import ChatPage from './pages/chat/ChatPage'

function AboutPage() {
  return (
    <section className="w-full rounded-sm border border-blue-500/40 bg-[#001a36]/90 p-6 shadow-[0_20px_50px_rgba(0,15,40,0.45)]">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-300">
        About this setup
      </p>
      <h1 className="mt-4 text-3xl font-semibold text-blue-50 sm:text-4xl">
        This app uses a modern React UI, Redux for state, and React Router for navigation.
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-blue-100/80">
        It includes a structured chat workflow, ticket flow, and rule-based bot responses that you can extend.
      </p>
    </section>
  )
}

function App() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#001833] text-blue-50">
      <main className="flex h-full min-h-0 w-full flex-1 overflow-hidden px-2 py-2 md:px-3 md:py-3">
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
