import { useEffect, useRef } from 'react';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import { useRadio } from '../../contexts/RadioContext';

export function RadioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { 
    currentStation, 
    isPlaying, 
    volume, 
    isMuted,
    setIsPlaying, 
    setVolume, 
    setIsMuted,
    playerRef 
  } = useRadio();

  useEffect(() => {
    if (!audioRef.current) return;

    const player = new Plyr(audioRef.current, {
      controls: [],
      volume: volume,
    });

    // @ts-ignore - playerRef é modificável internamente
    playerRef.current = player;

    player.on('playing', () => {
      setIsPlaying(true);
    });

    player.on('pause', () => {
      setIsPlaying(false);
    });

    player.on('volumechange', () => {
      setVolume(player.volume);
      setIsMuted(player.muted);
    });

    player.on('error', (error: any) => {
      console.error('Erro no stream:', error);
      setIsPlaying(false);
    });

    return () => player.destroy();
  }, []);

  useEffect(() => {
    if (!playerRef.current || !currentStation) return;

    playerRef.current.source = {
      type: 'audio',
      sources: [
        {
          src: currentStation.streamUrl,
          type: 'audio/mpeg',
        },
      ],
    };

    if (isPlaying) {
      playerRef.current.play();
    }
  }, [currentStation]);

  useEffect(() => {
    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.play().catch(console.error);
    } else {
      playerRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!playerRef.current) return;
    playerRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (!playerRef.current) return;
    playerRef.current.muted = isMuted;
  }, [isMuted]);

  return (
    <audio ref={audioRef} style={{ display: 'none' }}>
      {currentStation && (
        <source src={currentStation.streamUrl} type="audio/mpeg" />
      )}
    </audio>
  );
}