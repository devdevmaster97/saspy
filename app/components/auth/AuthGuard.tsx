"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { ReactNode } from "react"

interface AuthGuardProps {
  children: ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const { status } = useSession()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  
  // Verificação adicional com localStorage
  useEffect(() => {
    // Primeiro verificamos se há uma sessão ativa
    if (status === "authenticated") {
      setIsAuthorized(true)
      return
    }
    
    // Se não está autenticado mas ainda está carregando, aguardamos
    if (status === "loading") {
      return
    }
    
    // Caso não esteja autenticado pelo NextAuth, verificamos o localStorage
    const storedUser = localStorage.getItem('saspy_user')
    if (storedUser) {
      try {
        // Se temos um usuário armazenado, consideramos autenticado
        setIsAuthorized(true)
      } catch (error) {
        console.error('Erro ao processar dados do usuário:', error)
        setIsAuthorized(false)
        router.push("/login")
      }
    } else {
      // Se não há usuário nem no NextAuth nem no localStorage, não está autorizado
      setIsAuthorized(false)
      router.push("/login")
    }
  }, [status, router])

  // Enquanto verificamos a autorização, mostramos o loader
  if (isAuthorized === null || status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Se não está autorizado, não renderizamos nada (redirecionamento já foi tratado)
  if (!isAuthorized) {
    return null
  }

  // Se chegou aqui, está autorizado
  return <>{children}</>
}

