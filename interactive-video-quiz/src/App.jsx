import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Editor from './pages/Editor';
import Lesson from './pages/Lesson';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/editor/:videoId" element={<Editor />} />
          <Route path="/watch/:videoId" element={<Lesson />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
