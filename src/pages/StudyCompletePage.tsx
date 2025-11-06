/**
 * STUDY COMPLETE PAGE - FINAL COMPLETION
 *
 * Purpose:
 * - Final page in the study flow
 * - Confirms complete study participation
 * - Thanks participant for full completion
 * - Records final completion status in database
 * - Displays summary of participant contribution
 *
 * Dependencies:
 * - lucide-react: UI icons
 * - TrackingManager: Event tracking
 * - DatabaseService: Database operations
 *
 * Direct Database Calls:
 * - MongoService.updateSessionStatus()
 *   - Updates 'user_sessions' table with final completion status
 *   - Sets: status='completed', study_fully_completed=true, completed_at timestamp
 *
 * Data Stored in localStorage:
 * - 'sessionEventLogs': Adds 'study_completed' event
 *
 * Data Stored in Database (user_sessions table):
 * - status: 'completed'
 * - study_fully_completed: true
 * - completed_at: ISO timestamp
 *
 * Flow Position: Step 13 of 13 (Final page)
 * Previous Page: /results-feedback
 * Next Page: None (study complete)
 *
 * Notes:
 * - Terminal page in study flow
 * - Provides closure and appreciation
 * - Ensures database records full completion
 * - Adds final telemetry event
 * - No further navigation required
 * - Displays animated completion celebration
 */

import React, { useEffect, useState } from 'react';
import { Heart, Sparkles, CheckCircle, Star, Award, TrendingUp } from 'lucide-react';
import { TrackingManager } from '../utils/trackingUtils';
import { MongoService } from '../lib/mongoService';

const StudyCompletePage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const initCompletion = async () => {
      setIsVisible(true);
      setTimeout(() => setShowContent(true), 300);

      const telemetryEvent = {
        event: 'study_completed' as const,
        timestamp: new Date().toISOString(),
        data: { completionStatus: 'full' }
      };

      const existingLogs = JSON.parse(localStorage.getItem('sessionEventLogs') || '[]');
      existingLogs.push(telemetryEvent);
      localStorage.setItem('sessionEventLogs', JSON.stringify(existingLogs));

      const sessionId = localStorage.getItem('sessionId');
      if (sessionId) {
        await MongoService.updateSessionStatus(sessionId, {
          status: 'completed',
          completed_at: new Date().toISOString(),
          study_fully_completed: true
        });

        await MongoService.syncFallbackData();
      }
    };

    initCompletion();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-500"></div>
      </div>

      <div
        className={`max-w-4xl w-full transition-all duration-1000 transform relative z-10 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-teal-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-green-400 via-teal-500 to-blue-500 rounded-full p-5 shadow-2xl">
                <CheckCircle className="h-20 w-20 text-white" strokeWidth={2.5} />
              </div>
            </div>
          </div>

          <div
            className={`transition-all duration-700 delay-300 ${
              showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-3">
              Study Complete
            </h1>

            <div className="flex justify-center items-center gap-3 mb-8">
              <Sparkles className="h-6 w-6 text-yellow-500" />
              <p className="text-xl text-center text-gray-700 font-medium">
                Your Journey Has Concluded
              </p>
              <Sparkles className="h-6 w-6 text-yellow-500" />
            </div>

            <div className="bg-gradient-to-r from-blue-50 via-teal-50 to-green-50 rounded-2xl p-8 mb-8 border-2 border-teal-200 shadow-inner">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-gradient-to-br from-red-400 to-pink-500 rounded-full p-3 shadow-lg flex-shrink-0">
                  <Heart className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Thank You for Your Invaluable Contribution
                  </h2>
                  <p className="text-gray-800 leading-relaxed text-lg">
                    Your thoughtful participation has provided crucial insights into how individuals navigate complex
                    ethical decisions under pressure. Your engagement throughout this study demonstrates the depth and
                    nuance of human decision-making in challenging circumstances.
                  </p>
                </div>
              </div>

              <div className="space-y-4 ml-0 md:ml-16">
                <p className="text-gray-700 leading-relaxed text-base">
                  Through your careful consideration of each scenario, you have helped advance our understanding of
                  value alignment, moral reasoning, and the intricate relationship between personal beliefs and
                  real-world choices.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-md border-2 border-blue-100 hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-4">
                  <div className="bg-blue-100 rounded-full p-4">
                    <Star className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                  Meaningful Impact
                </h3>
                <p className="text-gray-600 text-center text-sm leading-relaxed">
                  Your decisions contribute to research that may shape future tools for ethical decision-making
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border-2 border-teal-100 hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-4">
                  <div className="bg-teal-100 rounded-full p-4">
                    <Award className="h-8 w-8 text-teal-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                  Exemplary Dedication
                </h3>
                <p className="text-gray-600 text-center text-sm leading-relaxed">
                  Your commitment to completing this comprehensive study reflects exceptional dedication
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border-2 border-green-100 hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-4">
                  <div className="bg-green-100 rounded-full p-4">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                  Advancing Knowledge
                </h3>
                <p className="text-gray-600 text-center text-sm leading-relaxed">
                  Your responses help build a deeper understanding of human values and decision processes
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-slate-50 to-gray-100 rounded-2xl p-8 border-2 border-gray-200">
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  We Wish You All the Best
                </h2>
                <p className="text-gray-700 text-lg leading-relaxed max-w-2xl mx-auto">
                  As you continue on your journey, may you carry forward the thoughtfulness and wisdom you
                  demonstrated throughout this study. Your ability to navigate complex decisions with care and
                  consideration is a valuable strength.
                </p>
                <div className="pt-4">
                  <p className="text-gray-600 font-medium">
                    Thank you once again for your time, effort, and invaluable insights.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t-2 border-gray-200">
              <div className="flex items-center justify-center gap-4 text-gray-500">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">Study Completed Successfully</span>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyCompletePage;
