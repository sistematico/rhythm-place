export interface Station {
	id: string;
	name: string;
	genre: string;
	streamUrl: string;
}

export interface RadioState {
	isPlaying: boolean;
	volume: number;
	isMuted: boolean;
	currentStation: Station | null;
}
