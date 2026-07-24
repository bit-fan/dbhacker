import { createSlice } from '@reduxjs/toolkit';
import channelData from '../../data/channel.json';
import chatRespData from '../../data/chatresp.json';
import { DEFAULT_BOT_NAME } from '../../constants/bot';

const channels = channelData.channels ?? [];

const seedMessagesByChannel = chatRespData.seedMessagesByChannel ?? {};
const responseRules = chatRespData.responseRules ?? [];
const defaultResponse = chatRespData.defaultResponse ?? null;
const issueBot = chatRespData.issueBot ?? {};

const TICKETS_CHANNEL_ID = 'tickets';
const JUSTIN_CHANNEL_ID = 'general';

const getNowTime = () =>
  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const normalizeText = (value) =>
  String(value ?? '')
    .toLowerCase()
    .trim();

const termsMatch = (mode, normalizedText, terms) => {
  const normalizedTerms = (terms ?? [])
    .map((term) => normalizeText(term))
    .filter(Boolean);

  if (normalizedTerms.length === 0) {
    return false;
  }

  if (mode === 'all') {
    return normalizedTerms.every((term) => normalizedText.includes(term));
  }

  if (mode === 'exact') {
    return normalizedTerms.some((term) => normalizedText === term);
  }

  if (mode === 'startsWith') {
    return normalizedTerms.some((term) => normalizedText.startsWith(term));
  }

  return normalizedTerms.some((term) => normalizedText.includes(term));
};

const ruleMatches = (rule, normalizedText) => {
  const match = rule.match ?? {};
  const mode = match.mode ?? 'any';

  if (mode === 'regex') {
    if (!match.pattern) {
      return false;
    }

    try {
      const flags = match.flags ?? 'i';
      return new RegExp(match.pattern, flags).test(normalizedText);
    } catch {
      return false;
    }
  }

  const terms = match.terms ?? rule.keywords ?? [];
  return termsMatch(mode, normalizedText, terms);
};

const toRuleResponse = (rule) => {
  if (rule.response) {
    return rule.response;
  }

  return {
    author: rule.author,
    parts: rule.parts,
  };
};

const statusLabel = {
  open: 'Open',
  triage: 'Triage',
  'in-progress': 'In progress',
  blocked: 'Blocked',
  resolved: 'Resolved',
};

const commandToStatus = {
  reopen: 'open',
  triage: 'triage',
  start: 'in-progress',
  progress: 'in-progress',
  resolve: 'resolved',
  close: 'resolved',
};

const statusOrder = {
  open: 0,
  triage: 1,
  'in-progress': 2,
  blocked: 3,
  resolved: 4,
};

const severityIconByLevel = {
  urgent: '🚨',
  important: '❗',
  normal: '⚠️',
  low: '🔹',
  unimportant: '⚪',
};

const statusIconByValue = {
  open: '🟢',
  triage: '🟡',
  'in-progress': '🔵',
  blocked: '⛔',
  resolved: '✅',
};

const severitySignalByLevel = {
  urgent: 'fire',
  important: '🚨',
  normal: '⚠️',
  low: '🔹',
  unimportant: '▫️',
};

const getCombinedSignalIcon = (status, severity) => {
  if (status === 'resolved') {
    return statusIconByValue.resolved;
  }

  if (status === 'blocked') {
    return '⛔';
  }

  return severitySignalByLevel[severity] || statusIconByValue[status] || '❔';
};

