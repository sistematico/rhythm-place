import type { Station } from '../types/radio';

export const stations: Station[] = [
  {
    id: 'rock',
    name: 'Rock Station',
    genre: 'Rock',
    streamUrl: 'http://localhost:8000/rock',
  },
  {
    id: 'pop',
    name: 'Pop Hits',
    genre: 'Pop',
    streamUrl: 'http://localhost:8000/pop',
  },
  {
    id: 'jazz',
    name: 'Jazz Lounge',
    genre: 'Jazz',
    streamUrl: 'http://localhost:8000/jazz',
  },
  {
    id: 'eletronica',
    name: 'Eletrônica',
    genre: 'Eletrônica',
    streamUrl: 'http://localhost:8000/eletronica',
  },
  {
    id: 'sertanejo',
    name: 'Sertanejo',
    genre: 'Sertanejo',
    streamUrl: 'http://localhost:8000/sertanejo',
  },
];