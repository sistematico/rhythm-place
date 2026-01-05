import { useRadio } from "../../contexts/RadioContext";

export function RadioControls() {
	const {
		currentStation,
		isPlaying,
		volume,
		isMuted,
		setIsPlaying,
		setVolume,
		setIsMuted,
	} = useRadio();

	const togglePlay = () => {
		setIsPlaying(!isPlaying);
	};

	const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setVolume(parseFloat(e.target.value));
	};

	const toggleMute = () => {
		setIsMuted(!isMuted);
	};

	if (!currentStation) {
		return (
			<div className="radio-controls empty">
				<p>Selecione uma estação para começar</p>
			</div>
		);
	}

	return (
		<div className="radio-controls">
			<div className="now-playing">
				<h3>{currentStation.name}</h3>
				<p className="genre">{currentStation.genre}</p>
			</div>

			<div className="controls">
				<button onClick={togglePlay} className="play-button">
					{isPlaying ? "⏸️ Pausar" : "▶️ Tocar"}
				</button>

				<div className="volume-control">
					<button onClick={toggleMute} className="mute-btn">
						{isMuted ? "🔇" : "🔊"}
					</button>
					<input
						type="range"
						min="0"
						max="1"
						step="0.01"
						value={volume}
						onChange={handleVolumeChange}
						className="volume-slider"
					/>
					<span className="volume-label">{Math.round(volume * 100)}%</span>
				</div>
			</div>
		</div>
	);
}
