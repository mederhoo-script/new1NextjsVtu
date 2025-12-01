'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-4 lg:pl-72">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900 lg:hidden pl-12">VTU App</h1>
        <div className="flex-1 lg:block hidden"></div>
        
        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="hidden md:block">{user?.email}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <div className="px-4 py-2 text-sm text-gray-500 border-b">
                {user?.email}
              </div>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
