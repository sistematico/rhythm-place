import { createFileRoute } from '@tanstack/react-router'
// import { useState } from "react";
import rhythm from '../assets/rhythm.svg'
// import type { ApiResponse } from "shared";
// import { useMutation } from "@tanstack/react-query";
import { RadioPlayer } from '../components/radio/RadioPlayer'
import { StationSelector } from '../components/radio/StationSelector'

export const Route = createFileRoute('/')({
  component: Index
})

function Index() {
  // const [data, setData] = useState<ApiResponse | undefined>();

  // const { mutate: sendRequest } = useMutation({
  // 	mutationFn: async () => {
  // 		try {
  // 			const req = await fetch("/hello");
  // 			const res: ApiResponse = await req.json();
  // 			setData(res);
  // 		} catch (error) {
  // 			console.log(error);
  // 		}
  // 	},
  // });

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-6 items-center justify-center min-h-screen">
      <a href="https://github.com/stevedylandev/bhvr" target="_blank" rel="noopener">
        <img src={rhythm} className="w-16 h-16 cursor-pointer" alt="Rhythm Place" />
      </a>
      <h1 className="text-5xl font-black">Rhythm Place</h1>
      {/* <h2 className="text-2xl font-bold"></h2> */}
      <p>Feel the beat, find your place</p>
      <RadioPlayer />
      <StationSelector />
      {/* <div className="flex items-center gap-4">
				<button
					type="button"
					onClick={() => sendRequest()}
					className="bg-black text-white px-2.5 py-1.5 rounded-md"
				>
					Call API
				</button>
				<a
					target="_blank"
					href="https://bhvr.dev"
					className="border-1 border-black text-black px-2.5 py-1.5 rounded-md"
					rel="noopener"
				>
					Docs
				</a>
			</div> */}
      {/* {data && (
				<pre className="bg-gray-100 p-4 rounded-md">
					<code>
						Message: {data.message} <br />
						Success: {data.success.toString()}
					</code>
				</pre>
			)} */}
    </div>
  )
}

export default Index
