import React from 'react';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
            <main className="flex-grow">
                {children}
            </main>
        </div>
    );
};

export default Layout;
