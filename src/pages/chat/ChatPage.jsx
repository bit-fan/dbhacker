import { useEffect, useMemo, useRef, useState } from 'react'
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

const statusWeight = {
  Open: 0,
  Triage: 1,
  'In progress': 2,
  Blocked: 3,
  Resolved: 4,
}

const shuffled = (items) => {
  const copy = [...items]

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = copy[i]
    copy[i] = copy[j]
    copy[j] = temp
  }

  return copy
}

function ChatPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [draft, setDraft] = useState('')
  const messagesEndRef = useRef(null)

  const channels = useSelector(selectChannels)
  const [mockOrderByChannelId, setMockOrderByChannelId] = useState({})
  const messagesByChannel = useSelector(selectMessagesByChannel)
  const latestTicketChannelId = useSelector(selectLatestTicketChannelId)

  const activeChannel = channels.find((channel) => channel.id === id)

  if (!activeChannel) {
    return <Navigate to="/chat/general" replace />
  }

  const activeMessages = messagesByChannel[activeChannel.id] ?? []

  useEffect(() => {
    const ticketIds = channels
      .filter((channel) => channel.id !== 'general' && channel.id !== 'tickets')
      .map((channel) => channel.id)

    if (ticketIds.length === 0) {
      setMockOrderByChannelId({})
      return
    }

    const randomizedIds = shuffled(ticketIds)
    const nextOrder = {}
    randomizedIds.forEach((ticketId, index) => {
      nextOrder[ticketId] = index
    })

    setMockOrderByChannelId(nextOrder)
  }, [channels])

  const sortedChannels = useMemo(() => {
    if (!channels?.length) {
      return channels
    }

    const justinChannel = channels.find((channel) => channel.id === 'general')
    const ticketBoardChannel = channels.find((channel) => channel.id === 'tickets')

    const ticketChannels = channels.filter(
      (channel) => channel.id !== 'general' && channel.id !== 'tickets',
    )

    const sortedTickets = [...ticketChannels].sort((a, b) => {
      const mockDiff =
        (mockOrderByChannelId[a.id] ?? Number.MAX_SAFE_INTEGER)
        - (mockOrderByChannelId[b.id] ?? Number.MAX_SAFE_INTEGER)

      if (mockDiff !== 0) {
        return mockDiff
      }

      const statusDiff = (statusWeight[a.status] ?? 99) - (statusWeight[b.status] ?? 99)
      if (statusDiff !== 0) {
        return statusDiff
      }

      const updatedDiff = (b.updatedAt || 0) - (a.updatedAt || 0)
      if (updatedDiff !== 0) {
        return updatedDiff
      }

      return (a.name || '').localeCompare(b.name || '')
    })

    const ordered = []
    if (justinChannel) {
      ordered.push(justinChannel)
    }
    if (ticketBoardChannel) {
      ordered.push(ticketBoardChannel)
    }
    ordered.push(...sortedTickets)
    return ordered
  }, [channels, mockOrderByChannelId])

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

  useEffect(() => {
    const reorderChannels = () => {
      setMockOrderByChannelId((current) => {
        const ticketIds = Object.keys(current)
        if (ticketIds.length <= 1) {
          return current
        }

        const randomizedIds = shuffled(ticketIds)
        const nextOrder = {}
        randomizedIds.forEach((ticketId, index) => {
          nextOrder[ticketId] = index
        })

        return nextOrder
      })
    }

    const jitteredInterval = () => Math.floor(Math.random() * 2000) + 3000
    let timeoutId

    const scheduleNext = () => {
      timeoutId = window.setTimeout(() => {
        reorderChannels()
        scheduleNext()
      }, jitteredInterval())
    }

    scheduleNext()

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [])

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
    <section className="h-full min-h-0 w-full overflow-hidden rounded-sm border border-blue-500/35 bg-[#001a36]/90 shadow-[0_20px_50px_rgba(0,15,40,0.45)]">
      <div className="grid h-full min-h-0 grid-cols-1 md:grid-cols-[280px_1fr]">
        <aside className="overflow-y-auto border-b border-blue-500/25 bg-[#00152d]/85 p-3 md:border-b-0 md:border-r">
          <div className="space-y-1.5">
            {sortedChannels.map((channel) => {
              const isActive = channel.id === activeChannel.id

              return (
                <button
                  key={channel.id}
                  type="button"
                  onClick={() => navigate(`/chat/${channel.id}`)}
                  className={`w-full rounded-md px-3 py-2.5 text-left transition-all duration-500 ease-out ${
                    isActive
                      ? 'bg-blue-500/25 text-blue-50 ring-1 ring-blue-300/50'
                      : 'bg-[#001a35] text-blue-100/85 hover:bg-[#002247]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{channel.name}</p>
                    <div className="flex shrink-0 items-center gap-1 text-sm">
                      {channel.statusIcon ? <span className="text-blue-200/90">{channel.statusIcon}</span> : null}
                      {channel.severityIcon ? <span className="text-amber-300">{channel.severityIcon}</span> : null}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </aside>

        <div className="flex min-h-0 flex-col overflow-hidden">
          <header className="sticky top-0 z-10 border-b border-blue-500/25 bg-[#001a35]/95 px-4 py-3 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.22em] text-blue-300/85">Chat</p>
            <div className="mt-0.5 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-blue-50">{activeChannel.name}</h2>
              <div className="flex items-center gap-2 text-xs font-medium text-blue-100/90">
                {activeChannel.statusIcon ? (
                  <span className="rounded-sm border border-blue-400/30 bg-[#00244a] px-2 py-1">
                    {activeChannel.statusIcon} {activeChannel.status || 'Status'}
                  </span>
                ) : null}
                {activeChannel.severityIcon ? (
                  <span className="rounded-sm border border-amber-400/35 bg-[#2a2208] px-2 py-1 text-amber-200">
                    {activeChannel.severityIcon} {activeChannel.severity || 'Severity'}
                  </span>
                ) : null}
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-3">
            <div className="space-y-3">
              {activeMessages.map((message) => {
                const isSelf = message.sender === 'self'

                return (
                  <article
                    key={message.id}
                    className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] ${isSelf ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div className={`mb-1 flex items-center gap-2 text-xs text-blue-200/60 ${isSelf ? 'justify-end' : 'justify-start'}`}>
                        <span className="font-semibold text-blue-100/90">{message.author || (isSelf ? 'You' : 'Bot')}</span>
                        <span className="text-blue-200/55">{message.time}</span>
                      </div>
                      <div
                        className={`max-w-full rounded-lg px-3.5 py-2.5 text-sm ${
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

          <form onSubmit={submitMessage} className="sticky bottom-0 z-10 border-t border-blue-500/25 bg-[#001a35]/95 p-3 backdrop-blur">
            <div className="flex items-end gap-2">
              <input
                type="text"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={`Message #${activeChannel.id}`}
                className="h-10 flex-1 rounded-sm border border-blue-500/35 bg-[#001124] px-3 text-sm text-blue-50 outline-none transition focus:border-blue-300"
              />
              <button
                type="submit"
                className="h-10 shrink-0 rounded-sm border border-blue-300/70 bg-blue-500 px-4 text-sm font-semibold text-white transition hover:bg-blue-400"
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
