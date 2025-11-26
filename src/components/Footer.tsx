// import { Outlet } from '@tanstack/react-router'

export default function Footer() {
  return (
    <footer className="sticky z-50 bg-background border-t border-white/20 bottom-0 p-4">
      <div className="container mx-auto">
        &copy; {new Date().getFullYear()} Rhythm Place. All rights reserved.
      </div>
    </footer>
  )
}
