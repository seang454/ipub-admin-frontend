'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import NavbarGuest from './NavbarGuest';
import NavbarUser from './NavbarUser';

function readAuthState(): boolean {
  try {
    const jwt = localStorage.getItem('access_token') || localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return Boolean(jwt || user);
  } catch {
    return false;
  }
}

export default function NavbarWrapper() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const hiddenPaths = ['/login', '/dashboard', '/student', '/mentor'];
  const shouldHideNavbar = hiddenPaths.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  useEffect(() => {
    setMounted(true);
    setIsLoggedIn(readAuthState());

    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (['access_token', 'token', 'user'].includes(e.key)) {
        setIsLoggedIn(readAuthState());
      }
    };
    window.addEventListener('storage', onStorage);

    return () => window.removeEventListener('storage', onStorage);
  }, []);

  if (!mounted || shouldHideNavbar) return null;

  return isLoggedIn ? <NavbarUser /> : <NavbarGuest />;
}