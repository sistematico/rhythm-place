import type { Station } from '../types/radio'

const baseUrl = import.meta.env.VITE_STREAM_BASE_URL || 'https://stream.rhythm.place'

export const stations: Station[] = [
  {
    id: 'main',
    name: 'Principal',
    genre: 'Principal',
    streamUrl: `${baseUrl}/main`
  },
  {
    id: 'rock',
    name: 'Rock Station',
    genre: 'Rock',
    streamUrl: `${baseUrl}/rock`
  },
  {
    id: 'nacional',
    name: 'Nacional',
    genre: 'Nacional',
    streamUrl: `${baseUrl}/nacional`
  },
  {
    id: 'dance',
    name: 'Dance',
    genre: 'Dance',
    streamUrl: `${baseUrl}/dance`
  }
]
