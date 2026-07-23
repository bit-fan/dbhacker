import { createSlice } from '@reduxjs/toolkit'
import channelData from '../../data/channel.json'
import chatRespData from '../../data/chatresp.json'

const channels = channelData.channels ?? []

const seedMessagesByChannel = chatRespData.seedMessagesByChannel ?? {}
const responseRules = chatRespData.responseRules ?? []
const defaultResponse = chatRespData.defaultResponse ?? null
const issueBot = chatRespData.issueBot ?? {}

const TICKETS_CHANNEL_ID = 'tickets'

const getNowTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

const normalizeText = (value) => String(value ?? '').toLowerCase().trim()

const termsMatch = (mode, normalizedText, terms) => {
  const normalizedTerms = (terms ?? []).map((term) => normalizeText(term)).filter(Boolean)

  if (normalizedTerms.length === 0) {
    return false
  }

  if (mode === 'all') {
    return normalizedTerms.every((term) => normalizedText.includes(term))
  }

  if (mode === 'exact') {
    return normalizedTerms.some((term) => normalizedText === term)
  }

  if (mode === 'startsWith') {
    return normalizedTerms.some((term) => normalizedText.startsWith(term))
  }

  return normalizedTerms.some((term) => normalizedText.includes(term))
}

const ruleMatches = (rule, normalizedText) => {
  const match = rule.match ?? {}
  const mode = match.mode ?? 'any'

  if (mode === 'regex') {
    if (!match.pattern) {
      return false
    }

    try {
      const flags = match.flags ?? 'i'
      return new RegExp(match.pattern, flags).test(normalizedText)
    } catch {
      return false
    }
  }

  const terms = match.terms ?? rule.keywords ?? []
  return termsMatch(mode, normalizedText, terms)
}

const toRuleResponse = (rule) => {
  if (rule.response) {
    return rule.response
  }

  return {
    author: rule.author,
    parts: rule.parts,
  }
}

const statusLabel = {
  open: 'Open',
  triage: 'Triage',
  'in-progress': 'In progress',
  resolved: 'Resolved',
}

const commandToStatus = {
  reopen: 'open',
  triage: 'triage',
  start: 'in-progress',
  progress: 'in-progress',
  resolve: 'resolved',
  close: 'resolved',
}

const issueKeywords = [
  'issue',
  'problem',
  'error',
  'bug',
  'cannot',
  "can't",
  'fail',
  'failed',
  'stuck',
  'broken',
]

const hasIssueSignal = (text) => issueKeywords.some((keyword) => text.includes(keyword))

const nextTicketNumber = (tickets) => String((tickets?.length ?? 0) + 1).padStart(4, '0')

const createOtherMessage = ({ id, author, parts }) => ({
  id,
  author,
  sender: 'other',
  time: getNowTime(),
  parts,
})

const createDefaultResponseMessage = (channelId) => {
  if (!defaultResponse) {
    return null
  }

  return {
    id: `${channelId}-default-${Date.now()}`,
    author: defaultResponse.author || 'Bot',
    sender: 'other',
    time: getNowTime(),
    parts: defaultResponse.parts ?? [{ type: 'text', text: 'Received.' }],
  }
}

const buildRuleResponseMessage = (channelId, userText) => {
  const normalizedText = normalizeText(userText)
  const sortedRules = [...responseRules].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
  const matchedRule = sortedRules.find((rule) => ruleMatches(rule, normalizedText))

  if (!matchedRule) {
    return null
  }

  const selected = toRuleResponse(matchedRule)

  return {
    id: `${channelId}-resp-${Date.now()}`,
    author: selected.author || 'Bot',
    sender: 'other',
    time: getNowTime(),
    parts: selected.parts ?? [{ type: 'text', text: 'Received.' }],
  }
}

const ensureTicketListChannel = (state) => {
  const hasChannel = state.channels.some((channel) => channel.id === TICKETS_CHANNEL_ID)
  if (!hasChannel) {
    state.channels.push({ id: TICKETS_CHANNEL_ID, name: 'Tickets', status: 'Tracker' })
  }

  if (!state.messagesByChannel[TICKETS_CHANNEL_ID]) {
    state.messagesByChannel[TICKETS_CHANNEL_ID] = []
  }
}

