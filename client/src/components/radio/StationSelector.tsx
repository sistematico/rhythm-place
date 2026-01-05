import { stations } from '../../config/stations';
import { useRadio } from '../../contexts/RadioContext';

export function StationSelector() {
  const { currentStation, setCurrentStation, setIsPlaying } = useRadio();

  const selectStation = (station: typeof stations[0]) => {
    setCurrentStation(station);
    setIsPlaying(true);
  };

  return (
    <div className="station-selector">
      <h2>Escolha seu estilo</h2>
      <div className="stations-grid">
        {stations.map((station) => (
          <button
            key={station.id}
            onClick={() => selectStation(station)}
            className={
              currentStation?.id === station.id ? 'station-btn active' : 'station-btn'
            }
          >
            <div className="station-name">{station.name}</div>
            <div className="station-genre">{station.genre}</div>
          </button>
        ))}
      </div>
    </div>
  );
}