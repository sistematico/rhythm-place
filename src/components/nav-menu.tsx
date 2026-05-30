"use client";

import { Music4 } from "lucide-react";
import { useState } from "react";
import { RequestModal } from "@/components/request-modal";

export function NavMenu() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md border-b border-white/8 bg-black/30">
        {/* Logo */}
        <span className="text-sm font-semibold tracking-widest text-white/50 uppercase select-none">
          Rhythm Place
        </span>

        {/* Actions */}
        <ul className="flex items-center gap-1">
          <li>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 text-white/55 hover:bg-white/8 hover:text-white/90"
            >
              <Music4 size={15} strokeWidth={2} />
              Pedidos
            </button>
          </li>
        </ul>
      </nav>

      <RequestModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
