import type { Station } from "../types/radio";

const baseUrl =
	import.meta.env.VITE_STREAM_BASE_URL || "https://stream.rhythm.place";

export const stations: Station[] = [
	{
		id: "rock",
		name: "Rock Station",
		genre: "Rock",
		streamUrl: `${baseUrl}/rock`,
	},
	{
		id: "pop",
		name: "Pop Hits",
		genre: "Pop",
		streamUrl: `${baseUrl}/pop`,
	},
	{
		id: "jazz",
		name: "Jazz Lounge",
		genre: "Jazz",
		streamUrl: `${baseUrl}/jazz`,
	},
	{
		id: "dance",
		name: "Dance",
		genre: "Dance",
		streamUrl: `${baseUrl}/dance`,
	},
	{
		id: "main",
		name: "Principal",
		genre: "Principal",
		streamUrl: `${baseUrl}/main`,
	},
];
