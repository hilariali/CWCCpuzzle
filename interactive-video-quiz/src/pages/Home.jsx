import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Plus, Play, Edit, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';

const Home = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const response = await api.getAllVideos();
                setVideos(response.data.videos);
            } catch (error) {
                console.error("Failed to fetch videos", error);
            } finally {
                setLoading(false);
            }
        };
        fetchVideos();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Lessons</h1>
                    <p className="text-muted-foreground mt-1">Manage your interactive video lessons</p>
                </div>
                <Link
                    to="/editor"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md flex items-center gap-2 font-medium transition-colors"
                >
                    <Plus size={20} />
                    Create New Lesson
                </Link>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : videos.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed rounded-lg bg-card">
                    <Play className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No lessons yet</h3>
                    <p className="text-muted-foreground mb-4">Get started by creating your first interactive video.</p>
                    <Link to="/editor" className="text-primary hover:underline font-medium">Create a lesson</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videos.map((video) => (
                        <div key={video.id} className="bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                            <div className="aspect-video bg-muted relative rounded-t-lg overflow-hidden group">
                                {/* Thumbnail substitute (YouTube thumbnail) */}
                                <img
                                    src={`https://img.youtube.com/vi/${getYouTubeID(video.url)}/hqdefault.jpg`}
                                    alt={video.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Link to={`/watch/${video.id}`} className="bg-white/20 hover:bg-white/40 p-2 rounded-full text-white backdrop-blur-sm transition-colors" title="Preview as Student">
                                        <ExternalLink size={20} />
                                    </Link>
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="text-lg font-semibold line-clamp-1 mb-1">{video.title}</h3>
                                <p className="text-xs text-muted-foreground mb-4">Created: {new Date(video.createdAt).toLocaleDateString()}</p>
                                <div className="flex gap-2">
                                    <Link to={`/editor/${video.id}`} className="flex-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground py-2 px-3 rounded text-sm font-medium text-center flex items-center justify-center gap-2 transition-colors">
                                        <Edit size={16} /> Edit
                                    </Link>
                                    <Link to={`/watch/${video.id}`} className="flex-1 bg-primary/10 hover:bg-primary/20 text-primary py-2 px-3 rounded text-sm font-medium text-center flex items-center justify-center gap-2 transition-colors">
                                        <Play size={16} /> Watch
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Helper to extract ID
function getYouTubeID(url) {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : false;
}

export default Home;
