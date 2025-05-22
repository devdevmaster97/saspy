import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl'
  };

  return (
    <div className="flex justify-center">
      <div className={`font-bold text-blue-600 ${sizeClasses[size]}`}>
        SASPY
        <span className="text-green-500">.</span>
      </div>
    </div>
  );
} 