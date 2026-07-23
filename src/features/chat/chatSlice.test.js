import chatReducer, {
  addAutoResponse,
  addMessage,
} from './chatSlice'

const reduce = (state, action) => chatReducer(state, action)

describe('chatSlice bot workflow', () => {
  it('responds with a direct rule-based response for basic message', () => {
    let state = reduce(undefined, { type: '@@INIT' })

    state = reduce(state, addMessage({ channelId: 'general', text: 'show dashboard status' }))
    state = reduce(state, addAutoResponse({ channelId: 'general', userText: 'show dashboard status' }))

    const messages = state.messagesByChannel.general
    const last = messages[messages.length - 1]

    expect(last.sender).toBe('other')
    expect(last.author).toBe('Leo')
    expect(last.parts[0].type).toBe('text')
    expect(last.parts[1].type).toBe('table')
  })

  it('runs issue intake and creates ticket + new channel after all answers', () => {
    let state = reduce(undefined, { type: '@@INIT' })

    state = reduce(state, addMessage({ channelId: 'general', text: 'I have an issue, login fails' }))
    state = reduce(state, addAutoResponse({ channelId: 'general', userText: 'I have an issue, login fails' }))

    expect(state.intakeByChannel.general.active).toBe(true)

    state = reduce(state, addAutoResponse({ channelId: 'general', userText: 'All users, sev-1' }))
    state = reduce(state, addAutoResponse({ channelId: 'general', userText: 'prod' }))
    state = reduce(state, addAutoResponse({ channelId: 'general', userText: 'since this morning, every time' }))
    state = reduce(state, addAutoResponse({ channelId: 'general', userText: 'cleared cache and retried' }))

    expect(state.tickets).toHaveLength(1)

    const ticket = state.tickets[0]
    expect(ticket.id).toBe('TCK-0001')
    expect(ticket.status).toBe('open')
    expect(ticket.channelId).toContain('ticket-tck-0001')

    expect(state.channels.some((channel) => channel.id === ticket.channelId)).toBe(true)
    expect(state.messagesByChannel[ticket.channelId]).toBeDefined()
    expect(state.latestTicketChannelId).toBe(ticket.channelId)
  })

  it('updates ticket status via command and refreshes ticket board list', () => {
    let state = reduce(undefined, { type: '@@INIT' })

    state = reduce(state, addAutoResponse({ channelId: 'general', userText: 'critical issue in prod' }))
    state = reduce(state, addAutoResponse({ channelId: 'general', userText: 'all users' }))
    state = reduce(state, addAutoResponse({ channelId: 'general', userText: 'prod' }))
    state = reduce(state, addAutoResponse({ channelId: 'general', userText: 'always since 9am' }))
    state = reduce(state, addAutoResponse({ channelId: 'general', userText: 'restarted app' }))

    state = reduce(state, addAutoResponse({ channelId: 'tickets', userText: 'resolve ticket TCK-0001' }))

    const ticket = state.tickets.find((item) => item.id === 'TCK-0001')
    expect(ticket.status).toBe('resolved')

    const board = state.messagesByChannel.tickets.find((message) => message.id === 'tickets-board')
    const ticketListPart = board.parts.find((part) => part.type === 'ticketList')
    expect(ticketListPart.tickets[0].status).toBe('Resolved')
  })
})