const starterTicketSeeds = [
  {
    id: '001',
    summary: 'Payment gateway timeout spikes during peak traffic',
    status: 'triage',
    severity: 'urgent',
  },
  {
    id: '002',
    summary: 'Authentication service outage in production region us-east',
    status: 'open',
    severity: 'urgent',
  },
  {
    id: '003',
    summary: 'Customer data sync job failing with corrupted payloads',
    status: 'blocked',
    severity: 'urgent',
  },
  {
    id: '004',
    summary: 'Login OTP delivery delayed for mobile users',
    status: 'open',
    severity: 'important',
  },
  {
    id: '005',
    summary: 'Search API returning intermittent 502 for APAC',
    status: 'triage',
    severity: 'important',
  },
  {
    id: '006',
    summary: 'Webhook retries not honoring exponential backoff',
    status: 'in-progress',
    severity: 'important',
  },
  {
    id: '007',
    summary: 'SSO callback URL mismatch for enterprise tenant',
    status: 'resolved',
    severity: 'important',
  },
  {
    id: '008',
    summary: 'Dashboard widgets show stale analytics values',
    status: 'open',
    severity: 'normal',
  },
  {
    id: '009',
    summary: 'Email digest job delayed by queue backlog',
    status: 'triage',
    severity: 'normal',
  },
  {
    id: '010',
    summary: 'Mobile push notification badge count incorrect',
    status: 'in-progress',
    severity: 'normal',
  },
  {
    id: '011',
    summary: 'Billing export CSV missing tax column headers',
    status: 'open',
    severity: 'low',
  },
  {
    id: '012',
    summary: 'Analytics dashboard filters reset unexpectedly',
    status: 'triage',
    severity: 'low',
  },
  {
    id: '013',
    summary: 'Nightly export job blocked waiting for dependency',
    status: 'blocked',
    severity: 'low',
  },
  {
    id: '014',
    summary: 'Profile avatar crop alignment request from design',
    status: 'resolved',
    severity: 'unimportant',
  },
  {
    id: '015',
    summary: 'Theme switcher preference not persisted after logout',
    status: 'resolved',
    severity: 'unimportant',
  },
];

const severitySeedOrder = {
  urgent: 0,
  important: 1,
  normal: 2,
  low: 3,
  unimportant: 4,
};

const sortStarterTicketSeeds = (tickets) =>
  [...tickets].sort((a, b) => {
    const severityDiff =
      (severitySeedOrder[a.severity] ?? 99) - (severitySeedOrder[b.severity] ?? 99);
    if (severityDiff !== 0) {
      return severityDiff;
    }

    return Number(a.id) - Number(b.id);
  });

const seededTicketParticipants = [
  'Alex',
  'Priya',
  'Marco',
  'Chen',
  'Sofia',
  'Ravi',
  'Nina',
];

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
];

const hasIssueSignal = (text) =>
  issueKeywords.some((keyword) => text.includes(keyword));

const inferTicketPriority = (text) => {
  const normalized = normalizeText(text);

  if (/sev[-\s]?1|critical|outage|down|p0/.test(normalized)) {
    return 'urgent';
  }

  if (/sev[-\s]?2|high|urgent|major|p1/.test(normalized)) {
    return 'important';
  }

  if (/sev[-\s]?3|medium|normal|p2/.test(normalized)) {
    return 'normal';
  }

  if (/sev[-\s]?4|minor|low|p3/.test(normalized)) {
    return 'low';
  }

  return 'unimportant';
};

const slugify = (value) =>
  String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const nextTicketNumber = (tickets) =>
  String((tickets?.length ?? 0) + 1).padStart(3, '0');

const createOtherMessage = ({ id, author, parts }) => ({
  id,
  author,
  sender: 'other',
  time: getNowTime(),
  parts,
});

const buildSeededTicketConversation = (
  ticketChannelId,
  seed,
  statusText,
  index,
) => {
  const first =
    seededTicketParticipants[index % seededTicketParticipants.length];
  const second =
    seededTicketParticipants[(index + 2) % seededTicketParticipants.length];

  return [
    createOtherMessage({
      id: `${ticketChannelId}-seed-brief`,
      author: first,
      parts: [
        {
          type: 'text',
          text: `Investigating ${seed.id}: ${seed.summary}`,
        },
      ],
    }),
    createOtherMessage({
      id: `${ticketChannelId}-seed-status`,
      author: second,
      parts: [
        {
          type: 'text',
          text: `Current status is ${statusText}. Capturing evidence and workaround options.`,
        },
      ],
    }),
    createOtherMessage({
      id: `${ticketChannelId}-seed-summary`,
      author: issueBot.author || DEFAULT_BOT_NAME,
      parts: [
        {
          type: 'table',
          columns: ['Field', 'Value'],
          rows: [
            ['Ticket', seed.id],
            ['Status', statusText],
            ['Severity', seed.severity],
          ],
        },
      ],
    }),
  ];
};

