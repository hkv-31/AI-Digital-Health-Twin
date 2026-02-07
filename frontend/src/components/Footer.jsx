import React from 'react';
import { Activity } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-slate-100 py-12 mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
                        <Activity size={20} />
                    </div>
                    <span className="font-bold text-lg text-slate-800">HealthTwin</span>
                </div>
                <p className="text-slate-500 text-sm">
                    © {new Date().getFullYear()} AI Digital Health Twin. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
