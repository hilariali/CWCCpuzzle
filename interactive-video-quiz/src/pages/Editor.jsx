import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import YouTube from 'react-youtube';
import { api } from '../services/api';
import { Save, Plus, Trash2, ArrowLeft, Clock } from 'lucide-react';
import { cn } from '../lib/utils'; // Keep assuming utils exists

const Editor = () => {
    const { videoId } = useParams();
    const navigate = useNavigate();

    // State
    const [url, setUrl] = useState('');
    const [title, setTitle] = useState('Untitled Lesson');
    const [interactions, setInteractions] = useState([]);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [loading, setLoading] = useState(!!videoId);
    const [player, setPlayer] = useState(null);
    const [isInteractionOpen, setIsInteractionOpen] = useState(false);
    const [currentInteraction, setCurrentInteraction] = useState({ type: 'mc', question: '', options: ['', ''], correctAnswer: 0 });

    // Load existing video data
    useEffect(() => {
        if (videoId) {
            const fetchData = async () => {
                try {
                    const res = await api.getVideo(videoId);
                    if (res.data.video) {
                        setUrl(res.data.video.url);
                        setTitle(res.data.video.title);
                        setInteractions(res.data.interactions || []);
                    }
                } catch (e) {
                    console.error(e);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [videoId]);

    // Timer for current time
    useEffect(() => {
        let interval;
        if (player) {
            interval = setInterval(() => {
                const time = player.getCurrentTime();
                setCurrentTime(time);
            }, 500);
        }
        return () => clearInterval(interval);
    }, [player]);

    const handleReady = (event) => {
        setPlayer(event.target);
        setDuration(event.target.getDuration());
    };

    const handleSave = async () => {
        let id = videoId;
        if (!videoId) {
            const res = await api.createVideo(url, title);
            id = res.data.id;
        }
        await api.saveInteractions(id, interactions);
        navigate('/');
    };

    const addInteraction = () => {
        player.pauseVideo();
        setCurrentInteraction({
            id: Date.now().toString(),
            timestamp: currentTime,
            type: 'mc',
            question: '',
            options: ['', ''],
            correctAnswer: 0
        });
        setIsInteractionOpen(true);
    };

    const saveInteraction = () => {
        setInteractions([...interactions, currentInteraction].sort((a, b) => a.timestamp - b.timestamp));
        setIsInteractionOpen(false);
        player.playVideo();
    };

    const deleteInteraction = (id) => {
        setInteractions(interactions.filter(i => i.id !== id));
    };

    const getYouTubeID = (url) => {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7].length === 11) ? match[7] : false;
    };

    const videoIdFromUrl = getYouTubeID(url);

    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar / Interaction List */}
            <div className="w-80 border-r bg-card p-4 overflow-y-auto hidden md:flex flex-col">
                <div className="flex items-center gap-2 mb-6 text-muted-foreground hover:text-foreground cursor-pointer" onClick={() => navigate('/')}>
                    <ArrowLeft size={20} />
                    <span>Back to Dashboard</span>
                </div>

                <h2 className="font-bold text-lg mb-4">Interactions</h2>

                <div className="flex-1 space-y-3">
                    {interactions.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">No interactions added yet. Pause the video to add one!</p>
                    ) : (
                        interactions.map(item => (
                            <div key={item.id} className="p-3 border rounded-md bg-muted/30 text-sm hover:bg-muted cursor-pointer" onClick={() => {
                                player.seekTo(item.timestamp);
                                startEditingInteraction(item);
                            }}>
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-mono text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                                        {formatTime(item.timestamp)}
                                    </span>
                                    <button onClick={(e) => { e.stopPropagation(); deleteInteraction(item.id); }} className="text-destructive hover:text-destructive/80">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <p className="line-clamp-2 font-medium">{item.question}</p>
                                <span className="text-xs text-muted-foreground uppercase">{item.type}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="h-16 border-b flex items-center justify-between px-6 bg-card">
                    <input
                        className="text-xl font-bold bg-transparent border-none focus:outline-none w-1/2"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Lesson Title"
                    />
                    <div className="flex gap-3">
                        <button
                            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors shadow-sm"
                            onClick={handleSave}
                        >
                            <Save size={18} /> Save Lesson
                        </button>
                    </div>
                </header>

                {/* Editor Area */}
                <div className="flex-1 p-6 overflow-y-auto bg-muted/10">
                    <div className="max-w-4xl mx-auto">
                        {!url || !videoIdFromUrl ? (
                            <div className="bg-card p-12 rounded-lg border shadow-sm text-center">
                                <h3 className="text-2xl font-bold mb-4">Paste YouTube URL to start</h3>
                                <div className="flex gap-2 max-w-lg mx-auto">
                                    <input
                                        className="flex-1 p-2 border rounded-md"
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Video Wrapper */}
                                <div className="aspect-video bg-black rounded-lg overflow-hidden relative shadow-lg">
                                    <YouTube
                                        videoId={videoIdFromUrl}
                                        opts={{ width: '100%', height: '100%', playerVars: { rel: 0, modestbranding: 1 } }}
                                        className="absolute inset-0 w-full h-full"
                                        onReady={handleReady}
                                        onStateChange={(e) => {
                                            if (e.data === YouTube.PlayerState.PAUSED) {
                                                // Optional: auto-open interaction modal?
                                            }
                                        }}
                                    />
                                </div>

                                {/* Controls */}
                                <div className="bg-card p-4 rounded-lg border shadow-sm flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-muted-foreground">Current Time</span>
                                            <span className="font-mono text-xl tabular-nums">{formatTime(currentTime)}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={addInteraction}
                                        disabled={!player}
                                        className="flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md font-medium transition-colors"
                                    >
                                        <Plus size={18} /> Add Interaction
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Interaction Modal */}
            {isInteractionOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-card w-full max-w-md rounded-lg shadow-xl border p-6 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-bold mb-4">Add Interaction at {formatTime(currentInteraction.timestamp)}</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Type</label>
                                <select
                                    className="w-full p-2 border rounded-md bg-background"
                                    value={currentInteraction.type}
                                    onChange={(e) => setCurrentInteraction({ ...currentInteraction, type: e.target.value })}
                                >
                                    <option value="mc">Multiple Choice</option>
                                    <option value="open">Open Ended</option>
                                    <option value="note">Note</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Question / Note Content</label>
                                <textarea
                                    className="w-full p-2 border rounded-md bg-background"
                                    rows={3}
                                    value={currentInteraction.question}
                                    onChange={(e) => setCurrentInteraction({ ...currentInteraction, question: e.target.value })}
                                    placeholder="Enter your question here..."
                                />
                            </div>

                            {currentInteraction.type === 'mc' && (
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium">Options</label>
                                    {currentInteraction.options.map((opt, idx) => (
                                        <div key={idx} className="flex gap-2 items-center">
                                            <input
                                                type="radio"
                                                name="correct"
                                                checked={currentInteraction.correctAnswer === idx}
                                                onChange={() => setCurrentInteraction({ ...currentInteraction, correctAnswer: idx })}
                                            />
                                            <input
                                                className="flex-1 p-2 border rounded-md text-sm bg-background"
                                                value={opt}
                                                onChange={(e) => {
                                                    const newOpts = [...currentInteraction.options];
                                                    newOpts[idx] = e.target.value;
                                                    setCurrentInteraction({ ...currentInteraction, options: newOpts });
                                                }}
                                                placeholder={`Option ${idx + 1}`}
                                            />
                                            <button
                                                onClick={() => {
                                                    const newOpts = currentInteraction.options.filter((_, i) => i !== idx);
                                                    setCurrentInteraction({ ...currentInteraction, options: newOpts });
                                                }}
                                                className="text-muted-foreground hover:text-destructive"
                                            >
                                                x
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        className="text-sm text-primary hover:underline"
                                        onClick={() => setCurrentInteraction({ ...currentInteraction, options: [...currentInteraction.options, ''] })}
                                    >
                                        + Add Option
                                    </button>
                                </div>
                            )}

                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md"
                                    onClick={() => {
                                        setIsInteractionOpen(false);
                                        player.playVideo();
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                                    onClick={saveInteraction}
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

const startEditingInteraction = (item) => {
    // TODO: implement editing existing interaction
    console.log("Edit", item);
};

export default Editor;