const createDefaultResponseMessage = (channelId) => {
  if (!defaultResponse) {
    return null;
  }

  return {
    id: `${channelId}-default-${Date.now()}`,
    author: defaultResponse.author || DEFAULT_BOT_NAME,
    sender: 'other',
    time: getNowTime(),
    parts: defaultResponse.parts ?? [{ type: 'text', text: 'Received.' }],
  };
};

const buildRuleResponseMessage = (channelId, userText) => {
  const normalizedText = normalizeText(userText);
  const sortedRules = [...responseRules].sort(
    (a, b) => (b.priority ?? 0) - (a.priority ?? 0),
  );
  const matchedRule = sortedRules.find((rule) =>
    ruleMatches(rule, normalizedText),
  );

  if (!matchedRule) {
    return null;
  }

  const selected = toRuleResponse(matchedRule);

  return {
    id: `${channelId}-resp-${Date.now()}`,
    author: selected.author || DEFAULT_BOT_NAME,
    sender: 'other',
    time: getNowTime(),
    parts: selected.parts ?? [{ type: 'text', text: 'Received.' }],
  };
};

const ensureTicketListChannel = (state) => {
  const hasChannel = state.channels.some(
    (channel) => channel.id === TICKETS_CHANNEL_ID,
  );
  if (!hasChannel) {
    state.channels.push({
      id: TICKETS_CHANNEL_ID,
      name: 'Tickets',
      status: 'Tracker',
      signalIcon: '📋',
      sortWeight: -0.5,
    });
  }

  if (!state.messagesByChannel[TICKETS_CHANNEL_ID]) {
    state.messagesByChannel[TICKETS_CHANNEL_ID] = [];
  }
};

const getTicketStatusValue = (statusText) => {
  const normalized = normalizeText(statusText);

  if (normalized === normalizeText(statusLabel.open)) {
    return 'open';
  }

  if (normalized === normalizeText(statusLabel.triage)) {
    return 'triage';
  }

  if (normalized === normalizeText(statusLabel['in-progress'])) {
    return 'in-progress';
  }

  if (normalized === normalizeText(statusLabel.blocked)) {
    return 'blocked';
  }

  if (normalized === normalizeText(statusLabel.resolved)) {
    return 'resolved';
  }

  return 'open';
};

const getChannelSortRank = (channel) => {
  if (channel.id === JUSTIN_CHANNEL_ID) {
    return -1;
  }

  if (channel.id === TICKETS_CHANNEL_ID) {
    return -0.5;
  }

  return 0;
};

