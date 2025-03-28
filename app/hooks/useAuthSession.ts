"use client"

import { useSession } from "next-auth/react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function useAuthSession(requireAuth = true) {
  const session = useSession()
  const router = useRouter()

  useEffect(() => {
    // Se a sessão terminou de carregar e o usuário não está autenticado
    if (requireAuth && session.status === "unauthenticated") {
      router.push("/login")
    }
  }, [session.status, requireAuth, router])

  return {
    session: session.data,
    status: session.status,
    isLoading: session.status === "loading",
    isAuthenticated: session.status === "authenticated",
    user: session.data?.user,
  }
}

