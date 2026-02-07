import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import content from '../../content/content.json';
import { uploadReport } from '../../api';

const InputSection = ({ userData, setUserData, onAnalyze, loading }) => {
    const { upload, manual } = content;
    const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'manual'
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const calculateBMI = (w, h) => {
        // Logic for BMI calculation if needed, but the backend expects raw values usually.
        // Or user enters BMI directly.
        // Existing app has direct BMI input.
    }

    const handleFile = async (file) => {
        setUploading(true);
        try {
            const result = await uploadReport(file);
            if (result.extracted_data) {
                setUserData(prev => ({ ...prev, ...result.extracted_data }));
                setActiveTab('manual'); // Switch to manual to review
            }
        } catch (error) {
            console.error(error);
            alert(upload.error);
        } finally {
            setUploading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({ ...prev, [name]: value }));
    };

    const fields = [
        { name: "age", label: "Age", type: "number" },
        { name: "gender", label: "Gender", type: "select", options: ["Male", "Female"] },
        { name: "bmi", label: "BMI", type: "number", step: "0.1" },
        { name: "waist_circumference", label: "Waist (cm)", type: "number" },
        { name: "sys_bp_avg", label: "Systolic BP", type: "number" },
        { name: "dia_bp_avg", label: "Diastolic BP", type: "number" },
        { name: "fasting_glucose", label: "Fasting Glucose", type: "number" },
        { name: "hba1c", label: "HbA1c", type: "number", step: "0.1" },
        { name: "total_cholesterol", label: "Total Cholesterol", type: "number" },
        { name: "ldl", label: "LDL", type: "number" },
        { name: "hdl", label: "HDL", type: "number" },
        { name: "triglycerides", label: "Triglycerides", type: "number" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-center gap-4">
                <Button
                    variant={activeTab === 'upload' ? 'primary' : 'outline'}
                    onClick={() => setActiveTab('upload')}
                >
                    <Upload className="w-4 h-4" /> Upload Report
                </Button>
                <Button
                    variant={activeTab === 'manual' ? 'primary' : 'outline'}
                    onClick={() => setActiveTab('manual')}
                >
                    <FileText className="w-4 h-4" /> Manual Entry
                </Button>
            </div>

            {activeTab === 'upload' && (
                <Card className="max-w-xl mx-auto text-center border-dashed border-2 border-slate-200 hover:border-primary/50 transition-colors">
                    <div
                        className={`p-12 cursor-pointer relative ${dragActive ? 'bg-sky-50' : ''}`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                            onChange={(e) => handleFile(e.target.files[0])}
                            accept=".pdf,.png,.jpg,.jpeg"
                        />
                        <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">{upload.title}</h3>
                        <p className="text-slate-500 mb-6">{upload.description}</p>
                        <p className="text-primary font-medium hover:underline">{upload.dropText || "Click to select a file"}</p>

                        {uploading && <p className="text-primary mt-4 font-medium animate-pulse relative z-20">{upload.analyzing}</p>}
                    </div>
                </Card>
            )}

            {activeTab === 'manual' && (
                <Card className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {fields.map((field) => (
                            <div key={field.name} className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">{field.label}</label>
                                {field.type === 'select' ? (
                                    <select
                                        name={field.name}
                                        value={userData[field.name] || ''}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    >
                                        {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                ) : (
                                    <input
                                        type={field.type}
                                        name={field.name}
                                        value={userData[field.name] || ''}
                                        onChange={handleChange}
                                        step={field.step || "1"}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="pt-8 flex justify-center">
                        <Button size="lg" onClick={onAnalyze} disabled={loading} className="w-full md:w-auto px-12">
                            {loading ? 'Analyzing...' : manual.submit}
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default InputSection;
