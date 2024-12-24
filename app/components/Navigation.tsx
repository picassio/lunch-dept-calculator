'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';

const Navigation = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check system preference on mount
    const darkModePreference = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(darkModePreference.matches);

    // Listen for system preference changes
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    darkModePreference.addEventListener('change', handler);
    return () => darkModePreference.removeEventListener('change', handler);
  }, []);

  const toggleDarkMode = () => {
    const html = document.documentElement;
    const isDarkMode = html.classList.toggle('dark');
    setIsDark(isDarkMode);
  };

  const links = [
    { href: '/users', label: 'Người Dùng', icon: '/window.svg' },
    { href: '/restaurants', label: 'Cửa Hàng', icon: '/globe.svg' },
    { href: '/menu-items', label: 'Thực Đơn', icon: '/file.svg' },
    { href: '/debts/new', label: 'Thêm Nợ', icon: '/file.svg' },
    { href: '/debts/group', label: 'Quản Lý Nợ Nhóm', icon: '/window.svg' },
    { href: '/debts/individual', label: 'Quản Lý Nợ Cá Nhân', icon: '/globe.svg' },
  ];

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link 
            href="/" 
            className="text-xl font-bold text-primary hover:text-primary/90 transition-colors flex items-center gap-2"
          >
            <Image src="/window.svg" alt="Logo" width={24} height={24} className="w-6 h-6" />
            <span>Quản Lý Nợ</span>
          </Link>

          {/* Mobile menu button */}
          <div className="flex items-center gap-4 md:hidden">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out flex items-center gap-2 group ${
                  pathname === link.href
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Image 
                  src={link.icon} 
                  alt="" 
                  width={16} 
                  height={16} 
                  className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                    pathname === link.href ? 'brightness-200' : ''
                  }`}
                />
                {link.label}
              </Link>
            ))}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary transition-colors ml-2"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div 
        className={`fixed inset-x-0 top-[65px] bg-background/95 backdrop-blur-sm border-b border-border md:hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
        }`}
        aria-hidden={!isOpen}
      >
        <div className="px-4 py-3 space-y-3 max-h-[calc(100vh-65px)] overflow-y-auto">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2.5 rounded-md text-base font-medium transition-all duration-200 ease-in-out flex items-center gap-3 ${
                pathname === link.href
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Image 
                src={link.icon} 
                alt="" 
                width={18} 
                height={18} 
                className={`w-[18px] h-[18px] ${pathname === link.href ? 'brightness-200' : ''}`}
              />
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;