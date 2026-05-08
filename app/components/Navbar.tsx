// app/components/Navbar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Dashboard', href: '/' },
    { name: 'Projects', href: '/projects' },
    { name: 'Students', href: '/students' },
    { name: 'Supervisors', href: '/supervisors' },
    { name: 'Schedule', href: '/schedule' },
    { name: 'Reports', href: '/reports' },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#1A237E] shadow-lg shadow-black/20 border-b border-[#3F51B5]/30' 
          : 'bg-[#1A237E]'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="bg-[#3F51B5] p-2 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-white text-lg tracking-tight">FYP Automation</div>
                <div className="text-[10px] text-[#9FA8DA] tracking-wide uppercase">Management System</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-4 py-2 text-sm font-medium transition-all duration-200 relative group ${
                      isActive 
                        ? 'text-white' 
                        : 'text-[#C5CAE9] hover:text-white'
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3F51B5]"></span>
                    )}
                    <span className={`absolute bottom-0 left-0 right-0 h-0.5 bg-[#3F51B5] transition-transform duration-200 scale-x-0 group-hover:scale-x-100 ${isActive ? 'scale-x-100' : ''}`}></span>
                  </Link>
                );
              })}
            </div>

            {/* Right Section */}
            <div className="hidden md:flex items-center space-x-4">
              <button className="text-[#C5CAE9] hover:text-white text-sm font-medium transition-colors px-3 py-1.5">
                Sign In
              </button>
              <button className="bg-[#3F51B5] hover:bg-[#5C6BC0] text-white text-sm font-medium px-5 py-1.5 rounded-md transition-all duration-200 shadow-sm">
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-white p-2 hover:bg-[#3F51B5]/20 rounded-md transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden bg-[#1A237E] border-t border-[#3F51B5]/30 transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-[#3F51B5] text-white' 
                      : 'text-[#C5CAE9] hover:bg-[#3F51B5]/20 hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            <div className="pt-3 space-y-2 border-t border-[#3F51B5]/30 mt-2">
              <button className="w-full text-left px-3 py-2 text-[#C5CAE9] hover:text-white text-sm font-medium rounded-md hover:bg-[#3F51B5]/20 transition-colors">
                Sign In
              </button>
              <button className="w-full bg-[#3F51B5] hover:bg-[#5C6BC0] text-white text-sm font-medium px-3 py-2 rounded-md transition-colors">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer */}
      <div className="h-16"></div>
    </>
  );
};

export default Navbar;