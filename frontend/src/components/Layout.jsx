import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col bg-background font-sans text-text">
            <Navbar />
            <main className="flex-grow pt-8 pb-16 px-4 max-w-7xl mx-auto w-full">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
