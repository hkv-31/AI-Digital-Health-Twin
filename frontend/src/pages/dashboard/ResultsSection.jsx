
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, FileText, Activity, AlertTriangle, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import content from '../../content/content.json';
import { chatWithAssistant, downloadReport } from '../../api';

const ResultsSection = ({ userData, results, onReset }) => {
    const { dashboard, risks } = content;
    const { classifications = {}, risks: riskScores = {} } = results || {};
    const [downloading, setDownloading] = useState(false);

    console.log("ResultsSection Render:", { results, userData });

    const [chatInput, setChatInput] = useState("");
    const [chatHistory, setChatHistory] = useState([
        { role: "assistant", content: dashboard.chat.welcome }
    ]);
    const [chatLoading, setChatLoading] = useState(false);

    // Helper to determine risk color
    const getRiskColor = (score) => {
        if (score < 20) return "text-green-500 bg-green-50 border-green-200";
        if (score < 40) return "text-yellow-500 bg-yellow-50 border-yellow-200";
        return "text-red-500 bg-red-50 border-red-200";
    };

    const getRiskLabel = (score) => {
        if (score < 20) return risks.low;
        if (score < 40) return risks.moderate;
        return risks.high;
    };

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const blob = await downloadReport(userData);
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Health_Analysis_Report.pdf');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error("Download failed", error);
            alert("Failed to download report.");
        } finally {
            setDownloading(false);
        }
    };

    const handleChat = async (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const userMsg = chatInput;
        setChatHistory(prev => [...prev, { role: "user", content: userMsg }]);
        setChatInput("");
        setChatLoading(true);

        try {
            // Construct context from results
            const context = {
                user_data: userData,
                who_classification: classifications,
                risks: riskScores
            };
            const res = await chatWithAssistant(userMsg, context);
            setChatHistory(prev => [...prev, { role: "assistant", content: res.reply }]);
        } catch (err) {
            console.error(err);
        } finally {
            setChatLoading(false);
        }
    };

    if (!results) {
        return <div className="p-8 text-center text-red-500">Error: No analysis results available.</div>;
    }

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-700">

            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">{dashboard.title}</h2>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleDownload} size="sm" disabled={downloading}>
                        <Download className="w-4 h-4 mr-2" />
                        {downloading ? 'Generating...' : 'Download Report'}
                    </Button>
                    <Button variant="outline" onClick={onReset} size="sm">Start Over</Button>
                </div>
            </div>

            {/* Risk Cards */}
            <h3 className="text-xl font-semibold text-slate-700">{dashboard.riskTitle}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(riskScores).map(([key, score], idx) => {
                    const labelKey = key.replace('_Risk_%', '').toLowerCase();
                    const title = risks[labelKey] || key.replace(/_/g, ' ');
                    const colorClass = getRiskColor(score);
                    const riskLabel = getRiskLabel(score);

                    return (
                        <Card key={key} className={`border-l-4 ${colorClass.split(' ')[2]}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 rounded-lg bg-white/50">
                                    <Activity className="w-6 h-6" />
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${colorClass}`}>
                                    {riskLabel}
                                </span>
                            </div>
                            <h4 className="text-slate-500 font-medium text-sm uppercase tracking-wide">{title}</h4>
                            <div className="text-4xl font-bold text-slate-900 mt-2">{score}%</div>
                        </Card>
                    )
                })}
            </div>

            {/* WHO Classifications */}
            <h3 className="text-xl font-semibold text-slate-700 pt-8">{dashboard.whoTitle}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(classifications).map(([key, value]) => (
                    <Card key={key} className="p-4">
                        <h4 className="text-sm font-medium text-slate-500 mb-1">{key}</h4>
                        {typeof value === 'object' && value !== null ? (
                            <div className="space-y-1">
                                {Object.entries(value).map(([k, v]) => (
                                    <div key={k} className="flex justify-between text-sm">
                                        <span>{k}:</span>
                                        <span className="font-semibold text-slate-800">{v}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-lg font-bold text-slate-800">{value}</div>
                        )}
                    </Card>
                ))}
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-4 items-start">
                <AlertTriangle className="text-blue-500 w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-blue-700 text-sm">{dashboard.disclaimer}</p>
            </div>

            {/* AI Chat */}
            <h3 className="text-xl font-semibold text-slate-700 pt-8">{dashboard.chatTitle}</h3>
            <Card className="h-[500px] flex flex-col p-0 overflow-hidden">
                <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                    {chatHistory.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} `}>
                            <div className={`
                                max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed
                                ${msg.role === 'user'
                                    ? 'bg-primary text-white rounded-br-none'
                                    : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none shadow-sm prose prose-sm max-w-none'
                                }
`}>
                                {msg.role === 'model' || msg.role === 'assistant' ? (
                                    <ReactMarkdown>{msg.content || ""}</ReactMarkdown>
                                ) : (
                                    <p>{msg.content || ""}</p>
                                )}
                            </div>
                        </div>
                    ))}
                    {chatLoading && (
                        <div className="flex justify-start">
                            <div className="bg-slate-100 px-4 py-2 rounded-full text-xs text-slate-500 animate-pulse">
                                Thinking...
                            </div>
                        </div>
                    )}
                </div>
                <form onSubmit={handleChat} className="p-4 bg-white border-t border-slate-100 flex gap-2">
                    <input
                        type="text"
                        className="flex-grow px-4 py-2 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder={dashboard.chat.placeholder}
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                    />
                    <Button type="submit" size="icon" className="w-10 h-10 p-0 rounded-full">
                        <Send className="w-5 h-5" />
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default ResultsSection;
