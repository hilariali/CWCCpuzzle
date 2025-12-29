import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, User } from 'lucide-react';
import { cn } from '../lib/utils';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('student'); // 'student' or 'teacher'
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const res = await register(email, password, name, role);
        if (res.success) {
            navigate('/');
        } else {
            setError(res.error);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
            <div className="bg-card w-full max-w-md p-8 rounded-lg shadow-lg border">
                <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>

                {error && (
                    <div className="bg-destructive/10 text-destructive text-sm p-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <input
                                type="text"
                                required
                                className="w-full pl-10 p-2 border rounded-md bg-background"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <input
                                type="email"
                                required
                                className="w-full pl-10 p-2 border rounded-md bg-background"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <input
                                type="password"
                                required
                                className="w-full pl-10 p-2 border rounded-md bg-background"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">I am a...</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                className={cn(
                                    "p-3 border rounded-md text-sm font-medium transition-colors",
                                    role === 'student' ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted"
                                )}
                                onClick={() => setRole('student')}
                            >
                                Student
                            </button>
                            <button
                                type="button"
                                className={cn(
                                    "p-3 border rounded-md text-sm font-medium transition-colors",
                                    role === 'teacher' ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted"
                                )}
                                onClick={() => setRole('teacher')}
                            >
                                Teacher
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <span className="text-muted-foreground">Already have an account? </span>
                    <Link to="/login" className="text-primary hover:underline font-medium">Log In</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
