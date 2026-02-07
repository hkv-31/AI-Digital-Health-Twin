import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

const Button = ({ children, className, variant = 'primary', ...props }) => {
    const variants = {
        primary: 'bg-primary text-white hover:bg-sky-600 shadow-md hover:shadow-lg',
        secondary: 'bg-secondary text-white hover:bg-teal-600 shadow-md hover:shadow-lg',
        outline: 'border-2 border-primary text-primary hover:bg-sky-50',
        ghost: 'text-slate-600 hover:bg-slate-100',
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                'px-6 py-2.5 rounded-full font-medium transition-all duration-200 flex items-center justify-center gap-2',
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </motion.button>
    );
};

export default Button;
