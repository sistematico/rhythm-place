import { Link } from '@tanstack/react-router'

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen">
      <h1>Página não encontrada</h1>
      <Link to="/">Voltar</Link>
    </div>
  )
}