import { stations } from "../../config/stations";
import { useRadio } from "../../contexts/RadioContext";

export function StationSelector() {
	const { currentStation, setCurrentStation, playerRef } = useRadio();

	const selectStation = (station: (typeof stations)[0]) => {
		setCurrentStation(station);

		// Auto-play quando selecionar
		setTimeout(() => {
			if (playerRef.current) {
				playerRef.current.play();
			}
		}, 100);
	};

	return (
		<div className="w-full max-w-4xl mx-auto p-6">
			<h2 className="text-2xl font-bold text-white mb-6 text-center">
				Escolha seu estilo
			</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{stations.map((station) => (
					<button
						key={station.id}
						onClick={() => selectStation(station)}
						className={`
              p-6 rounded-lg transition-all duration-200 transform hover:scale-105
              ${
								currentStation?.id === station.id
									? "bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg shadow-purple-500/50"
									: "bg-gray-800 hover:bg-gray-700"
							}
            `}
					>
						<div className="text-xl font-bold text-white mb-2">
							{station.name}
						</div>
						<div className="text-sm text-gray-300">{station.genre}</div>
					</button>
				))}
			</div>
		</div>
	);
}
