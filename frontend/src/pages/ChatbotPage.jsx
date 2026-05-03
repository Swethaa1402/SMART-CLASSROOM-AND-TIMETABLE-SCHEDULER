import React, { useState } from 'react';
import axios from '../lib/axios';

const ChatbotPage = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const res = await axios.post('/ai/chat', { question: input });
            const botMessage = { role: 'bot', content: res.data.answer };
            setMessages(prev => [...prev, botMessage]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'bot', content: 'Error: Could not extract response from AI.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 h-[calc(100vh-4rem)] flex flex-col">
            <h1 className="text-3xl font-bold mb-4">AI Tutor Assistant</h1>

            <div className="flex-grow bg-white rounded shadow p-4 overflow-y-auto mb-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 mt-10">
                        <p>Hello! I am your AI Tutor.</p>
                        <p>Ask me anything about your studies!</p>
                    </div>
                )}
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-200 text-gray-800 p-3 rounded-lg animate-pulse">
                            Thinking...
                        </div>
                    </div>
                )}
            </div>

            <div className="flex gap-2">
                <input
                    className="flex-grow border p-3 rounded"
                    placeholder="Type your question..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && sendMessage()}
                />
                <button
                    onClick={sendMessage}
                    disabled={loading}
                    className="bg-purple-600 text-white px-6 py-2 rounded font-bold hover:bg-purple-700"
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default ChatbotPage;
