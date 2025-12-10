import React from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeProvider';

const Header = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <header className="flex justify-between items-center px-6 py-4 bg-white dark:bg-gray-800 border-b-2 dark:border-gray-700">
      <div className="flex items-center">
        {/* Hamburger button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-gray-500 dark:text-gray-200 focus:outline-none md:hidden"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex items-center">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="mr-4 flex items-center space-x-1"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          <span className="sr-only">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        <div className="relative">
          <span className="text-gray-700 dark:text-gray-200">
            {user?.name ?? user?.email}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