const refreshTicketBoardMessage = (state) => {
  ensureTicketListChannel(state)

  const boardMessage = createOtherMessage({
    id: `${TICKETS_CHANNEL_ID}-board`,
    author: issueBot.author || 'AIDA Bot',
    parts: [
      {
        type: 'text',
        text: 'Ticket board. Commands: triage ticket TCK-0001, start ticket TCK-0001, resolve ticket TCK-0001, reopen ticket TCK-0001.',
      },
      {
        type: 'ticketList',
        tickets: state.tickets.map((ticket) => ({
          id: ticket.id,
          status: statusLabel[ticket.status] || ticket.status,
          summary: ticket.summary,
          channelId: ticket.channelId,
        })),
      },
    ],
  })

  const list = state.messagesByChannel[TICKETS_CHANNEL_ID]
  const existingIndex = list.findIndex((message) => message.id === `${TICKETS_CHANNEL_ID}-board`)

  if (existingIndex >= 0) {
    list[existingIndex] = boardMessage
  } else {
    list.unshift(boardMessage)
  }
}

const startIssueIntake = (state, channelId, problemStatement) => {
  const questions = issueBot.questions ?? []

  if (questions.length === 0) {
    return
  }

  state.intakeByChannel[channelId] = {
    active: true,
    ticketId: `${issueBot.ticketPrefix || 'TCK'}-${nextTicketNumber(state.tickets)}`,
    problemStatement,
    currentQuestionIndex: 0,
    answers: {},
  }

  const intro = issueBot.intakeIntro || 'I need more details before creating a ticket.'
  const firstQuestion = questions[0]?.question
  const introText = firstQuestion ? `${intro} ${firstQuestion}` : intro

  state.messagesByChannel[channelId].push(
    createOtherMessage({
      id: `${channelId}-intake-intro-${Date.now()}`,
      author: issueBot.author || 'AIDA Bot',
      parts: [{ type: 'text', text: introText }],
    }),
  )
}

