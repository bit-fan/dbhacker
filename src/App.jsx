import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import {
  decrement,
  increment,
  incrementByAmount,
} from './features/counter/counterSlice'

const channels = [
  { id: 'general', name: 'General', status: 'Online' },
  { id: 'design', name: 'Design', status: '2 new' },
  { id: 'engineering', name: 'Engineering', status: '5 active' },
  { id: 'product', name: 'Product', status: 'Planning' },
  { id: 'support', name: 'Support', status: 'Waiting' },
]

const initialMessages = {
  general: [
    {
      id: 'g-1',
      author: 'Mia',
      time: '09:20',
      text: 'Daily sync starts in 10 minutes. Share blockers in this thread.',
    },
    {
      id: 'g-2',
      author: 'Leo',
      time: '09:27',
      text: 'I will post the sprint dashboard after standup.',
    },
  ],
  design: [
    {
      id: 'd-1',
      author: 'Ava',
      time: '08:42',
      text: 'Uploaded new icon set. Please review contrast before noon.',
    },
  ],
  engineering: [
    {
      id: 'e-1',
      author: 'Noah',
      time: '08:58',
      text: 'API deploy is complete. Monitoring error rate for the next hour.',
    },
  ],
  product: [
    {
      id: 'p-1',
      author: 'Ella',
      time: '09:05',
      text: 'Roadmap review moved to Friday, 2pm.',
    },
  ],
  support: [
    {
      id: 's-1',
      author: 'Ivy',
      time: '09:11',
      text: 'Three high-priority tickets need engineering input.',
    },
  ],
}

function HomePage() {
  const count = useSelector((state) => state.counter.value)
  const dispatch = useDispatch()
  const [amount, setAmount] = useState(2)

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl shadow-slate-950/50">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
        Redux + Tailwind + Router
      </p>
      <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
        A modern React starter is ready.
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-slate-300">
        This app now includes a Redux store, client-side routing, and Tailwind CSS styling.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-700"
          onClick={() => dispatch(decrement())}
        >
          Decrement
        </button>
        <button
          type="button"
          className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400"
          onClick={() => dispatch(increment())}
        >
          Increment
        </button>
        <button
          type="button"
          className="rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-400"
          onClick={() => dispatch(incrementByAmount(Number(amount) || 0))}
        >
          Add {amount}
        </button>
      </div>

      <label className="mt-6 flex items-center gap-3 text-sm text-slate-300">
        <span>Amount</span>
        <input
          className="w-20 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-0"
          type="number"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </label>

      <div className="mt-8 inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-cyan-300">
        Current count: <span className="ml-2 font-semibold text-white">{count}</span>
      </div>
    </section>
  )
}

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

function ChatPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [draft, setDraft] = useState('')
  const [messagesByChannel, setMessagesByChannel] = useState(initialMessages)

  const activeChannel = channels.find((channel) => channel.id === id)

  if (!activeChannel) {
    return <Navigate to="/chat/general" replace />
  }

  const activeMessages = messagesByChannel[activeChannel.id] ?? []

  const submitMessage = (event) => {
    event.preventDefault()
    const text = draft.trim()

    if (!text) {
      return
    }

    const now = new Date()
    const message = {
      id: `${activeChannel.id}-${now.getTime()}`,
      author: 'You',
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text,
    }

    setMessagesByChannel((previous) => ({
      ...previous,
      [activeChannel.id]: [message, ...(previous[activeChannel.id] ?? [])],
    }))
    setDraft('')
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 shadow-2xl shadow-slate-950/50">
      <div className="grid min-h-[70vh] grid-cols-1 md:grid-cols-[280px_1fr]">
        <aside className="border-b border-slate-800 bg-slate-950/70 p-4 md:border-b-0 md:border-r">
          <p className="px-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Channels
          </p>
          <div className="mt-4 space-y-2">
            {channels.map((channel) => {
              const isActive = channel.id === activeChannel.id

              return (
                <button
                  key={channel.id}
                  type="button"
                  onClick={() => navigate(`/chat/${channel.id}`)}
                  className={`w-full rounded-xl px-3 py-3 text-left transition ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-100 ring-1 ring-cyan-400/40'
                      : 'bg-slate-900 text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <p className="text-sm font-semibold">{channel.name}</p>
                  <p className="mt-1 text-xs text-slate-400">{channel.status}</p>
                </button>
              )
            })}
          </div>
        </aside>

        <div className="flex min-h-[70vh] flex-col">
          <header className="border-b border-slate-800 px-6 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Chat Room</p>
            <h2 className="mt-1 text-2xl font-semibold text-white">{activeChannel.name}</h2>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto px-6 py-4">
            {activeMessages.map((message) => (
              <article key={message.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">{message.author}</p>
                  <p className="text-xs text-slate-400">{message.time}</p>
                </div>
                <p className="mt-2 text-sm text-slate-200">{message.text}</p>
              </article>
            ))}
          </div>

          <form onSubmit={submitMessage} className="border-t border-slate-800 p-4">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={`Message #${activeChannel.id}`}
                className="h-11 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none transition focus:border-cyan-400"
              />
              <button
                type="submit"
                className="h-11 rounded-xl bg-cyan-500 px-5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
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
            <Link to="/" className="text-sm text-slate-300 transition hover:text-white">
              Home
            </Link>
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
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/chat" element={<Navigate to="/chat/general" replace />} />
          <Route path="/chat/:id" element={<ChatPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
