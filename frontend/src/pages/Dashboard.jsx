import React, { useState } from 'react';
import InputSection from './dashboard/InputSection';
import ResultsSection from './dashboard/ResultsSection';
import { analyzeHealth } from '../api';

const Dashboard = () => {
    const [step, setStep] = useState('input'); // input | results
    const [userData, setUserData] = useState({
        age: 30,
        gender: "Male",
        bmi: 22.0,
        waist_circumference: 0,
        sys_bp_avg: 120,
        dia_bp_avg: 80,
        fasting_glucose: 90,
        hba1c: 5.2,
        total_cholesterol: 170,
        ldl: 100,
        hdl: 45,
        triglycerides: 120
    });
    const [analysisResults, setAnalysisResults] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {
        setLoading(true);
        try {
            const results = await analyzeHealth(userData);
            setAnalysisResults(results);
            setStep('results');
        } catch (error) {
            console.error(error);
            alert("Analysis failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setStep('input');
        setAnalysisResults(null);
    };

    return (
        <div className="max-w-6xl mx-auto py-8">
            {step === 'input' ? (
                <InputSection
                    userData={userData}
                    setUserData={setUserData}
                    onAnalyze={handleAnalyze}
                    loading={loading}
                />
            ) : (
                <ResultsSection
                    userData={userData}
                    results={analysisResults}
                    onReset={handleReset}
                />
            )}
        </div>
    );
};

export default Dashboard;
