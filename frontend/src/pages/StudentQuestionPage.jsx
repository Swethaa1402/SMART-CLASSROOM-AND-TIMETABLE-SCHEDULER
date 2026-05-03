import React, { useState, useEffect } from 'react';
import axios from '../lib/axios';
import { useAuth } from '../context/AuthContext';

const StudentQuestionPage = () => {
    const { user } = useAuth();
    const [questions, setQuestions] = useState([]);
    const [newQuestion, setNewQuestion] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) fetchQuestions();
    }, [user]);

    const fetchQuestions = async () => {
        try {
            const res = await axios.get(`/questions/student?email=${user.email}`);
            setQuestions(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const submitQuestion = async () => {
        if (!newQuestion.trim()) return;
        setLoading(true);
        try {
            await axios.post('/questions/ask', {
                studentEmail: user.email,
                question: newQuestion
            });
            setNewQuestion('');
            fetchQuestions();
        } catch (err) {
            alert('Failed to submit question');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Ask a Teacher</h1>

            <div className="bg-white p-6 rounded shadow mb-6">
                <textarea
                    className="w-full border p-3 rounded mb-4"
                    rows="3"
                    placeholder="Type your question here..."
                    value={newQuestion}
                    onChange={e => setNewQuestion(e.target.value)}
                />
                <button
                    onClick={submitQuestion}
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Submitting...' : 'Submit Question'}
                </button>
            </div>

            <div className="space-y-4">
                {questions.map(q => (
                    <div key={q.id} className="bg-white p-6 rounded shadow">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg">{q.question}</h3>
                            <span className={`px-2 py-1 rounded text-sm ${q.status === 'ANSWERED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {q.status}
                            </span>
                        </div>
                        {q.answer && (
                            <div className="mt-4 bg-gray-50 p-4 rounded border-l-4 border-green-500">
                                <p className="font-semibold text-gray-700">Teacher's Reply:</p>
                                <p className="mt-1">{q.answer}</p>
                            </div>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                            Asked on {new Date(q.createdAt).toLocaleString()}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudentQuestionPage;
