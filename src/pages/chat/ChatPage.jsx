import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  addMessage,
  selectChannels,
  selectMessagesByChannel,
} from '../../features/chat/chatSlice'
import MessageCards from '../../components/chatCards/MessageCards'

function ChatPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [draft, setDraft] = useState('')

  const channels = useSelector(selectChannels)
  const messagesByChannel = useSelector(selectMessagesByChannel)

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

    dispatch(addMessage({ channelId: activeChannel.id, text }))
    setDraft('')
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-700 bg-slate-900/70 shadow-2xl shadow-slate-950/50">
      <div className="grid min-h-[70vh] grid-cols-1 md:grid-cols-[280px_1fr]">
        <aside className="border-b border-slate-800 bg-slate-950/70 p-4 md:border-b-0 md:border-r">
          <p className="px-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
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
                      ? 'bg-cyan-500/20 text-cyan-100 ring-1 ring-cyan-300/40'
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
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Chat</p>
            <h2 className="mt-1 text-2xl font-semibold text-white">{activeChannel.name}</h2>
          </header>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-4">
              {activeMessages.map((message) => {
                const isSelf = message.sender === 'self'

                return (
                  <article
                    key={message.id}
                    className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] ${isSelf ? 'items-end' : 'items-start'} flex flex-col`}>
                      <p className="mb-1 text-xs text-slate-400">
                        {message.time}
                      </p>
                      <div
                        className={`max-w-full rounded-2xl px-4 py-3 text-sm ${
                          isSelf
                            ? 'rounded-tr-sm bg-cyan-500 text-slate-950'
                            : 'rounded-tl-sm bg-slate-800 text-slate-100'
                        }`}
                      >
                        <MessageCards parts={message.parts} />
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
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

export default ChatPage
