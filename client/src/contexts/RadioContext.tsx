import { createContext, useContext, useState, useRef, ReactNode } from "react";
import type { Station } from "../types/radio";
import type * as PlyrTypes from "plyr";

type Plyr = PlyrTypes.default;

interface RadioContextType {
	currentStation: Station | null;
	setCurrentStation: (station: Station | null) => void;
	playerRef: { current: Plyr | null };
}

const RadioContext = createContext<RadioContextType | undefined>(undefined);

export function RadioProvider({ children }: { children: ReactNode }) {
	const [currentStation, setCurrentStation] = useState<Station | null>(null);
	const playerRef = useRef<Plyr | null>(null);

	return (
		<RadioContext.Provider
			value={{
				currentStation,
				setCurrentStation,
				playerRef,
			}}
		>
			{children}
		</RadioContext.Provider>
	);
}

export function useRadio() {
	const context = useContext(RadioContext);
	if (!context) {
		throw new Error("useRadio must be used within RadioProvider");
	}
	return context;
}
