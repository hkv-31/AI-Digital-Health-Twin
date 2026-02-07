import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Activity, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import content from '../content/content.json';

const Home = () => {
    const { hero, features } = content;

    const icons = [Activity, Brain, ShieldCheck];

    return (
        <div className="space-y-24">
            {/* Hero Section */}
            <section className="text-center space-y-8 py-16 md:py-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6 max-w-4xl mx-auto"
                >
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 leading-tight">
                        {hero.title}
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        {hero.subtitle}
                    </p>
                    <div className="flex justify-center pt-8">
                        <Link to="/dashboard">
                            <Button size="lg" className="px-8 py-4 text-lg">
                                {hero.cta} <ArrowRight className="w-5 h-5" />
                            </Button>
                        </Link>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 max-w-4xl mx-auto">
                    {hero.stats.map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + idx * 0.1 }}
                            className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100"
                        >
                            <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                            <div className="text-slate-500 font-medium">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, idx) => {
                        const Icon = icons[idx] || Activity;
                        return (
                            <Card key={idx} hover className="border-t-4 border-t-primary">
                                <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center text-primary mb-6">
                                    <Icon size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                            </Card>
                        );
                    })}
                </div>
            </section>
        </div>
    );
};

export default Home;
