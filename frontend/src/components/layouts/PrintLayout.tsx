import React from 'react';
import { Outlet } from 'react-router-dom';

const PrintLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-white p-8 print:p-4">
      <div className="max-w-4xl mx-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default PrintLayout;