const refreshTicketBoardMessage = (state) => {
  ensureTicketListChannel(state);

  const boardMessage = createOtherMessage({
    id: `${TICKETS_CHANNEL_ID}-board`,
    author: issueBot.author || DEFAULT_BOT_NAME,
    parts: [
      {
        type: 'text',
        text: 'Ticket board. Commands: triage ticket 001, start ticket 001, resolve ticket 001, reopen ticket 001.',
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
  });

  const list = state.messagesByChannel[TICKETS_CHANNEL_ID];
  const existingIndex = list.findIndex(
    (message) => message.id === `${TICKETS_CHANNEL_ID}-board`,
  );

  if (existingIndex >= 0) {
    list[existingIndex] = boardMessage;
  } else {
    list.unshift(boardMessage);
  }
};

const startIssueIntake = (state, channelId, problemStatement) => {
  const questions = issueBot.questions ?? [];

  if (questions.length === 0) {
    return;
  }

  state.intakeByChannel[channelId] = {
    active: true,
    ticketId: nextTicketNumber(state.tickets),
    problemStatement,
    currentQuestionIndex: 0,
    answers: {},
  };

  const intro =
    issueBot.intakeIntro || 'I need more details before creating a ticket.';
  const firstQuestion = questions[0]?.question;
  const introText = firstQuestion ? `${intro} ${firstQuestion}` : intro;

  state.messagesByChannel[channelId].push(
    createOtherMessage({
      id: `${channelId}-intake-intro-${Date.now()}`,
      author: issueBot.author || DEFAULT_BOT_NAME,
      parts: [{ type: 'text', text: introText }],
    }),
  );
};

const closeIntakeAndCreateTicket = (state, channelId, flow) => {
  const safeBaseName = flow.problemStatement
    .split(' ')
    .slice(0, 4)
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const channelSlug = safeBaseName || `case-${state.tickets.length}`;
  const ticketChannelId = `${issueBot.ticketChannelPrefix || 'ticket'}-${flow.ticketId.toLowerCase()}-${channelSlug}`;

  const ticket = {
    id: flow.ticketId,
    sourceChannelId: channelId,
    channelId: ticketChannelId,
    summary: flow.problemStatement,
    answers: flow.answers,
    status: 'open',
    priority: inferTicketPriority(flow.problemStatement),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  state.tickets.push(ticket);

  const newChannel = {
    id: ticketChannelId,
    name: `${ticket.id} ${flow.problemStatement}`,
    status: statusLabel.open,
    signalIcon: getCombinedSignalIcon('open', ticket.priority),
    ticketStatus: 'open',
    severity: ticket.priority,
    sortWeight: statusOrder.open,
    updatedAt: Date.now(),
  };

  const exists = state.channels.some((channel) => channel.id === newChannel.id);
  if (!exists) {
    state.channels.push(newChannel);
  }

  state.messagesByChannel[ticketChannelId] = [
    createOtherMessage({
      id: `${ticketChannelId}-summary-${Date.now()}`,
      author: issueBot.author || DEFAULT_BOT_NAME,
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
  ];

  state.messagesByChannel[channelId].push(
    createOtherMessage({
      id: `${channelId}-intake-done-${Date.now()}`,
      author: issueBot.author || DEFAULT_BOT_NAME,
      parts: [
        {
          type: 'text',
          text: `I have all required details. Ticket ${flow.ticketId} is created. Please continue in #${ticketChannelId}.`,
        },
      ],
    }),
  );

  state.latestTicketChannelId = ticketChannelId;
  refreshTicketBoardMessage(state);
  flow.active = false;
};

const handleIntakeAnswer = (state, channelId, userText) => {
  const flow = state.intakeByChannel[channelId];

  if (!flow?.active) {
    return false;
  }

  const questions = issueBot.questions ?? [];
  const currentQuestion = questions[flow.currentQuestionIndex];

  if (!currentQuestion) {
    flow.active = false;
    return false;
  }

  flow.answers[currentQuestion.key] = userText;
  flow.currentQuestionIndex += 1;

  if (flow.currentQuestionIndex < questions.length) {
    const nextQuestion = questions[flow.currentQuestionIndex];
    state.messagesByChannel[channelId].push(
      createOtherMessage({
        id: `${channelId}-intake-q-${Date.now()}`,
        author: issueBot.author || DEFAULT_BOT_NAME,
        parts: [{ type: 'text', text: nextQuestion.question }],
      }),
    );
    return true;
  }

  closeIntakeAndCreateTicket(state, channelId, flow);
  return true;
};

const tryApplyTicketCommand = (state, channelId, userText) => {
  const normalized = normalizeText(userText);
  const match = normalized.match(
    /^(reopen|triage|start|progress|resolve|close)\s+ticket\s+((?:tck-)?\d{3})$/i,
  );

  if (!match) {
    return false;
  }

  const command = match[1].toLowerCase();
  const requestedId = match[2].toUpperCase().replace(/^TCK-/, '');
  const nextStatus = commandToStatus[command];

  const ticket = state.tickets.find(
    (item) => item.id.toUpperCase() === requestedId,
  );

  if (!ticket) {
    state.messagesByChannel[channelId].push(
      createOtherMessage({
        id: `${channelId}-ticket-not-found-${Date.now()}`,
        author: issueBot.author || DEFAULT_BOT_NAME,
        parts: [{ type: 'text', text: `Ticket ${requestedId} was not found.` }],
      }),
    );
    return true;
  }

  ticket.status = nextStatus;
  ticket.updatedAt = Date.now();

  const ticketChannel = state.channels.find(
    (channel) => channel.id === ticket.channelId,
  );
  if (ticketChannel) {
    ticketChannel.status = statusLabel[nextStatus] || nextStatus;
    ticketChannel.ticketStatus = nextStatus;
    ticketChannel.sortWeight = statusOrder[nextStatus] ?? 99;
    ticketChannel.updatedAt = Date.now();
    ticketChannel.signalIcon = getCombinedSignalIcon(
      nextStatus,
      ticketChannel.severity,
    );
  }

  state.messagesByChannel[channelId].push(
    createOtherMessage({
      id: `${channelId}-ticket-status-${Date.now()}`,
      author: issueBot.author || DEFAULT_BOT_NAME,
      parts: [
        {
          type: 'text',
          text: `Ticket ${ticket.id} moved to ${statusLabel[nextStatus] || nextStatus}.`,
        },
      ],
    }),
  );

  refreshTicketBoardMessage(state);
  return true;
};

const buildInitialState = () => {
  const starterChannels = [...channels];
  const justinChannel = starterChannels.find(
    (channel) => channel.id === JUSTIN_CHANNEL_ID,
  );

  const initialChannels = justinChannel
    ? [
        {
          ...justinChannel,
          name: 'Justin.ai',
          status: 'Online',
          sortWeight: -1,
        },
      ]
    : [
        {
          id: JUSTIN_CHANNEL_ID,
          name: 'Justin.ai',
          status: 'Online',
          sortWeight: -1,
        },
      ];

  const initialMessagesByChannel = JSON.parse(
    JSON.stringify(seedMessagesByChannel),
  );
  for (const key of Object.keys(initialMessagesByChannel)) {
    if (key !== JUSTIN_CHANNEL_ID) {
      delete initialMessagesByChannel[key];
    }
  }

  const initial = {
    channels: initialChannels,
    messagesByChannel: initialMessagesByChannel,
    intakeByChannel: {},
    tickets: [],
    latestTicketChannelId: null,
  };

  if (!initial.messagesByChannel[JUSTIN_CHANNEL_ID]) {
    initial.messagesByChannel[JUSTIN_CHANNEL_ID] = [];
  }

  initial.messagesByChannel[JUSTIN_CHANNEL_ID] = [
    createOtherMessage({
      id: 'general-justin-welcome',
      author: issueBot.author || DEFAULT_BOT_NAME,
      parts: [
        {
          type: 'text',
          text: 'Good morning, Ivan! \u2600\ufe0f Ready to conquer the day? We\u2019ve got 10 open issues waiting for your magic touch\u20148 carried over from yesterday and 2 fresh ones that just popped in! \ud83d\ude80 Would you like a quick overview of everything on the radar, or should we dive straight into the highest priority issue?',
        },
      ],
    }),
  ];

  sortStarterTicketSeeds(starterTicketSeeds).forEach((seed, index) => {
    const ticketChannelId = `ticket-${seed.id.toLowerCase()}-${slugify(seed.summary).slice(0, 36)}`;
    const createdAt = Date.now() - (index + 1) * 60000;
    const statusText = statusLabel[seed.status] || statusLabel.open;

    initial.tickets.push({
      id: seed.id,
      sourceChannelId: JUSTIN_CHANNEL_ID,
      channelId: ticketChannelId,
      summary: seed.summary,
      answers: {},
      status: seed.status,
      priority: seed.severity,
      createdAt,
      updatedAt: createdAt,
    });

    initial.channels.push({
      id: ticketChannelId,
      name: `${seed.id} ${seed.summary}`,
      status: statusText,
      signalIcon: getCombinedSignalIcon(seed.status, seed.severity),
      ticketStatus: seed.status,
      severity: seed.severity,
      sortWeight: statusOrder[seed.status] ?? 99,
      updatedAt: createdAt,
    });

    initial.messagesByChannel[ticketChannelId] = buildSeededTicketConversation(
      ticketChannelId,
      seed,
      statusText,
      index,
    );
  });

  // Lorra.ai opening message in ticket-002
  const ticket002Channel = initial.channels.find((ch) => ch.id.startsWith('ticket-002'));
  if (ticket002Channel) {
    initial.messagesByChannel[ticket002Channel.id].push(
      createOtherMessage({
        id: `${ticket002Channel.id}-lorra-intro`,
        author: 'Lorra.ai',
        parts: [
          {
            type: 'text',
            text:
              'Hi Ivan! Hi Justin! \uD83D\uDC4B So great to connect with you both! \uD83C\uDF1F\n\n' +
              'I caught your ping from the agent registry. I see we\u2019re dealing with that tricky 504 Gateway Timeout on Ticket #4092\u2014definitely a job for some deep-dive log hunting!\n\n' +
              'Leave the heavy lifting to me. I\u2019m pulling up our production event logs for the 6:45 AM deployment window right now to see exactly where that handshake is breaking down. \uD83D\uDD0D\uD83D\uDCBB\n\n' +
              'Give me just a quick moment to parse the data stream, and I\u2019ll post the culprit lines right here! What specific error strings or microservice scopes should I isolate first?',
          },
        ],
      }),
    );
  }

  ensureTicketListChannel(initial);
  refreshTicketBoardMessage(initial);

  return initial;
};

const initialState = buildInitialState();

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearLatestTicketChannel(state) {
      state.latestTicketChannelId = null;
    },
    addBotReply: {
      reducer(state, action) {
        const { channelId, message } = action.payload;
        if (!state.messagesByChannel[channelId]) {
          state.messagesByChannel[channelId] = [];
        }
        state.messagesByChannel[channelId].push(message);
      },
      prepare({ channelId, parts }) {
        return {
          payload: {
            channelId,
            message: {
              id: `${channelId}-bot-${Date.now()}`,
              author: DEFAULT_BOT_NAME,
              sender: 'other',
              time: getNowTime(),
              parts,
            },
          },
        };
      },
    },
    addMessage: {
      reducer(state, action) {
        const { channelId, message } = action.payload;

        if (!state.messagesByChannel[channelId]) {
          state.messagesByChannel[channelId] = [];
        }

        state.messagesByChannel[channelId].push(message);
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
        };
      },
    },
    addAutoResponse: {
      reducer(state, action) {
        const { channelId, ruleMessage, userText } = action.payload;

        if (!state.messagesByChannel[channelId]) {
          state.messagesByChannel[channelId] = [];
        }

        ensureTicketListChannel(state);

        if (tryApplyTicketCommand(state, channelId, userText)) {
          return;
        }

        if (handleIntakeAnswer(state, channelId, userText)) {
          return;
        }

        // Keep the Justin channel as a strict 1:1 between Justin and You.
        if (channelId === JUSTIN_CHANNEL_ID) {
          const normalizedText = normalizeText(userText);

          if (hasIssueSignal(normalizedText)) {
            startIssueIntake(state, channelId, userText);
            return;
          }

          const justinReply = createDefaultResponseMessage(channelId);
          if (justinReply) {
            state.messagesByChannel[channelId].push(justinReply);
          }
          return;
        }

        if (ruleMessage) {
          state.messagesByChannel[channelId].push(ruleMessage);
          return;
        }

        const normalizedText = normalizeText(userText);

        if (hasIssueSignal(normalizedText)) {
          startIssueIntake(state, channelId, userText);
          return;
        }

        const fallback = createDefaultResponseMessage(channelId);
        if (fallback) {
          state.messagesByChannel[channelId].push(fallback);
        }
      },
      prepare({ channelId, userText }) {
        return {
          payload: {
            channelId,
            userText,
            ruleMessage: buildRuleResponseMessage(channelId, userText),
          },
        };
      },
    },
  },
});

export const { clearLatestTicketChannel, addBotReply, addMessage, addAutoResponse } =
  chatSlice.actions;

export const selectChannels = (state) => {
  const channelsList = state.chat.channels ?? [];

  return [...channelsList].sort((a, b) => {
    const rankDiff = getChannelSortRank(a) - getChannelSortRank(b);
    if (rankDiff !== 0) {
      return rankDiff;
    }

    const severityDiff =
      (severitySeedOrder[a.severity] ?? 99) - (severitySeedOrder[b.severity] ?? 99);
    if (severityDiff !== 0) {
      return severityDiff;
    }

    const updatedDiff = (b.updatedAt || 0) - (a.updatedAt || 0);
    if (updatedDiff !== 0) {
      return updatedDiff;
    }

    return (a.name || '').localeCompare(b.name || '');
  });
};
export const selectMessagesByChannel = (state) => state.chat.messagesByChannel;
export const selectLatestTicketChannelId = (state) =>
  state.chat.latestTicketChannelId;

export default chatSlice.reducer;
