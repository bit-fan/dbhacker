import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  addAutoResponse,
  addBotReply,
  addMessage,
  clearLatestTicketChannel,
  selectChannels,
  selectLatestTicketChannelId,
  selectMessagesByChannel,
} from '../../features/chat/chatSlice'
import MessageCards from '../../components/chatCards/MessageCards'

const BOT_STATUS_LABELS = ['Generating', 'Thinking', 'Working']

const BotStatusBar = () => {
  const [labelIdx, setLabelIdx] = useState(0)
  const [dots, setDots] = useState(2)

  useEffect(() => {
    const id = setInterval(() => setDots((d) => (d >= 6 ? 1 : d + 1)), 400)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const id = setInterval(
      () => setLabelIdx((i) => (i + 1) % BOT_STATUS_LABELS.length),
      2500,
    )
    return () => clearInterval(id)
  }, [])

  return (
    <article className="flex justify-start">
      <div className="flex max-w-[85%] flex-col items-start">
        <div className="mb-1 flex items-center gap-2 text-sm">
          <span className="text-base leading-none">👱</span>
          <span className="font-semibold text-blue-100/95">Justin.ai</span>
        </div>
        <div className="rounded-lg rounded-tl-sm border border-blue-500/25 bg-[#001c39] px-3.5 py-2.5 text-sm">
          <span className="italic text-blue-200/60">
            {BOT_STATUS_LABELS[labelIdx]}{'·'.repeat(dots)}
          </span>
        </div>
      </div>
    </article>
  )
}

const SignalIcon = ({ icon }) => {
  if (!icon) {
    return null
  }

  if (icon === 'fire') {
    return (
      <span
        className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-amber-500/20 px-1 text-base leading-none shadow-[0_0_14px_rgba(251,146,60,0.6)] animate-pulse"
        title="Highest priority"
      >
        🔥
      </span>
    )
  }

  return <span className="text-sm leading-none">{icon}</span>
}

const getUserIcon = (author, isSelf) => {
  if (isSelf) {
    return '🙂'
  }

  const normalized = String(author ?? '').toLowerCase()
  if (normalized === 'justin.ai' || normalized === 'justin') {
    return '👱'
  }

  return '👤'
}

function ChatPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [draft, setDraft] = useState('')
  const [botStatus, setBotStatus] = useState(null) // set to true to show Justin typing indicator
  const messagesEndRef = useRef(null)
  const justinStepRef = useRef(0)

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
  }, [activeChannel.id, activeMessages.length, botStatus])

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

  const JUSTIN_TICKET_TEXT_PRE =
    'You got it, Ivan! \uD83D\uDD34 Here is the fresh emergency that just landed on our radar:\n\n' +
    '\uD83D\uDEA8 Ticket #4092: Checkout Gateway Timeout (504 Error)\n\n' +
    'Severity: Critical \uD83D\uDD34\n\n' +
    'Impact: Customers cannot complete purchases using credit cards.\n\n' +
    'Reported: 15 minutes ago by Automated Monitoring.\n\n' +
    'Current Status: \uD83D\uDCE5 Unassigned (Needs eyes ASAP!).'

  const JUSTIN_TICKET_TEXT_POST =
    'Would you like to assign this to yourself to start debugging, or should we page the on-call engineer right away? \uD83D\uDEE0\uFE0F'

  const JUSTIN_ASSIGNED_TEXT =
    "I\u2019ve officially assigned Ticket #4092 to you, and I\u2019m locked in as your co-pilot. \uD83E\uDD1D\n\n" +
    '\uD83D\uDD0D Here is what I dug up while you were looking:\n\n' +
    'The Culprit: The payment-gateway-router is throwing a 504 Gateway Timeout every time the payload exceeds 1.2MB.\n\n' +
    'Recent Changes: A minor deployment went out at 6:45 AM this morning affecting the checkout validation logic.\n\n' +
    '\uD83D\uDE80 Where should we start?\n\n' +
    'Check the logs: Pull the last 5 minutes of server logs for the payment microservice.\n\n' +
    'Rollback: Revert that 6:45 AM deployment immediately to clear the pipeline.\n\n' +
    'Trace the code: Look at the exact error line in the validation script.'

  const JUSTIN_LORRA_TEXT =
    'Oh, fantastic news! \uD83C\uDF1F I just scanned our agent registry and found Lorra.ai, our dedicated Payment Vendor Integration Specialist! ' +
    'She is currently online, fully available, and ready to roll! \uD83D\uDE80\n\n' +
    'Should I loop her into this thread right now so she can help us untangle this connection handshake? \uD83E\uDD1D\u2728'

  const submitMessage = (event) => {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return

    dispatch(addMessage({ channelId: activeChannel.id, text }))
    setDraft('')

    if (activeChannel.id === 'general') {
      setBotStatus(true)
      const step = justinStepRef.current
      justinStepRef.current += 1

      if (step === 0) {
        setTimeout(() => {
          dispatch(
            addBotReply({
              channelId: 'general',
              parts: [
                {
                  type: 'image',
                  src: 'issue1.jpeg',
                  alt: 'Justin report',
                  caption: 'Here\u2019s a quick snapshot \u2014 full report loading now.',
                },
              ],
            }),
          )
          setBotStatus(null)
        }, 2000)
      } else if (step === 1) {
        setTimeout(() => {
          dispatch(
            addBotReply({
              channelId: 'general',
              parts: [
                { type: 'text', text: JUSTIN_TICKET_TEXT_PRE + '\n\n' + JUSTIN_TICKET_TEXT_POST },
              ],
            }),
          )
          setBotStatus(null)
        }, 2000)
      } else if (step === 2) {
        setTimeout(() => {
          dispatch(
            addBotReply({
              channelId: 'general',
              parts: [{ type: 'text', text: JUSTIN_ASSIGNED_TEXT }],
            }),
          )
          setBotStatus(null)
        }, 2000)
      } else if (step === 3) {
        setTimeout(() => {
          dispatch(
            addBotReply({
              channelId: 'general',
              parts: [{ type: 'text', text: JUSTIN_LORRA_TEXT }],
            }),
          )
          setBotStatus(null)
        }, 2000)
      } else if (step === 4) {
        setTimeout(() => {
          setBotStatus(null)
          const ticket002 = channels.find((ch) => ch.id.startsWith('ticket-002'))
          if (ticket002) {
            navigate(`/chat/${ticket002.id}`)
          }
        }, 2000)
      } else {
        setTimeout(() => {
          dispatch(addAutoResponse({ channelId: 'general', userText: text }))
          setBotStatus(null)
        }, 2000)
      }
      return
    }

    dispatch(addAutoResponse({ channelId: activeChannel.id, userText: text }))
  }

  return (
    <section className="h-full min-h-0 w-full overflow-hidden rounded-sm border border-blue-500/35 bg-[#001a36]/90 shadow-[0_20px_50px_rgba(0,15,40,0.45)]">
        <div className="grid h-full min-h-0 grid-cols-1 md:grid-cols-[490px_1fr]">
        <aside className="overflow-y-auto border-b border-blue-500/25 bg-[#00152d]/85 p-3 md:border-b-0 md:border-r">
          <div className="space-y-1.5">
            {channels.map((channel) => {
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
                    <div className="flex shrink-0 items-center">
                      <SignalIcon icon={channel.signalIcon} />
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
                {activeChannel.signalIcon ? (
                  <span className="rounded-sm border border-blue-400/30 bg-[#00244a] px-2 py-1">
                    <SignalIcon icon={activeChannel.signalIcon} /> {activeChannel.status || 'Status'}
                  </span>
                ) : null}
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-3">
            <div className="space-y-3">
              {activeMessages.map((message) => {
                const isSelf = message.sender === 'self'
                const authorName = message.author || (isSelf ? 'Me' : 'Bot')
                const userIcon = getUserIcon(authorName, isSelf)

                return (
                  <article
                    key={message.id}
                    className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] ${isSelf ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div className={`mb-1 flex items-center gap-2 text-sm ${isSelf ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-base leading-none">{userIcon}</span>
                        <span className="font-semibold text-blue-100/95">{authorName}</span>
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
                      <p className="mt-1 text-xs text-blue-200/55">{message.time}</p>
                    </div>
                  </article>
                )
              })}
            </div>
            {/* botStatus: set to truthy to show Justin.ai typing indicator */}
            {botStatus && <BotStatusBar />}
            <div ref={messagesEndRef} />
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
