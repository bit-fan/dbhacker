import { createSlice } from '@reduxjs/toolkit'

const channels = [
  { id: 'general', name: 'General', status: 'Online' },
  { id: 'design', name: 'Design', status: '2 new' },
  { id: 'engineering', name: 'Engineering', status: '5 active' },
  { id: 'product', name: 'Product', status: 'Planning' },
  { id: 'support', name: 'Support', status: 'Waiting' },
]

const initialState = {
  channels,
  messagesByChannel: {
    general: [
      {
        id: 'g-1',
        author: 'Mia',
        sender: 'other',
        time: '09:20',
        parts: [
          {
            type: 'text',
            text: 'Daily sync starts in 10 minutes. Share blockers in this thread.',
          },
        ],
      },
      {
        id: 'g-2',
        author: 'Leo',
        sender: 'other',
        time: '09:27',
        parts: [
          {
            type: 'text',
            text: 'I will post the sprint dashboard after standup.',
          },
          {
            type: 'table',
            columns: ['Metric', 'Value'],
            rows: [
              ['Open bugs', 7],
              ['Completed stories', 14],
            ],
          },
        ],
      },
    ],
    design: [
      {
        id: 'd-1',
        author: 'Ava',
        sender: 'other',
        time: '08:42',
        parts: [
          {
            type: 'text',
            text: 'Uploaded new icon set. Please review contrast before noon.',
          },
          {
            type: 'image',
            src: '/favicon.svg',
            alt: 'Design mockup',
            caption: 'Latest hero variation',
          },
        ],
      },
    ],
    engineering: [
      {
        id: 'e-1',
        author: 'Noah',
        sender: 'other',
        time: '08:58',
        parts: [
          {
            type: 'text',
            text: 'API deploy is complete. Monitoring error rate for the next hour.',
          },
          {
            type: 'chart',
            title: 'Error rate (last 5 mins)',
            series: [
              { label: '08:50', value: 0.7, color: '#2dd4bf' },
              { label: '08:55', value: 0.4, color: '#22d3ee' },
              { label: '09:00', value: 0.3, color: '#06b6d4' },
            ],
          },
        ],
      },
    ],
    product: [
      {
        id: 'p-1',
        author: 'Ella',
        sender: 'other',
        time: '09:05',
        parts: [
          {
            type: 'text',
            text: 'Roadmap review moved to Friday, 2pm.',
          },
        ],
      },
    ],
    support: [
      {
        id: 's-1',
        author: 'Ivy',
        sender: 'other',
        time: '09:11',
        parts: [
          {
            type: 'text',
            text: 'Three high-priority tickets need engineering input.',
          },
        ],
      },
    ],
  },
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
              time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
  },
})

export const { addMessage } = chatSlice.actions

export const selectChannels = (state) => state.chat.channels
export const selectMessagesByChannel = (state) => state.chat.messagesByChannel

export default chatSlice.reducer
