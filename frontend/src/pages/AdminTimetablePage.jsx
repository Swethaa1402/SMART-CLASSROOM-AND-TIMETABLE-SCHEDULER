import React, { useState, useEffect } from "react";
import axios from "../lib/axios";

const AdminTimetablePage = () => {
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [teachers, setTeachers] = useState([]);
    const [savedTimetables, setSavedTimetables] = useState([]);

    // Complex State for payload
    const [config, setConfig] = useState({
        classes: [
            { name: "IT-1 Year", roomNumber: "101" },
            { name: "IT-2 Year", roomNumber: "102" },
            { name: "IT-3 Year", roomNumber: "103" }
        ],
        staff: [], // Will populate from teachers
        subjects: [
            { name: "", staffId: "", assignedClass: "IT-1 Year", hoursPerWeek: 4, isLab: false, labDuration: 2 }
        ],
        breakDetails: {
            snackBreakPeriod: 3,
            snackBreakDurationMinutes: 15,
            lunchBreakPeriod: 5,
            lunchBreakDurationMinutes: 45,
            totalPeriodsPerDay: 6,
            periodDurationMinutes: 60
        }
    });

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const res = await axios.get('/admin/users', { params: { role: 'TEACHER' } });
                const teacherUsers = Array.isArray(res.data) ? res.data : [];
                setTeachers(teacherUsers);

                // Initialize staff config map
                const staffConfig = teacherUsers.map(t => ({
                    id: t.id,
                    name: t.name,
                    maxHoursPerDay: 4,
                    maxHoursPerWeek: 20
                }));
                setConfig(prev => ({ ...prev, staff: staffConfig }));
            } catch (err) {
                console.error(err);
            }
        };
        fetchTeachers();
        fetchTimetables();
    }, []);

    const fetchTimetables = async () => {
        try {
            const res = await axios.get('/admin/timetable/all', { params: { _ts: Date.now() } });
            const timetableRows = Array.isArray(res.data) ? res.data : [];
            const sortedData = [...timetableRows].sort((a, b) =>
                (a.className || '').localeCompare(b.className || '') ||
                (a.dayOfWeek || '').localeCompare(b.dayOfWeek || '') ||
                (a.periodNumber || 0) - (b.periodNumber || 0)
            );
            setSavedTimetables(sortedData);
        } catch (err) {
            console.error("Failed to fetch timetables", err);
        }
    };

    const handleClassChange = (index, field, value) => {
        const updated = [...config.classes];
        updated[index][field] = value;
        setConfig({ ...config, classes: updated });
    };

    const addClass = () => {
        setConfig({
            ...config,
            classes: [...config.classes, { name: "", roomNumber: "" }]
        });
    };

    const removeClass = (index) => {
        const updated = [...config.classes];
        updated.splice(index, 1);
        setConfig({ ...config, classes: updated });
    };

    const handleStaffChange = (id, field, value) => {
        const updated = config.staff.map(s => s.id === id ? { ...s, [field]: value } : s);
        setConfig({ ...config, staff: updated });
    };

    const addSubject = () => {
        setConfig({
            ...config,
            subjects: [...config.subjects, { name: "", staffId: "", assignedClass: config.classes[0]?.name || "", hoursPerWeek: 4, isLab: false, labDuration: 2 }]
        });
    };

    const removeSubject = (index) => {
        const updated = [...config.subjects];
        updated.splice(index, 1);
        setConfig({ ...config, subjects: updated });
    };

    const handleSubjectChange = (index, field, value) => {
        const updated = [...config.subjects];
        if (field === 'isLab') {
            updated[index][field] = value === 'true'; // string to bool
        } else {
            updated[index][field] = value;
        }
        setConfig({ ...config, subjects: updated });
    };

    const handleBreakChange = (field, value) => {
        setConfig({
            ...config,
            breakDetails: { ...config.breakDetails, [field]: value }
        });
    };

    const generateTimetable = async () => {
        setLoading(true);
        setError("");
        setSuccess("");
        setSavedTimetables([]);

        try {
            const sanitizedClasses = config.classes
                .map((cls) => ({
                    ...cls,
                    name: (cls.name || "").trim(),
                    roomNumber: (cls.roomNumber || "").trim(),
                }))
                .filter((cls) => cls.name || cls.roomNumber);

            const sanitizedSubjects = config.subjects
                .map((subject) => ({
                    ...subject,
                    name: (subject.name || "").trim(),
                    assignedClass: (subject.assignedClass || "").trim(),
                    hoursPerWeek: Number(subject.hoursPerWeek) || 0,
                    staffId: subject.staffId ? Number(subject.staffId) : null,
                    labDuration: Number(subject.labDuration) || 2,
                }))
                .filter((subject) => subject.name || subject.staffId || subject.assignedClass);

            if (sanitizedClasses.length === 0) {
                setError("Add at least one class before generating the timetable.");
                return;
            }

            if (sanitizedSubjects.length === 0) {
                setError("Add at least one subject before generating the timetable.");
                return;
            }

            const response = await axios.post(`/timetable/generate-auto`, {
                ...config,
                classes: sanitizedClasses,
                subjects: sanitizedSubjects,
            });
            const message = typeof response.data === "string" ? response.data : "Timetable generated successfully";
            if (message.toLowerCase().startsWith("error")) {
                setError(message);
                setSavedTimetables([]);
                return;
            }
            setSuccess(message);
            await fetchTimetables();
        } catch (error) {
            console.error(error);
            setSuccess("");
            setError(error.response?.data?.message || "Failed to generate timetable.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-indigo-700">Auto-Generate Timetable</h1>

            {/* Classes Box */}
            <div className="bg-white p-6 rounded shadow mb-6">
                <h2 className="text-xl font-bold mb-4">1. Classes & Rooms</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {config.classes.map((cls, index) => (
                        <div key={index} className="border p-4 rounded relative">
                            <button onClick={() => removeClass(index)} className="absolute top-2 right-2 text-red-500 font-bold hover:text-red-700">X</button>
                            <label className="font-bold text-sm">Class Name</label>
                            <input
                                className="w-full border p-2 mt-1 mb-2 rounded"
                                placeholder="Class Name (e.g. IT-1)"
                                value={cls.name}
                                onChange={e => handleClassChange(index, 'name', e.target.value)}
                            />
                            <label className="font-bold text-sm">Room Number</label>
                            <input
                                className="w-full border p-2 mt-1 rounded"
                                placeholder="Room Number (e.g. 101)"
                                value={cls.roomNumber}
                                onChange={e => handleClassChange(index, 'roomNumber', e.target.value)}
                            />
                        </div>
                    ))}
                </div>
                <button onClick={addClass} className="mt-4 text-blue-600 font-bold hover:underline">+ Add Class</button>
            </div>

            {/* Staff Constraints Box */}
            <div className="bg-white p-6 rounded shadow mb-6">
                <h2 className="text-xl font-bold mb-4">2. Teacher Constraints</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-64 overflow-y-auto">
                    {config.staff.map((staff) => (
                        <div key={staff.id} className="border p-4 rounded text-sm">
                            <p className="font-bold mb-2">{staff.name}</p>
                            <div className="flex gap-2">
                                <div>
                                    <label className="block text-xs">Max Hrs/Day</label>
                                    <input type="number" className="w-full border p-1 rounded" value={staff.maxHoursPerDay} onChange={e => handleStaffChange(staff.id, 'maxHoursPerDay', parseInt(e.target.value))} />
                                </div>
                                <div>
                                    <label className="block text-xs">Max Hrs/Week</label>
                                    <input type="number" className="w-full border p-1 rounded" value={staff.maxHoursPerWeek} onChange={e => handleStaffChange(staff.id, 'maxHoursPerWeek', parseInt(e.target.value))} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Subjects & Staff Box */}
            <div className="bg-white p-6 rounded shadow mb-6">
                <h2 className="text-xl font-bold mb-4">3. Subjects Assignment</h2>
                {config.subjects.map((sub, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4 items-end border-b pb-4 relative">
                        <button onClick={() => removeSubject(index)} className="absolute top-0 right-0 text-red-500 font-bold">X</button>

                        <div className="col-span-2">
                            <label className="block text-sm font-bold mb-1">Subject Name</label>
                            <input className="w-full border p-2 rounded" placeholder="Subject name..." value={sub.name} onChange={e => handleSubjectChange(index, 'name', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Class</label>
                            <select className="w-full border p-2 rounded" value={sub.assignedClass} onChange={e => handleSubjectChange(index, 'assignedClass', e.target.value)}>
                                {config.classes.map((c, i) => (
                                    <option key={i} value={c.name}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Teacher</label>
                            <select
                                className="w-full border p-2 rounded"
                                value={sub.staffId || ""}
                                onChange={(e) =>
                                    handleSubjectChange(index, "staffId", Number(e.target.value))
                                }
                            >
                                <option value="">Select Teacher</option>
                                {teachers.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Hrs/Week</label>
                            <input type="number" className="w-full border p-2 rounded" value={sub.hoursPerWeek} onChange={e => handleSubjectChange(index, 'hoursPerWeek', parseInt(e.target.value))} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Type</label>
                            <select className="w-full border p-2 rounded" value={sub.isLab.toString()} onChange={e => handleSubjectChange(index, 'isLab', e.target.value)}>
                                <option value="false">Theory</option>
                                <option value="true">Lab</option>
                            </select>
                            {sub.isLab && (
                                <select className="w-full border p-2 rounded mt-1" value={sub.labDuration} onChange={e => handleSubjectChange(index, 'labDuration', parseInt(e.target.value))} title="Lab Duration (in periods)">
                                    <option value={2}>2 Periods</option>
                                    <option value={3}>3 Periods</option>
                                </select>
                            )}
                        </div>
                    </div>
                ))}
                <button onClick={addSubject} className="text-blue-600 font-bold hover:underline">+ Add Another Subject</button>
            </div>

            {/* Break & Period Rules Box */}
            <div className="bg-white p-6 rounded shadow mb-6">
                <h2 className="text-xl font-bold mb-4">4. Break & Time Constraints</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-bold mb-1">Total Periods (Per Day)</label>
                        <input type="number" className="w-full border p-2 rounded" value={config.breakDetails.totalPeriodsPerDay} onChange={e => handleBreakChange('totalPeriodsPerDay', parseInt(e.target.value))} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Period Duration (Mins)</label>
                        <input type="number" className="w-full border p-2 rounded" value={config.breakDetails.periodDurationMinutes} onChange={e => handleBreakChange('periodDurationMinutes', parseInt(e.target.value))} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Snack Period #</label>
                        <input type="number" className="w-full border p-2 rounded" value={config.breakDetails.snackBreakPeriod} title="Period number (1 to Total)" onChange={e => handleBreakChange('snackBreakPeriod', parseInt(e.target.value))} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Snack Duration (Mins)</label>
                        <input type="number" className="w-full border p-2 rounded" value={config.breakDetails.snackBreakDurationMinutes} onChange={e => handleBreakChange('snackBreakDurationMinutes', parseInt(e.target.value))} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Lunch Period #</label>
                        <input type="number" className="w-full border p-2 rounded" value={config.breakDetails.lunchBreakPeriod} title="Period number (1 to Total)" onChange={e => handleBreakChange('lunchBreakPeriod', parseInt(e.target.value))} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Lunch Duration (Mins)</label>
                        <input type="number" className="w-full border p-2 rounded" value={config.breakDetails.lunchBreakDurationMinutes} onChange={e => handleBreakChange('lunchBreakDurationMinutes', parseInt(e.target.value))} />
                    </div>
                </div>
            </div>

            {/* Action */}
            <div className="flex flex-col items-center mb-10">
                <button
                    onClick={generateTimetable}
                    disabled={loading}
                    className="bg-green-600 text-white px-8 py-3 rounded-lg text-xl font-bold hover:bg-green-700 disabled:opacity-50"
                >
                    {loading ? "Generating Safe Combinations..." : "Generate Deterministic Timetable"}
                </button>

                {success && (
                    <div className="mt-4 p-4 rounded bg-green-100 text-green-800 font-bold">
                        {success}
                    </div>
                )}
                {error && (
                    <div className="mt-4 p-4 rounded bg-red-100 text-red-800 font-bold">
                        {error}
                    </div>
                )}
            </div>

            {/* Generated Timetables View */}
            {savedTimetables.length > 0 && (
                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Complete Master Timetable View</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border">
                            <thead>
                                <tr className="bg-indigo-600 text-white leading-normal text-sm">
                                    <th className="py-3 px-6 text-left">Class Name</th>
                                    <th className="py-3 px-6 text-left">Class Day</th>
                                    <th className="py-3 px-6 text-left">Period</th>
                                    <th className="py-3 px-6 text-left">Subject</th>
                                    <th className="py-3 px-6 text-left">Teacher</th>
                                    <th className="py-3 px-6 text-left">Teacher Constraints</th>
                                    <th className="py-3 px-6 text-left">Room</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-700 text-sm font-light">
                                {savedTimetables.sort((a, b) => a.dayOfWeek.localeCompare(b.dayOfWeek)).map((t) => {
                                    const teacherConfig = config.staff.find((staff) => staff.id === t.teacher?.id);
                                    return (
                                    <tr key={t.id} className="border-b border-gray-200 hover:bg-gray-100">
                                        <td className="py-3 px-6 text-left whitespace-nowrap font-medium text-gray-900">{t.className}</td>
                                        <td className="py-3 px-6 text-left font-semibold">{t.dayOfWeek}</td>
                                        <td className="py-3 px-6 text-left">#{t.periodNumber} ({t.startTime} - {t.endTime})</td>
                                        <td className="py-3 px-6 text-left font-bold">{t.subject}</td>
                                        <td className="py-3 px-6 text-left">
                                            <div>{t.teacher?.name || "TBA"}</div>
                                            {t.teacher?.email && <div className="text-xs text-gray-500">{t.teacher.email}</div>}
                                        </td>
                                        <td className="py-3 px-6 text-left">
                                            {teacherConfig
                                                ? `${teacherConfig.maxHoursPerDay} hrs/day, ${teacherConfig.maxHoursPerWeek} hrs/week`
                                                : "Not configured"}
                                        </td>
                                        <td className="py-3 px-6 text-left">{t.room}</td>
                                    </tr>
                                )})}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTimetablePage;
