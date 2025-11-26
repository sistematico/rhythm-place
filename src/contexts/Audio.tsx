import { useQuery, useQueryClient } from '@tanstack/react-query'
//import { useRef } from 'react'

export const useAudio = () => {
	//const queryClient = useQueryClient()
	//const audioRef = useRef<HTMLAudioElement | null>(null)

	const { data: context, isLoading } = useQuery({
		queryKey: ['AudioContext'],
		staleTime: Infinity,
		queryFn: async () => {
			//const serverData = await loadSomethingFromYourApi()
			return {
				//serverFoo: serverData.foo,
				clientStuff: 'from the client'
			}
		}
	})

	// return { context, isLoading, setContext: (updater: (oldContext: any) => any) => queryClient.setQueryData(['AudioContext'], updater) }
	return { context, isLoading }
}
