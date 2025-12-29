import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import { Plus, Users, BookOpen } from 'lucide-react';

const TeacherDashboard = () => {
    const { user } = useAuth();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newClassName, setNewClassName] = useState('');

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const res = await api.getTeacherClasses(user.email);
                setClasses(res.data.classes || []);
            } finally {
                setLoading(false);
            }
        };
        fetchClasses();
    }, [user.email]);

    const handleCreateClass = async (e) => {
        e.preventDefault();
        const res = await api.createClass(newClassName, user.email, '');
        if (res.data.success) {
            setClasses([...classes, { id: res.data.classId, name: newClassName }]); // Optimistic update
            setShowCreateModal(false);
            setNewClassName('');
            // Re-fetch to be safe
            api.getTeacherClasses(user.email).then(r => setClasses(r.data.classes || []));
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">My Classes</h1>
                    <p className="text-muted-foreground">Manage your students and assignments</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-md flex items-center gap-2"
                >
                    <Plus size={20} /> Create Class
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">Loading...</div>
            ) : classes.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No classes yet</h3>
                    <p className="text-muted-foreground mb-4">Create a class to start adding students.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {classes.map(cls => (
                        <Link key={cls.id} to={`/class/${cls.id}`} className="block group">
                            <div className="bg-card border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{cls.name}</h3>
                                <p className="text-sm text-muted-foreground mb-4">{cls.description || 'No description'}</p>
                                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                    <BookOpen size={16} />
                                    <span>View Assignments</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Simple Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-card w-full max-w-md p-6 rounded-lg text-foreground">
                        <h3 className="text-lg font-bold mb-4">Create New Class</h3>
                        <form onSubmit={handleCreateClass}>
                            <input
                                className="w-full border p-2 rounded mb-4 bg-background"
                                placeholder="Class Name (e.g. Math 101)"
                                value={newClassName}
                                onChange={e => setNewClassName(e.target.value)}
                                autoFocus
                            />
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 hover:bg-muted rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherDashboard;