const closeIntakeAndCreateTicket = (state, channelId, flow) => {
  const safeBaseName = flow.problemStatement
    .split(' ')
    .slice(0, 4)
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  const channelSlug = safeBaseName || `case-${state.tickets.length}`
  const ticketChannelId = `${issueBot.ticketChannelPrefix || 'ticket'}-${flow.ticketId.toLowerCase()}-${channelSlug}`

  const ticket = {
    id: flow.ticketId,
    sourceChannelId: channelId,
    channelId: ticketChannelId,
    summary: flow.problemStatement,
    answers: flow.answers,
    status: 'open',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  state.tickets.push(ticket)

  const newChannel = {
    id: ticketChannelId,
    name: `Ticket ${flow.ticketId}`,
    status: statusLabel.open,
  }

  const exists = state.channels.some((channel) => channel.id === newChannel.id)
  if (!exists) {
    state.channels.push(newChannel)
  }

  state.messagesByChannel[ticketChannelId] = [
    createOtherMessage({
      id: `${ticketChannelId}-summary-${Date.now()}`,
      author: issueBot.author || 'AIDA Bot',
      parts: [
        {
          type: 'text',
          text: `Ticket ${flow.ticketId} created for: ${flow.problemStatement}`,
        },
        {
          type: 'table',
          columns: ['Field', 'Value'],
          rows: [
            ['Impact', flow.answers.impact || '-'],
            ['Environment', flow.answers.environment || '-'],
            ['Frequency', flow.answers.frequency || '-'],
            ['Attempted Fix', flow.answers.attemptedFix || '-'],
            ['Status', statusLabel.open],
          ],
        },
      ],
    }),
  ]

  state.messagesByChannel[channelId].push(
    createOtherMessage({
      id: `${channelId}-intake-done-${Date.now()}`,
      author: issueBot.author || 'AIDA Bot',
      parts: [
        {
          type: 'text',
          text: `I have all required details. Ticket ${flow.ticketId} is created. Please continue in #${ticketChannelId}.`,
        },
      ],
    }),
  )

  state.latestTicketChannelId = ticketChannelId
  refreshTicketBoardMessage(state)
  flow.active = false
}

const handleIntakeAnswer = (state, channelId, userText) => {
  const flow = state.intakeByChannel[channelId]

  if (!flow?.active) {
    return false
  }

  const questions = issueBot.questions ?? []
  const currentQuestion = questions[flow.currentQuestionIndex]

  if (!currentQuestion) {
    flow.active = false
    return false
  }

  flow.answers[currentQuestion.key] = userText
  flow.currentQuestionIndex += 1

  if (flow.currentQuestionIndex < questions.length) {
    const nextQuestion = questions[flow.currentQuestionIndex]
    state.messagesByChannel[channelId].push(
      createOtherMessage({
        id: `${channelId}-intake-q-${Date.now()}`,
        author: issueBot.author || 'AIDA Bot',
        parts: [{ type: 'text', text: nextQuestion.question }],
      }),
    )
    return true
  }

  closeIntakeAndCreateTicket(state, channelId, flow)
  return true
}

const tryApplyTicketCommand = (state, channelId, userText) => {
  const normalized = normalizeText(userText)
  const match = normalized.match(/^(reopen|triage|start|progress|resolve|close)\s+ticket\s+([a-z0-9-]+)$/i)

  if (!match) {
    return false
  }

  const command = match[1].toLowerCase()
  const requestedId = match[2].toUpperCase()
  const nextStatus = commandToStatus[command]

  const ticket = state.tickets.find((item) => item.id.toUpperCase() === requestedId)

  if (!ticket) {
    state.messagesByChannel[channelId].push(
      createOtherMessage({
        id: `${channelId}-ticket-not-found-${Date.now()}`,
        author: issueBot.author || 'AIDA Bot',
        parts: [{ type: 'text', text: `Ticket ${requestedId} was not found.` }],
      }),
    )
    return true
  }

  ticket.status = nextStatus
  ticket.updatedAt = Date.now()

  const ticketChannel = state.channels.find((channel) => channel.id === ticket.channelId)
  if (ticketChannel) {
    ticketChannel.status = statusLabel[nextStatus] || nextStatus
  }

  state.messagesByChannel[channelId].push(
    createOtherMessage({
      id: `${channelId}-ticket-status-${Date.now()}`,
      author: issueBot.author || 'AIDA Bot',
      parts: [
        {
          type: 'text',
          text: `Ticket ${ticket.id} moved to ${statusLabel[nextStatus] || nextStatus}.`,
        },
      ],
    }),
  )

  refreshTicketBoardMessage(state)
  return true
}

const buildInitialState = () => {
  const initial = {
    channels: [...channels],
    messagesByChannel: JSON.parse(JSON.stringify(seedMessagesByChannel)),
    intakeByChannel: {},
    tickets: [],
    latestTicketChannelId: null,
  }

  ensureTicketListChannel(initial)
  refreshTicketBoardMessage(initial)

  return initial
}

const initialState = buildInitialState()

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearLatestTicketChannel(state) {
      state.latestTicketChannelId = null
    },
    addMessage: {
      reducer(state, action) {
        const { channelId, message } = action.payload

        if (!state.messagesByChannel[channelId]) {
          state.messagesByChannel[channelId] = []
        }

        state.messagesByChannel[channelId].push(message)
      },
      prepare({ channelId, text }) {
        return {
          payload: {
            channelId,
            message: {
              id: `${channelId}-${Date.now()}`,
              author: 'You',
              sender: 'self',
              time: getNowTime(),
              parts: [
                {
                  type: 'text',
                  text,
                },
              ],
            },
          },
        }
      },
    },
    addAutoResponse: {
      reducer(state, action) {
        const { channelId, ruleMessage, userText } = action.payload

        if (!state.messagesByChannel[channelId]) {
          state.messagesByChannel[channelId] = []
        }

        ensureTicketListChannel(state)

        if (tryApplyTicketCommand(state, channelId, userText)) {
          return
        }

        if (handleIntakeAnswer(state, channelId, userText)) {
          return
        }

        if (ruleMessage) {
          state.messagesByChannel[channelId].push(ruleMessage)
          return
        }

        const normalizedText = normalizeText(userText)

        if (hasIssueSignal(normalizedText)) {
          startIssueIntake(state, channelId, userText)
          return
        }

        const fallback = createDefaultResponseMessage(channelId)
        if (fallback) {
          state.messagesByChannel[channelId].push(fallback)
        }
      },
      prepare({ channelId, userText }) {
        return {
          payload: {
            channelId,
            userText,
            ruleMessage: buildRuleResponseMessage(channelId, userText),
          },
        }
      },
    },
  },
})

export const { clearLatestTicketChannel, addMessage, addAutoResponse } = chatSlice.actions

export const selectChannels = (state) => state.chat.channels
export const selectMessagesByChannel = (state) => state.chat.messagesByChannel
export const selectLatestTicketChannelId = (state) => state.chat.latestTicketChannelId

export default chatSlice.reducer
