'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { FaArrowLeft, FaCheckCircle } from 'react-icons/fa'
import Button from '@/app/components/Button'
import Header from '@/app/components/Header'
import ThemeToggle from '@/app/components/ThemeToggle'

export default function ValidarCodigo() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const username = searchParams.get('username') || ''
  
  const [codigo, setCodigo] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleValidarCodigo = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!codigo.trim()) {
      toast.error('Por favor, insira o código de recuperação')
      return
    }
    
    if (!username) {
      toast.error('Nome de usuário não encontrado')
      router.push('/recuperacao-senha')
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/convenio/validar-codigo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usuario: username, codigo }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.success('Código validado com sucesso!')
        router.push(`/redefinir-senha?username=${username}&token=${data.token}`)
      } else {
        toast.error(data.message || 'Erro ao validar código')
      }
    } catch (error) {
      console.error('Erro ao validar código:', error)
      toast.error('Ocorreu um erro ao validar o código. Por favor, tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleVoltar = () => {
    router.push('/recuperacao-senha')
  }
  
  if (!isMounted) {
    return null
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <Header 
        title="Validar Código" 
        showBackButton
        onBackClick={handleVoltar}
      />
      
      <main className="flex-1 container max-w-md mx-auto px-4 py-8">
        <div className="bg-card-bg border border-card-border rounded-lg p-6 shadow-md">
          <form onSubmit={handleValidarCodigo} className="space-y-6">
            <div>
              <p className="text-foreground mb-4">
                Digite o código de recuperação que foi enviado para o seu e-mail.
              </p>
              
              <input
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Digite o código"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-white dark:bg-gray-700 text-foreground"
              />
            </div>
            
            <div className="space-y-3">
              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
                rightIcon={<FaCheckCircle />}
              >
                Validar Código
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                fullWidth
                onClick={handleVoltar}
                leftIcon={<FaArrowLeft />}
              >
                Voltar
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
} 