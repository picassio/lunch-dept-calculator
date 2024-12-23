'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navigation = () => {
  const pathname = usePathname();

  const links = [
    { href: '/users', label: 'Users' },
    { href: '/menu-items', label: 'Menu Items' },
    { href: '/debts/new', label: 'Add Debt' },
    { href: '/debts/group', label: 'Group Debts' },
    { href: '/debts/individual', label: 'Individual Debts' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link 
            href="/" 
            className="text-xl font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Debt Manager
          </Link>
          <div className="flex space-x-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;