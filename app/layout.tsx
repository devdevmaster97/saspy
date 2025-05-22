import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import ServiceWorkerRegistration from './components/ServiceWorkerRegistration';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import IOSInstallPrompt from './components/IOSInstallPrompt';
import UpdateNotification from './components/UpdateNotification';
import Providers from './components/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SASPY',
  description: 'Sistema SASPY',
  manifest: '/manifest.json',
  themeColor: '#1e40af',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SASPY',
  },
  formatDetection: {
    telephone: false,
  },
  applicationName: 'SASPY',
  referrer: 'origin-when-cross-origin',
  keywords: ['saspy', 'sistema', 'gestão'],
  authors: [{ name: 'SASPY' }],
  creator: 'SASPY',
  publisher: 'SASPY',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://saspy.vercel.app',
    siteName: 'SASPY',
    title: 'SASPY - Sistema de Gestão',
    description: 'Sistema SASPY',
    images: [
      {
        url: '/icons/icon-512x512.png',
        width: 512,
        height: 512,
        alt: 'SASPY Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SASPY - Sistema de Gestão',
    description: 'Sistema SASPY',
    images: ['/icons/icon-512x512.png'],
  },
  verification: {
    google: 'adicione_seu_codigo_de_verificacao_aqui',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SASPY" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#1e40af" />
        <meta name="application-name" content="SASPY" />
        <meta name="msapplication-TileColor" content="#1e40af" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="apple-mobile-web-app-orientations" content="portrait" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="SASPY" />
        <meta name="theme-color" content="#1e40af" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
        
        {/* Script para garantir navegação correta no PWA */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Fix for navigation in standalone PWA mode
                if (window.navigator.standalone) {
                  document.addEventListener('click', function(e) {
                    var link = e.target.closest('a');
                    if (link && link.href && link.href.indexOf(location.host) !== -1) {
                      e.preventDefault();
                      window.location = link.href;
                    }
                  }, true);
                }
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster 
            position="top-right" 
            toastOptions={{
              // Configurações para limitar toasts
              success: {
                duration: 5000,
              }
            }}
          />
          <ServiceWorkerRegistration />
          <PWAInstallPrompt />
          <IOSInstallPrompt />
          <UpdateNotification />
        </Providers>
      </body>
    </html>
  );
}
