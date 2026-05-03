import React, { useState, useEffect } from 'react';
import axios from '../lib/axios';
import { useAuth } from '../context/AuthContext';

const TeacherQnAPage = () => {
    const { user } = useAuth();
    const [questions, setQuestions] = useState([]);
    const [replyText, setReplyText] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            const res = await axios.get('/questions/teacher');
            setQuestions(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const submitReply = async (questionId) => {
        const answer = replyText[questionId];
        if (!answer) return;

        try {
            await axios.post('/questions/reply', {
                id: questionId,
                answer: answer
            });
            alert('Reply sent successfully!');
            setReplyText(prev => ({ ...prev, [questionId]: '' }));
            fetchQuestions();
        } catch (err) {
            console.error(err);
            alert('Failed to send reply');
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Student Questions</h1>

            <div className="space-y-6">
                {questions.length === 0 ? <p>No questions found.</p> : questions.map(q => (
                    <div key={q.id} className="bg-white p-6 rounded shadow border-l-4 border-blue-500">
                        <div className="flex justify-between mb-2">
                            <span className="font-bold text-gray-700">{q.studentEmail}</span>
                            <span className="text-sm text-gray-500">{new Date(q.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-lg font-semibold mb-4">{q.question}</p>

                        {q.status === 'ANSWERED' ? (
                            <div className="bg-green-50 p-4 rounded border border-green-200">
                                <p className="font-bold text-green-800">Answered:</p>
                                <p className="text-green-900">{q.answer}</p>
                            </div>
                        ) : (
                            <div>
                                <textarea
                                    className="w-full border p-2 rounded mb-2 focus:ring-2 focus:ring-blue-300 outline-none"
                                    placeholder="Type your answer..."
                                    value={replyText[q.id] || ''}
                                    onChange={e => setReplyText({ ...replyText, [q.id]: e.target.value })}
                                />
                                <button
                                    onClick={() => submitReply(q.id)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                >
                                    Send Reply
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TeacherQnAPage;
