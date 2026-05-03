import React, { useState } from 'react';
import axios from '../lib/axios';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'Hi! I am your AI assistant. Ask me anything about your classes or exams.' }
    ]);
    const [input, setInput] = useState('');

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');

        try {
            const res = await axios.post('/ai/chat', { question: input });
            const botMessage = { sender: 'bot', text: res.data.answer };
            setMessages(prev => [...prev, botMessage]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { sender: 'bot', text: 'Error: Could not reach AI server.' }]);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
                >
                    💬 AI Help
                </button>
            )}

            {isOpen && (
                <div className="bg-white w-80 h-96 shadow-2xl rounded-lg flex flex-col border border-gray-200">
                    <div className="bg-blue-600 text-white p-3 rounded-t-lg flex justify-between items-center">
                        <span className="font-bold">AI Assistant</span>
                        <button onClick={() => setIsOpen(false)} className="text-xl">&times;</button>
                    </div>

                    <div className="flex-1 p-3 overflow-y-auto space-y-2 bg-gray-50">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`p-2 rounded max-w-[80%] text-sm ${msg.sender === 'user' ? 'bg-blue-100 ml-auto' : 'bg-white border mr-auto'}`}>
                                {msg.text}
                            </div>
                        ))}
                    </div>

                    <div className="p-2 border-t flex">
                        <input
                            className="flex-1 border p-2 rounded-l outline-none focus:border-blue-500"
                            placeholder="Type a question..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleSend()}
                        />
                        <button onClick={handleSend} className="bg-blue-600 text-white px-4 rounded-r">Send</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
