import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const res = await api.getStudentClasses(user.email);
                setClasses(res.data.classes || []);
            } finally {
                setLoading(false);
            }
        };
        fetchClasses();
    }, [user.email]);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">My Classes</h1>
                <p className="text-muted-foreground">Select a class to view assignments</p>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">Loading...</div>
            ) : classes.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No classes found</h3>
                    <p className="text-muted-foreground">Ask your teacher to add you to their class using email: <strong>{user.email}</strong></p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {classes.map(cls => (
                        <Link key={cls.id} to={`/class/${cls.id}`} className="block group">
                            <div className="bg-card border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{cls.name}</h3>
                                <p className="text-sm text-muted-foreground">Teacher: {cls.teacherEmail}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
