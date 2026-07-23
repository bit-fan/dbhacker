import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  addAutoResponse,
  addMessage,
  clearLatestTicketChannel,
  selectChannels,
  selectLatestTicketChannelId,
  selectMessagesByChannel,
} from '../../features/chat/chatSlice'
import MessageCards from '../../components/chatCards/MessageCards'

function ChatPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [draft, setDraft] = useState('')
  const messagesEndRef = useRef(null)

  const channels = useSelector(selectChannels)
  const messagesByChannel = useSelector(selectMessagesByChannel)
  const latestTicketChannelId = useSelector(selectLatestTicketChannelId)

  const activeChannel = channels.find((channel) => channel.id === id)

  if (!activeChannel) {
    return <Navigate to="/chat/general" replace />
  }

  const activeMessages = messagesByChannel[activeChannel.id] ?? []

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [activeChannel.id, activeMessages.length])

  useEffect(() => {
    if (!latestTicketChannelId) {
      return
    }

    if (latestTicketChannelId === activeChannel.id) {
      dispatch(clearLatestTicketChannel())
      return
    }

    navigate(`/chat/${latestTicketChannelId}`)
    dispatch(clearLatestTicketChannel())
  }, [activeChannel.id, dispatch, latestTicketChannelId, navigate])

  const submitMessage = (event) => {
    event.preventDefault()
    const text = draft.trim()

    if (!text) {
      return
    }

    dispatch(addMessage({ channelId: activeChannel.id, text }))
    dispatch(addAutoResponse({ channelId: activeChannel.id, userText: text }))
    setDraft('')
  }

  return (
    <section className="h-full min-h-0 w-full overflow-hidden rounded-md border border-blue-500/35 bg-[#001a36]/90 shadow-[0_20px_50px_rgba(0,15,40,0.45)]">
      <div className="grid h-full min-h-0 grid-cols-1 md:grid-cols-[280px_1fr]">
        <aside className="overflow-y-auto border-b border-blue-500/25 bg-[#00152d]/85 p-4 md:border-b-0 md:border-r">
          <p className="px-2 text-xs font-semibold uppercase tracking-[0.22em] text-blue-300">
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
                      ? 'bg-blue-500/25 text-blue-50 ring-1 ring-blue-300/50'
                      : 'bg-[#001a35] text-blue-100/85 hover:bg-[#002247]'
                  }`}
                >
                  <p className="text-sm font-semibold">{channel.name}</p>
                  <p className="mt-1 text-xs text-blue-200/60">{channel.status}</p>
                </button>
              )
            })}
          </div>
        </aside>

        <div className="flex min-h-0 flex-col overflow-hidden">
          <header className="sticky top-0 z-10 border-b border-blue-500/25 bg-[#001a35]/95 px-6 py-4 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.22em] text-blue-300/85">Chat</p>
            <h2 className="mt-1 text-2xl font-semibold text-blue-50">{activeChannel.name}</h2>
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
                      <p className="mb-1 text-xs text-blue-200/55">
                        {message.time}
                      </p>
                      <div
                        className={`max-w-full rounded-2xl px-4 py-3 text-sm ${
                          isSelf
                            ? 'rounded-tr-sm bg-blue-500 text-white'
                            : 'rounded-tl-sm border border-blue-500/25 bg-[#001c39] text-blue-50'
                        }`}
                      >
                        <MessageCards parts={message.parts} />
                      </div>
                    </div>
                  </article>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <form onSubmit={submitMessage} className="sticky bottom-0 z-10 border-t border-blue-500/25 bg-[#001a35]/95 p-4 backdrop-blur">
            <div className="flex items-end gap-3">
              <input
                type="text"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={`Message #${activeChannel.id}`}
                className="h-11 flex-1 rounded-md border border-blue-500/35 bg-[#001124] px-4 text-sm text-blue-50 outline-none transition focus:border-blue-300"
              />
              <button
                type="submit"
                className="h-11 shrink-0 rounded-md border border-blue-300/70 bg-blue-500 px-5 text-sm font-semibold text-white transition hover:bg-blue-400"
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
