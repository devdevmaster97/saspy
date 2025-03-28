'use client';

import { ReactNode } from 'react';

interface MenuCardProps {
  icon: ReactNode;
  title: string;
  onClick: () => void;
}

export default function MenuCard({ icon, title, onClick }: MenuCardProps) {
  return (
    <div 
      onClick={onClick}
      className="flex flex-col items-center justify-center bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
    >
      <div className="text-blue-600 mb-3 text-4xl">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    </div>
  );
} 