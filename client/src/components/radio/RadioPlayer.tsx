import { useEffect, useRef } from "react";
import * as PlyrLib from "plyr";
import "plyr/dist/plyr.css";
import { useRadio } from "../../contexts/RadioContext";

const Plyr = (PlyrLib as any).default || PlyrLib;

export function RadioPlayer() {
	const audioRef = useRef<HTMLAudioElement>(null);
	const { currentStation, playerRef } = useRadio();

	useEffect(() => {
		if (!audioRef.current) return;

		const player = new Plyr(audioRef.current, {
			controls: ["play", "progress", "current-time", "volume", "mute"],
			hideControls: false,
			clickToPlay: true,
			displayDuration: false,
		});

		// @ts-ignore
		playerRef.current = player;

		return () => player.destroy();
	}, []);

	useEffect(() => {
		if (!playerRef.current || !currentStation) return;

		playerRef.current.source = {
			type: "audio",
			sources: [
				{
					src: currentStation.streamUrl,
					type: "audio/mpeg",
				},
			],
		};
	}, [currentStation]);

	return (
		<div className="w-full max-w-2xl mx-auto mb-8">
			{currentStation && (
				<div className="bg-gray-800 rounded-lg p-6 mb-4">
					<h3 className="text-2xl font-bold text-white mb-2 text-center">
						{currentStation.name}
					</h3>
					<p className="text-purple-400 text-center mb-4">
						{currentStation.genre}
					</p>
				</div>
			)}
			<audio ref={audioRef}>
				{currentStation && (
					<source src={currentStation.streamUrl} type="audio/mpeg" />
				)}
			</audio>
		</div>
	);
}
