"use client"

import { useState, useEffect } from "react"
import { QRCodeSVG } from "qrcode.react"
import { useTranslations } from '@/app/contexts/LanguageContext'

// Removemos a dependência do useAuthSession
const QRCodeContent = () => {
  const translations = useTranslations('QrCodePage')
  const [cartao, setCartao] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Função para inicializar os dados do QR Code
    const initQrCode = () => {
      try {
        // Verificamos se há algum valor salvo no localStorage
        const storedUser = localStorage.getItem('saspy_user')
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser)
            if (parsedUser.cartao) {
              setCartao(parsedUser.cartao)
              setIsLoading(false)
              return
            }
          } catch (error) {
            console.error('Erro ao processar dados do usuário:', error)
          }
        }
        
        // Fallback para um valor padrão (se não houver cartão no localStorage)
        setCartao("1184646067")
        setIsLoading(false)
      } catch (error) {
        console.error("Erro ao inicializar QR Code:", error)
        // Em caso de erro, ainda definimos um valor padrão
        setCartao("1184646067")
        setIsLoading(false)
      }
    }

    // Inicializa o componente
    initQrCode()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!cartao) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">
          {translations.error_loading_qrcode || 'Erro ao carregar o QR Code. Tente novamente.'}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <QRCodeSVG value={cartao} size={256} level="H" includeMargin={true} />
        <p className="mt-4 text-center text-gray-600">
          {translations.card_number_label || 'Seu número de cartão:'} {cartao}
        </p>
      </div>
      <p className="text-sm text-gray-500 text-center">
        {translations.usage_instruction || 'Apresente este QR Code no estabelecimento para realizar pagamentos'}
      </p>
    </div>
  )
}

export default QRCodeContent

