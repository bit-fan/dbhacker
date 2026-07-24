import chatReducer, {
  addAutoResponse,
  addMessage,
  selectChannels,
} from './chatSlice'

const reduce = (state, action) => chatReducer(state, action)

describe('chatSlice bot workflow', () => {
  it('starts with Justin plus seeded tickets and metadata icons', () => {
    const state = reduce(undefined, { type: '@@INIT' })

    const justinChannel = state.channels.find((channel) => channel.id === 'general')
    expect(justinChannel.name).toBe('Justin')

    const ticketChannels = state.channels.filter(
      (channel) => channel.id !== 'general' && channel.id !== 'tickets',
    )
    expect(ticketChannels).toHaveLength(5)
    expect(state.tickets).toHaveLength(5)

    const seededWithIcons = ticketChannels.every(
      (channel) => Boolean(channel.statusIcon) && Boolean(channel.severityIcon),
    )
    expect(seededWithIcons).toBe(true)

    const orderedChannels = selectChannels({ chat: state })
    expect(orderedChannels[0].id).toBe('general')
    expect(orderedChannels[1].id).toBe('tickets')
  })

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
    const startingTicketCount = state.tickets.length

    state = reduce(state, addMessage({ channelId: 'general', text: 'I have an issue, login fails' }))
    state = reduce(state, addAutoResponse({ channelId: 'general', userText: 'I have an issue, login fails' }))

    expect(state.intakeByChannel.general.active).toBe(true)

    state = reduce(state, addAutoResponse({ channelId: 'general', userText: 'All users, sev-1' }))
    state = reduce(state, addAutoResponse({ channelId: 'general', userText: 'prod' }))
    state = reduce(state, addAutoResponse({ channelId: 'general', userText: 'since this morning, every time' }))
    state = reduce(state, addAutoResponse({ channelId: 'general', userText: 'cleared cache and retried' }))

    expect(state.tickets).toHaveLength(startingTicketCount + 1)

    const ticket = state.tickets[state.tickets.length - 1]
    expect(ticket.id).toBe('TCK-0006')
    expect(ticket.status).toBe('open')
    expect(ticket.channelId).toContain('ticket-tck-0006')

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

    state = reduce(state, addAutoResponse({ channelId: 'general', userText: 'resolve ticket TCK-0001' }))

    const ticket = state.tickets.find((item) => item.id === 'TCK-0001')
    expect(ticket.status).toBe('resolved')

    const ticketChannel = state.channels.find((channel) => channel.id === ticket.channelId)
    expect(ticketChannel.status).toBe('Resolved')
  })

  it('keeps Tickets board as second channel when present', () => {
    let state = reduce(undefined, { type: '@@INIT' })

    state = reduce(state, addAutoResponse({ channelId: 'general', userText: 'critical issue in prod' }))
    state = reduce(state, addAutoResponse({ channelId: 'general', userText: 'all users' }))
    state = reduce(state, addAutoResponse({ channelId: 'general', userText: 'prod' }))
    state = reduce(state, addAutoResponse({ channelId: 'general', userText: 'always since 9am' }))
    state = reduce(state, addAutoResponse({ channelId: 'general', userText: 'restarted app' }))

    const orderedChannels = selectChannels({ chat: state })
    expect(orderedChannels[0].id).toBe('general')
    expect(orderedChannels[1].id).toBe('tickets')
  })
})
