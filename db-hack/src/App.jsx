import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, Route, Routes } from 'react-router-dom'
import {
  decrement,
  increment,
  incrementByAmount,
} from './features/counter/counterSlice'

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
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-16">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
