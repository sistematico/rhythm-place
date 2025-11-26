import { useAudio } from '../contexts/AudioContext'
import { Play, Pause, Volume2 } from 'lucide-react'

export default function AudioPlayer() {
	const { isPlaying, volume, togglePlay, setVolume } = useAudio()

	return (
		<>
			{/* Player integrado */}

			<div className="flex items-center gap-4">
				<button onClick={togglePlay} className="p-2 rounded-full bg-white/10 hover:bg-white/20">
					{isPlaying ? <Pause size={20} /> : <Play size={20} />}
				</button>

				<div className="flex items-center gap-2">
					<Volume2 size={18} />
					<input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="w-24" />
				</div>
			</div>
		</>
	)
}
