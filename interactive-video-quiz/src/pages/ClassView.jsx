import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Plus, UserPlus, Play } from 'lucide-react';

const ClassView = () => {
    const { classId } = useParams();
    const { user } = useAuth();
    const [classData, setClassData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddStudent, setShowAddStudent] = useState(false);
    const [showAssignVideo, setShowAssignVideo] = useState(false);

    // Form States
    const [studentEmail, setStudentEmail] = useState('');
    const [videoUrl, setVideoUrl] = useState(''); // Simple url input for assign -> could be selection from library

    const fetchClass = async () => {
        try {
            const res = await api.getClass(classId);
            setClassData(res.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClass();
    }, [classId]);

    const handleAddStudent = async (e) => {
        e.preventDefault();
        const res = await api.addStudentToClass(classId, studentEmail);
        if (res.data.success) {
            setStudentEmail('');
            setShowAddStudent(false);
            fetchClass();
        } else {
            alert(res.data.error || 'Failed to add student');
        }
    };

    const handleAssignVideo = async (e) => {
        e.preventDefault();
        // First create video metadata if not exists? Or assumes video ID.
        // For MVP, let's say teacher pastes a URL, we auto-create video entry, then assign.
        const vidRes = await api.createVideo(videoUrl, 'Assignment ' + new Date().toLocaleDateString());
        if (vidRes.data.id) {
            await api.assignVideo(classId, vidRes.data.id, '');
            setShowAssignVideo(false);
            setVideoUrl('');
            fetchClass();
        }
    };

    if (loading) return <div className="p-12 text-center">Loading...</div>;
    if (!classData) return <div className="p-12 text-center">Class not found</div>;

    const isTeacher = user.role === 'teacher';

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-2">{classData.class.name}</h1>
            <p className="text-muted-foreground mb-8">
                {isTeacher ? 'Manage your class assignments and students.' : `Teacher: ${classData.class.teacherEmail}`}
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Assignments Column */}
                <div className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Assignments</h2>
                        {isTeacher && (
                            <button
                                onClick={() => setShowAssignVideo(true)}
                                className="text-sm bg-primary text-primary-foreground px-3 py-1.5 rounded flex items-center gap-2"
                            >
                                <Plus size={16} /> Assign Video
                            </button>
                        )}
                    </div>

                    <div className="space-y-4">
                        {classData.assignments && classData.assignments.length > 0 ? (
                            classData.assignments.map(assign => (
                                <div key={assign.id} className="bg-card border p-4 rounded-lg flex justify-between items-center">
                                    <div>
                                        <h4 className="font-bold">{assign.videoTitle || 'Untitled Video'}</h4>
                                        <p className="text-xs text-muted-foreground">Due: {assign.dueDate || 'No due date'}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        {isTeacher && (
                                            <Link to={`/editor/${assign.videoId}`} className="text-sm border px-3 py-1.5 rounded hover:bg-muted">
                                                Edit Content
                                            </Link>
                                        )}
                                        <Link to={`/watch/${assign.videoId}`} className="text-sm bg-primary text-primary-foreground px-3 py-1.5 rounded flex items-center gap-2">
                                            <Play size={16} /> {isTeacher ? 'Preview' : 'Start'}
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted-foreground italic">No assignments yet.</p>
                        )}
                    </div>
                </div>

                {/* Students Column (Teacher Only) */}
                {isTeacher && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Students</h2>
                            <button
                                onClick={() => setShowAddStudent(true)}
                                className="text-sm bg-secondary text-secondary-foreground px-3 py-1.5 rounded flex items-center gap-2"
                            >
                                <UserPlus size={16} /> Add
                            </button>
                        </div>
                        <div className="bg-card border rounded-lg p-4">
                            <ul className="space-y-2">
                                {classData.students && classData.students.length > 0 ? (
                                    classData.students.map((email, idx) => (
                                        <li key={idx} className="flex items-center gap-2 p-2 hover:bg-muted rounded">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                {email[0].toUpperCase()}
                                            </div>
                                            <span className="text-sm truncate">{email}</span>
                                        </li>
                                    ))
                                ) : (
                                    <p className="text-muted-foreground text-sm">No students enrolled.</p>
                                )}
                            </ul>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Student Modal */}
            {showAddStudent && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-card w-full max-w-md p-6 rounded-lg">
                        <h3 className="text-lg font-bold mb-4">Add Student</h3>
                        <form onSubmit={handleAddStudent}>
                            <input
                                className="w-full border p-2 rounded mb-4 bg-background"
                                placeholder="Student Email"
                                type="email"
                                value={studentEmail}
                                onChange={e => setStudentEmail(e.target.value)}
                                autoFocus
                            />
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowAddStudent(false)} className="px-4 py-2 hover:bg-muted rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded">Add</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Video Modal */}
            {showAssignVideo && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-card w-full max-w-md p-6 rounded-lg">
                        <h3 className="text-lg font-bold mb-4">Assign New Video</h3>
                        <form onSubmit={handleAssignVideo}>
                            <p className="text-sm text-muted-foreground mb-2">Paste a YouTube URL to create a new assignment.</p>
                            <input
                                className="w-full border p-2 rounded mb-4 bg-background"
                                placeholder="https://youtube.com/..."
                                value={videoUrl}
                                onChange={e => setVideoUrl(e.target.value)}
                                autoFocus
                            />
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowAssignVideo(false)} className="px-4 py-2 hover:bg-muted rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded">Assign</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClassView;
