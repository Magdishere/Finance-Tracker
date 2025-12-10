import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BarChart, CircleDollarSign, Settings, User } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { logout } = useAuth();

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity md:hidden ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 z-30 transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:flex md:flex-col`}
      >
        <div className="flex items-center justify-center h-16 bg-white dark:bg-gray-800">
          <span className="text-gray-800 dark:text-white font-bold uppercase">
            Finance Tracker
          </span>
        </div>

        <div className="flex flex-col flex-1 overflow-y-auto">
          <nav className="flex-1 px-2 py-4 bg-white dark:bg-gray-800">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md ${
                  isActive ? 'bg-gray-200 dark:bg-gray-700' : ''
                }`
              }
              onClick={() => setIsOpen(false)} // Close sidebar on mobile
            >
              <Home className="w-6 h-6 mr-2" />
              Dashboard
            </NavLink>

            <NavLink
              to="/transactions"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 mt-2 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md ${
                  isActive ? 'bg-gray-200 dark:bg-gray-700' : ''
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              <BarChart className="w-6 h-6 mr-2" />
              Transactions
            </NavLink>

            <NavLink
              to="/budgets"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 mt-2 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md ${
                  isActive ? 'bg-gray-200 dark:bg-gray-700' : ''
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              <CircleDollarSign className="w-6 h-6 mr-2" />
              Budgets
            </NavLink>

            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 mt-2 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md ${
                  isActive ? 'bg-gray-200 dark:bg-gray-700' : ''
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              <Settings className="w-6 h-6 mr-2" />
              Settings
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 mt-2 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md ${
                  isActive ? 'bg-gray-200 dark:bg-gray-700' : ''
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              <User className="w-6 h-6 mr-2" />
              Profile
            </NavLink>
          </nav>
        </div>

        <div className="p-4">
          <button
            onClick={logout}
            className="w-full px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
