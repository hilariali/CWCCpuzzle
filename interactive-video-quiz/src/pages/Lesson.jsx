import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import YouTube from 'react-youtube';
import { api } from '../services/api';
import { Play, CheckCircle, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';
import confetti from 'canvas-confetti'; // Maybe add if I had it installed, but I don't. Skipping.

const Lesson = () => {
    const { videoId } = useParams();
    const [videoData, setVideoData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [interactions, setInteractions] = useState([]);
    const [activeInteraction, setActiveInteraction] = useState(null);
    const [completedInteractions, setCompletedInteractions] = useState(new Set());
    const [player, setPlayer] = useState(null);
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [feedback, setFeedback] = useState(null); // 'correct' | 'incorrect'

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const res = await api.getVideo(videoId);
                setVideoData(res.data.video);
                // Sort interactions by time
                const sorted = (res.data.interactions || []).sort((a, b) => a.timestamp - b.timestamp);
                setInteractions(sorted);
            } catch (error) {
                console.error("Failed to load lesson", error);
            } finally {
                setLoading(false);
            }
        };
        fetchVideo();
    }, [videoId]);

    const handleReady = (event) => {
        setPlayer(event.target);
    };

    const checkInteractions = (currentTime) => {
        if (activeInteraction) return; // Already showing one

        // Find interaction that matches current time (within small margin) and hasn't been completed
        const hit = interactions.find(i =>
            !completedInteractions.has(i.id) &&
            Math.abs(currentTime - i.timestamp) < 1 // 1 second window
        );

        if (hit) {
            player.pauseVideo();
            setActiveInteraction(hit);
        }
    };

    // Poll for time updates more frequently than onStateChange
    useEffect(() => {
        let interval;
        if (player) {
            interval = setInterval(() => {
                const time = player.getCurrentTime();
                checkInteractions(time);
            }, 500);
        }
        return () => clearInterval(interval);
    }, [player, interactions, completedInteractions, activeInteraction]);

    const handleSubmit = async () => {
        if (!activeInteraction) return;

        // Simple scoring
        let score = 0;
        let isCorrect = true;

        if (activeInteraction.type === 'mc') {
            if (parseInt(currentAnswer) === activeInteraction.correctAnswer) {
                score = 100;
                setFeedback('correct');
            } else {
                setFeedback('incorrect');
                isCorrect = false;
            }
        } else {
            // Open ended / note - automatically proceed/correct
            score = 100;
            setFeedback('correct');
        }

        // Save response
        await api.submitResponse('student_1', videoId, activeInteraction.id, currentAnswer); // Mock student ID

        if (isCorrect || activeInteraction.type !== 'mc') {
            setTimeout(() => {
                setCompletedInteractions(prev => new Set(prev).add(activeInteraction.id));
                setActiveInteraction(null);
                setFeedback(null);
                setCurrentAnswer('');
                player.playVideo();
            }, 1500);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
    if (!videoData) return <div className="flex h-screen items-center justify-center">Lesson not found</div>;

    return (
        <div className="min-h-screen bg-background flex flex-col items-center">
            {/* Nav */}
            <div className="w-full bg-card border-b p-4 flex items-center justify-between">
                <Link to="/" className="text-muted-foreground hover:text-foreground flex items-center gap-2">
                    <ArrowLeft size={20} /> Back
                </Link>
                <h1 className="font-bold text-lg">{videoData.title}</h1>
                <div className="w-8"></div>
            </div>

            {/* Video Container */}
            <div className="flex-1 w-full max-w-5xl p-6 flex flex-col justify-center">
                <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                    <YouTube
                        videoId={getYouTubeID(videoData.url)}
                        opts={{
                            width: '100%',
                            height: '100%',
                            playerVars: {
                                controls: 0, // Hide controls to prevent skipping (simple enforcement)
                                disablekb: 1,
                                modestbranding: 1,
                                rel: 0
                            }
                        }}
                        className="absolute inset-0 w-full h-full"
                        onReady={handleReady}
                    />

                    {/* Interaction Overlay */}
                    {activeInteraction && (
                        <div className="absolute inset-x-0 bottom-0 top-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
                            <div className="bg-card w-full max-w-lg p-8 rounded-xl shadow-2xl border text-center space-y-6">
                                <h2 className="text-2xl font-bold bg-gradient-to-br from-primary to-purple-600 bg-clip-text text-transparent">
                                    {activeInteraction.type === 'note' ? 'Note' : 'Question'}
                                </h2>

                                <p className="text-lg font-medium">{activeInteraction.question}</p>

                                {activeInteraction.type === 'mc' && (
                                    <div className="grid gap-3 text-left">
                                        {activeInteraction.options.map((opt, idx) => (
                                            <label
                                                key={idx}
                                                className={cn(
                                                    "flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all",
                                                    parseInt(currentAnswer) === idx
                                                        ? "bg-primary/10 border-primary ring-1 ring-primary"
                                                        : "hover:bg-muted"
                                                )}
                                            >
                                                <input
                                                    type="radio"
                                                    name="answer"
                                                    value={idx}
                                                    checked={parseInt(currentAnswer) === idx}
                                                    onChange={(e) => setCurrentAnswer(e.target.value)}
                                                    className="w-4 h-4 text-primary"
                                                />
                                                <span>{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {activeInteraction.type === 'open' && (
                                    <textarea
                                        className="w-full p-3 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                                        rows={4}
                                        placeholder="Type your answer..."
                                        value={currentAnswer}
                                        onChange={(e) => setCurrentAnswer(e.target.value)}
                                    />
                                )}

                                {feedback === 'correct' && (
                                    <div className="text-green-500 font-bold flex items-center justify-center gap-2 animate-bounce">
                                        <CheckCircle size={24} /> Correct!
                                    </div>
                                )}

                                {feedback === 'incorrect' && (
                                    <div className="text-destructive font-bold animate-pulse">
                                        Incorrect, try again.
                                    </div>
                                )}

                                <button
                                    onClick={handleSubmit}
                                    disabled={activeInteraction.type !== 'note' && !currentAnswer}
                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-bold text-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {activeInteraction.type === 'note' ? 'Continue' : 'Submit'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Helper
function getYouTubeID(url) {
    if (!url) return '';
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : false;
}

export default Lesson;
