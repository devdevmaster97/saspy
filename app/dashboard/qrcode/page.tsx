import QrCodeContent from '@/app/components/dashboard/QrCodeContent';

export default function QrCodePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">QR Code do Cartão</h1>
      </div>
      <div className="bg-white rounded-lg shadow">
        <QrCodeContent />
      </div>
    </div>
  );
} 