import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import MessageCards from './MessageCards'

describe('MessageCards', () => {
  it('renders mixed message part types including ticket list', () => {
    const parts = [
      { type: 'text', text: 'hello world' },
      {
        type: 'table',
        columns: ['A', 'B'],
        rows: [['x', 'y']],
      },
      {
        type: 'chart',
        title: 'Latency',
        series: [{ label: 'p50', value: 100 }],
      },
      {
        type: 'image',
        src: '/favicon.svg',
        alt: 'preview image',
      },
      {
        type: 'ticketList',
        tickets: [
          {
            id: 'TCK-0001',
            status: 'Open',
            summary: 'Login failure',
            channelId: 'ticket-tck-0001-login-failure',
          },
        ],
      },
    ]

    render(
      <MemoryRouter>
        <MessageCards parts={parts} />
      </MemoryRouter>,
    )

    expect(screen.getByText('hello world')).toBeInTheDocument()
    expect(screen.getByText('Latency')).toBeInTheDocument()
    expect(screen.getByAltText('preview image')).toBeInTheDocument()
    expect(screen.getByText('TCK-0001')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Open' })).toBeInTheDocument()
  })
})
