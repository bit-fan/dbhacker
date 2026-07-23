import { configureStore } from '@reduxjs/toolkit'
import counterReducer from '../features/counter/counterSlice'
import chatReducer from '../features/chat/chatSlice'

const CHAT_STORAGE_KEY = 'db-hack-chat-state-v1'

const loadChatState = () => {
  if (typeof window === 'undefined') {
    return undefined
  }

  try {
    const raw = window.localStorage.getItem(CHAT_STORAGE_KEY)

    if (!raw) {
      return undefined
    }

    return JSON.parse(raw)
  } catch {
    return undefined
  }
}

const saveChatState = (chatState) => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatState))
  } catch {
    // Ignore storage errors to avoid breaking chat interactions.
  }
}

const preloadedChatState = loadChatState()

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    chat: chatReducer,
  },
  preloadedState: preloadedChatState ? { chat: preloadedChatState } : undefined,
})

store.subscribe(() => {
  saveChatState(store.getState().chat)
})

export default store
