// contexts/AudioContext.tsx
import { createContext, useContext, useRef, useState, useEffect, ReactNode } from 'react'

interface AudioContextType {
  isPlaying: boolean
  volume: number
  //currentStation: Station | null
  play: () => void
  pause: () => void
  togglePlay: () => void
  setVolume: (volume: number) => void
  // setStation: (station: Station) => void
}

// interface Station {
//   id: string
//   name: string
//   url: string
//   logo?: string
// }

const AudioContext = createContext<AudioContextType | undefined>(undefined)

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  
  // Estado inicial com verificação de SSR
  const [volume, setVolume] = useState(() => {
    // Verificar se está no cliente
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('radioVolume')
      return saved ? Number(saved) : 0.8
    }
    return 0.8
  })
  
  // const [currentStation, setCurrentStation] = useState<Station | null>(() => {
  //   // Verificar se está no cliente
  //   if (typeof window !== 'undefined') {
  //     const saved = localStorage.getItem('radioStation')
  //     return saved ? JSON.parse(saved) : null
  //   }
  //   return null
  // })

  // Criar elemento de áudio APENAS no cliente
  useEffect(() => {
    // Este useEffect só roda no cliente
    if (!audioRef.current && typeof window !== 'undefined') {
      audioRef.current = new Audio()
      audioRef.current.volume = volume
      
      // Listeners
      audioRef.current.addEventListener('play', () => setIsPlaying(true))
      audioRef.current.addEventListener('pause', () => setIsPlaying(false))
      audioRef.current.addEventListener('ended', () => setIsPlaying(false))

      audioRef.current.src = "https://stream.rhythm.place/main"
      
      // Se tinha uma estação salva, restaurar
      // if (currentStation) {
      //   audioRef.current.src = currentStation.url
      // }
    } else if (audioRef.current) {
      // Atualiza volume e estação se já existe
      audioRef.current.volume = volume
      // if (currentStation) {
      //   audioRef.current.src = currentStation.url
      // }
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
    }
  }, [volume])
  // }, [currentStation, volume])

  // Persistir volume - só no cliente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('radioVolume', String(volume))
    }
  }, [volume])
  
  // Persistir estação - só no cliente
  // useEffect(() => {
  //   if (typeof window !== 'undefined' && currentStation) {
  //     localStorage.setItem('radioStation', JSON.stringify(currentStation))
  //   }
  // }, [currentStation])

  // const setStation = (station: Station) => {
  //   if (audioRef.current) {
  //     audioRef.current.src = station.url
  //     //setCurrentStation(station)
  //     play()
  //   }
  // }

  const play = () => {
    audioRef.current?.play().catch(err => {
      console.error('Erro ao reproduzir:', err)
    })
  }

  const pause = () => {
    audioRef.current?.pause()
  }

  const togglePlay = () => {
    isPlaying ? pause() : play()
  }

  const handleVolumeChange = (newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
    setVolume(newVolume)
  }

  return (
    <AudioContext.Provider value={{
      isPlaying,
      volume,
      //currentStation,
      play,
      pause,
      togglePlay,
      setVolume: handleVolumeChange,
      // setStation
    }}>
      {children}
      {/* <audio ref={audioRef} src="https://stream.rhythm.place/main" /> */}
    </AudioContext.Provider>
  )
}

export function useAudio() {
  const context = useContext(AudioContext)
  if (!context) {
    throw new Error('useAudio deve ser usado dentro de AudioProvider')
  }
  return context
}