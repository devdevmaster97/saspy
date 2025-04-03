'use client';

import { useState } from 'react';
import { Tab } from '@headlessui/react';
import ExtratoTabContent from './ExtratoTabContent';

interface ExtratoTabsProps {
  cartao: string;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function ExtratoTabs({ cartao }: ExtratoTabsProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div className="w-full px-2 sm:px-0">
      <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
        <Tab.Panels>
          <Tab.Panel
            className={classNames(
              'rounded-xl bg-white p-3',
              'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
            )}
          >
            <ExtratoTabContent cartao={cartao} />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
} 