import { createSlice } from '@reduxjs/toolkit'
import channelData from '../../data/channel.json'
import chatRespData from '../../data/chatresp.json'

const channels = channelData.channels ?? []

const seedMessagesByChannel = chatRespData.seedMessagesByChannel ?? {}
const responseRules = chatRespData.responseRules ?? []
const defaultResponse = chatRespData.defaultResponse ?? null

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

const buildResponseMessage = (channelId, userText) => {
  const normalizedText = normalizeText(userText)
  const sortedRules = [...responseRules].sort(
    (a, b) => (b.priority ?? 0) - (a.priority ?? 0),
  )
  const matchedRule = sortedRules.find((rule) => ruleMatches(rule, normalizedText))
  const selected = matchedRule ? toRuleResponse(matchedRule) : defaultResponse

  if (!selected) {
    return null
  }

  return {
    id: `${channelId}-resp-${Date.now()}`,
    author: selected.author || 'Bot',
    sender: 'other',
    time: getNowTime(),
    parts: selected.parts ?? [{ type: 'text', text: 'Received.' }],
  }
}

const initialState = {
  channels,
  messagesByChannel: seedMessagesByChannel,
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: {
      reducer(state, action) {
        const { channelId, message } = action.payload

        if (!state.messagesByChannel[channelId]) {
          state.messagesByChannel[channelId] = []
        }

        state.messagesByChannel[channelId].push(message)
      },
      prepare({ channelId, text }) {
        const now = new Date()

        return {
          payload: {
            channelId,
            message: {
              id: `${channelId}-${now.getTime()}`,
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
        const { channelId, message } = action.payload

        if (!message) {
          return
        }

        if (!state.messagesByChannel[channelId]) {
          state.messagesByChannel[channelId] = []
        }

        state.messagesByChannel[channelId].push(message)
      },
      prepare({ channelId, userText }) {
        return {
          payload: {
            channelId,
            message: buildResponseMessage(channelId, userText),
          },
        }
      },
    },
  },
})

export const { addMessage, addAutoResponse } = chatSlice.actions

export const selectChannels = (state) => state.chat.channels
export const selectMessagesByChannel = (state) => state.chat.messagesByChannel

export default chatSlice.reducer
