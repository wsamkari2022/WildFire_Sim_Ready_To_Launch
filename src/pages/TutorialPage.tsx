/**
 * TUTORIAL PAGE - PRE-SIMULATION INSTRUCTIONS
 *
 * Purpose:
 * - Provides video tutorial explaining the simulation interface and process
 * - Prepares participants for the wildfire crisis scenarios
 * - Ensures participants understand decision-making mechanics
 * - Transition between value assessment and simulation phases
 *
 * Dependencies:
 * - react-router-dom: Navigation
 * - lucide-react: UI icons
 * - YouTube iframe API: Video player integration
 *
 * Direct Database Calls:
 * - None (instructional page only)
 *
 * Data Accessed from localStorage:
 * - None directly (preparation page before simulation)
 *
 * Flow Position: Step 6 of 13
 * Previous Page: /values
 * Next Page: /simulation
 *
 * Features:
 * - Embedded YouTube tutorial video
 * - Video completion tracking via YouTube API
 * - Manual "I've watched" confirmation option
 * - Replay functionality
 * - Proceed button disabled until video watched
 * - Tutorial overview bullet points
 *
 * Notes:
 * - Critical preparation step before main simulation
 * - Listens to YouTube postMessage events to detect video completion
 * - Users can manually mark as watched if needed
 * - No data persistence required (purely instructional)
 * - Video ID: VbISk2VL0G8 (can be updated as needed)
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, ArrowRight, Video, RotateCcw, CheckCircle } from 'lucide-react';

const TutorialPage: React.FC = () => {
  const navigate = useNavigate();
  const [hasWatchedVideo, setHasWatchedVideo] = useState(false);
  const [videoStarted, setVideoStarted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleReplay = () => {
    if (iframeRef.current) {
      const videoId = 'VbISk2VL0G8';
      iframeRef.current.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&rel=0`;
      setVideoStarted(true);
    }
  };

  const handleProceed = () => {
    navigate('/simulation');
  };

  const handleMarkAsWatched = () => {
    setHasWatchedVideo(true);
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin === 'https://www.youtube.com') {
        try {
          const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

          if (data.event === 'onStateChange') {
            if (data.info === 1) {
              setVideoStarted(true);
            } else if (data.info === 0) {
              setHasWatchedVideo(true);
            }
          }
        } catch (e) {
          console.log('YouTube message parsing error:', e);
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3">
            <Video className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              Simulation Tutorial
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-8 mb-8 border border-blue-100">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-white rounded-full p-4 shadow-md">
              <PlayCircle className="h-12 w-12 text-blue-600" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Before You Begin the Simulation
          </h2>

          <p className="text-center text-gray-700 text-lg mb-6 max-w-2xl mx-auto">
            Please watch this tutorial video to understand how the wildfire crisis simulation works.
            The video will explain the interface, decision-making process, and what to expect during the simulation.
          </p>

          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <div className="relative" style={{ paddingBottom: '56.25%', height: 0 }}>
              <iframe
                ref={iframeRef}
                className="absolute top-0 left-0 w-full h-full rounded-lg"
                src="https://www.youtube.com/embed/VbISk2VL0G8?enablejsapi=1&rel=0"
                title="Simulation Tutorial Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 justify-center items-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full">
              <button
                onClick={handleReplay}
                className="flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors duration-300 font-semibold shadow-md hover:shadow-lg"
              >
                <RotateCcw className="h-5 w-5" />
                Replay Video
              </button>

              {!hasWatchedVideo && (
                <button
                  onClick={handleMarkAsWatched}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300 font-semibold shadow-md hover:shadow-lg"
                >
                  <CheckCircle className="h-5 w-5" />
                  I've Watched the Video
                </button>
              )}

              <button
                onClick={handleProceed}
                disabled={!hasWatchedVideo}
                className={`flex items-center gap-2 px-8 py-3 rounded-lg font-semibold shadow-md transition-all duration-300 ${
                  hasWatchedVideo
                    ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg transform hover:-translate-y-0.5'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Proceed to Simulation
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {!hasWatchedVideo && (
            <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> After watching the video, click "I've Watched the Video" to enable the proceed button.
                You can pause and resume the video at any time using the YouTube controls.
              </p>
            </div>
          )}

          {hasWatchedVideo && (
            <div className="mt-6 bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
              <p className="text-sm text-green-800">
                <strong>Ready!</strong> You can now proceed to the simulation. If you'd like to review anything,
                feel free to replay the video before continuing.
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            What You'll Learn in This Tutorial
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>How to evaluate different decision options in the simulation</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Understanding the metrics and their impact on your decisions</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>How to explore alternative options and make informed choices</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>What to expect as you progress through the wildfire crisis scenarios</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default TutorialPage;
