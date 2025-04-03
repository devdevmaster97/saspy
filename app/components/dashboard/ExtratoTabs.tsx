'use client';

import { useState } from 'react';
import { Tab } from '@headlessui/react';
import ExtratoTabContent from './ExtratoTabContent';

interface ExtratoTabsProps {
  cartao: string;
  theme: string;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function ExtratoTabs({ cartao, theme }: ExtratoTabsProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Classes baseadas no tema
  const bgClass = theme === 'dark' ? 'bg-gray-800' : 'bg-white';

  return (
    <div className="w-full px-2 sm:px-0">
      <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
        <Tab.Panels>
          <Tab.Panel
            className={classNames(
              `rounded-xl ${bgClass} p-3`,
              'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
            )}
          >
            <ExtratoTabContent cartao={cartao} theme={theme} />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
} 