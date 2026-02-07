import React from 'react';
import { Link } from 'react-router-dom';
import content from '../content/content.json';
import Button from './ui/Button';
import { Activity } from 'lucide-react';

const Navbar = () => {
    const { header } = content;

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                            <Activity size={20} />
                        </div>
                        <span className="font-bold text-xl text-slate-800 tracking-tight">
                            {header.title}
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        {header.nav.map((item, idx) => (
                            <Link
                                key={idx}
                                to={item.href}
                                className="text-sm font-medium text-slate-600 hover:text-primary transition-colors"
                                onClick={(e) => {
                                    if (item.href.startsWith("#")) {
                                        e.preventDefault();
                                        document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth' });
                                    }
                                }}
                            >
                                {item.label}
                            </Link>
                        ))}
                        <Link to="/dashboard">
                            <Button size="sm" className="px-5 py-2 text-sm">Get Started</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
