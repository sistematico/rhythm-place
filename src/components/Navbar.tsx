import AudioPlayer from './AudioPlayer'

export default function Navbar() {
  return (
    <header className="sticky z-50 bg-background border border-white/20 top-0 p-4">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold">Rhythm Place</h1>
        <AudioPlayer />
      </div>
    </header>
  )
}
