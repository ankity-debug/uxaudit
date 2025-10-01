import React from 'react';
import Logo from '../logo.svg';

export const Header: React.FC = () => {
  return (
    <header className="py-6">
      <div className="container mx-auto px-0">
        <div className="flex items-center">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-60 rounded flex items-center justify-center">
              <img src={Logo} alt="Logo" className="w-full h-full" />
            </div>
            
          </div>
        </div>
      </div>
    </header>
  );
};