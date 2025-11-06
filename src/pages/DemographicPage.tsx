/**
 * DEMOGRAPHIC PAGE - STUDY ENTRY POINT
 *
 * Purpose:
 * - First page in the study flow
 * - Displays informed consent document for participants
 * - Collects demographic information (age, gender, AI experience, moral reasoning experience)
 * - Creates initial user session in database
 *
 * Dependencies:
 * - react-router-dom: Navigation to next page
 * - lucide-react: UI icons
 * - DatabaseService: Database operations
 *
 * Direct Database Calls:
 * 1. DatabaseService.createUserSession()
 *    - Creates new record in 'user_sessions' table
 *    - Stores: session_id, demographics, age, gender, ai_experience, moral_reasoning_experience
 *    - Stores: consent_agreed (boolean), consent_timestamp
 *
 * Data Stored in Database (user_sessions table):
 * - session_id: Unique identifier generated for this session
 * - user_id: Optional user identifier (currently null)
 * - demographics: Complete demographic data object
 * - age: Participant's age (integer)
 * - gender: Participant's gender
 * - ai_experience: Level of AI experience
 * - moral_reasoning_experience: Level of moral reasoning experience
 * - consent_agreed: Boolean indicating consent was given
 * - consent_timestamp: ISO timestamp when consent was provided
 * - created_at: Automatic timestamp
 *
 * Data Stored in localStorage:
 * - 'userConsent': { agreed: boolean, timestamp: string }
 * - 'userDemographics': { age, gender, aiExperience, moralReasoningExperience }
 * - 'currentSessionId': Unique session identifier
 *
 * Flow Position: Step 1 of 13
 * Next Page: /explicitvaluepage
 *
 * Notes:
 * - Clears all localStorage on mount to ensure clean start
 * - Requires all fields to be filled before proceeding
 * - Age must be between 18-120
 * - Consent checkbox must be checked to proceed
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircleUser as UserCircle, ArrowRight, Flame, Shield, Users, Zap, Info } from 'lucide-react';
import { MongoService } from '../lib/mongoService';

const DemographicPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    aiExperience: '',
    moralReasoningExperience: ''
  });
  const [error, setError] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [showDemographics, setShowDemographics] = useState(false);

  useEffect(() => {
    // Clear all localStorage data when demographics page loads to ensure fresh start
    localStorage.clear();
    
    // Trigger entrance animation
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  const handleConsentConfirm = () => {
    if (!consentChecked) {
      return;
    }

    const consentTimestamp = new Date().toISOString();
    localStorage.setItem('userConsent', JSON.stringify({
      agreed: true,
      timestamp: consentTimestamp
    }));

    setConsentGiven(true);
    setTimeout(() => {
      setShowDemographics(true);
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.age || !formData.gender || !formData.aiExperience || !formData.moralReasoningExperience) {
      setError('Please fill in all fields');
      return;
    }

    const age = parseInt(formData.age);
    if (isNaN(age) || age < 18 || age > 120) {
      setError('Please enter a valid age between 18 and 120');
      return;
    }

    localStorage.setItem('userDemographics', JSON.stringify(formData));

    const sessionId = MongoService.generateSessionId();
    localStorage.setItem('currentSessionId', sessionId);

    const consentData = JSON.parse(localStorage.getItem('userConsent') || '{}');

    await MongoService.createUserSession({
      session_id: sessionId,
      demographics: formData,
      consent_agreed: consentData.agreed || false,
      consent_timestamp: consentData.timestamp
    });

    navigate('/explicitvaluepage');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-200/30 to-red-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-yellow-200/30 to-orange-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-red-100/20 to-orange-100/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <Flame className="absolute top-20 left-20 text-orange-300/40 animate-bounce" size={32} style={{ animationDelay: '0s', animationDuration: '3s' }} />
        <Shield className="absolute top-32 right-32 text-red-300/40 animate-bounce" size={28} style={{ animationDelay: '1s', animationDuration: '4s' }} />
        <Users className="absolute bottom-32 left-32 text-yellow-300/40 animate-bounce" size={30} style={{ animationDelay: '2s', animationDuration: '3.5s' }} />
        <Zap className="absolute bottom-20 right-20 text-orange-300/40 animate-bounce" size={26} style={{ animationDelay: '0.5s', animationDuration: '4.5s' }} />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div className={`w-full max-w-4xl transition-all duration-1000 transform ${
          isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          {!consentGiven ? (
            <div className={`transition-all duration-500 ${consentGiven ? 'opacity-0 translate-x-[-100%]' : 'opacity-100 translate-x-0'}`}>
              <div className="bg-white/90 backdrop-blur-lg shadow-2xl rounded-2xl border border-white/50 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-red-600 px-8 py-6">
                  <h1 className="text-3xl font-bold text-white text-center">Informed Consent</h1>
                  <p className="text-orange-50 text-center mt-2">Please read this consent document carefully before you decide to participate in this study.</p>
                </div>

                <div className="px-8 py-6 max-h-[65vh] overflow-y-auto custom-scrollbar">
                  <div className="space-y-6 text-gray-700">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2">Study Title</h2>
                      <p className="leading-relaxed">
                        Negotiation and Cognitive Value Recontextualization for Consistency Assessment in Human-AI Collaboration: Advancing Joint Decision-Making through Adaptive Preference Alignment
                      </p>
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2">Purpose of the Study</h2>
                      <p className="leading-relaxed mb-3">
                        This study builds on the Moral Machine Experiment, which examined how people make ethical trade-offs in complex situations. It explores how humans collaborate with multiple AI expert agents—each representing values such as Safety, Efficiency, Fairness, Sustainability, and Non-maleficence—during simulated wildfire emergencies.
                      </p>
                      <p className="leading-relaxed mb-3">
                        The experiment applies two frameworks: <strong>Cognitive Value Recontextualization (CVR)</strong>, which examines how people reinterpret their values in new contexts, and <strong>Adaptive Preference Alignment (APA)</strong>, which studies how human and AI preferences can be aligned for more ethical and transparent decisions.
                      </p>
                      <p className="leading-relaxed">
                        The goal is to better understand how AI can support human moral reasoning and decision-making in high-stakes scenarios.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2">Procedures</h2>
                      <p className="leading-relaxed mb-3">
                        This experiment will be conducted entirely online through a web-based simulation platform. Participants will begin by completing a brief demographic questionnaire, followed by two value-assessment phases:
                      </p>
                      <ol className="list-decimal list-inside space-y-2 ml-4 mb-3">
                        <li className="leading-relaxed"><strong>Explicit Value Questionnaire</strong> – consisting of simple, everyday scenarios designed to identify stable personal values.</li>
                        <li className="leading-relaxed"><strong>Implicit Value Questionnaire</strong> – involving mid-level contextual scenarios to reveal how values shift across different situations.</li>
                      </ol>
                      <p className="leading-relaxed mb-3">
                        Based on these responses, the system generates each participant's evaluated stable and context-dependent value profile.
                      </p>
                      <p className="leading-relaxed mb-3">
                        Next, participants will engage with three interactive wildfire scenarios. In each scenario, they will receive guidance from multiple AI expert agents, each representing a distinct ethical or operational perspective (e.g., Safety, Efficiency, Fairness, Sustainability, and Non-maleficence). Participants will then decide how to allocate firefighting resources based on the agents' recommendations and their own judgment.
                      </p>
                      <p className="leading-relaxed mb-3">
                        After completing the scenarios, participants will be asked to respond to brief follow-up questions that evaluate their reasoning, satisfaction, and overall experience.
                      </p>
                      <p className="leading-relaxed">
                        The full session will take approximately <strong>20–35 minutes</strong> and can be completed in one sitting using a computer or tablet.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2">Potential Risks of Participating</h2>
                      <p className="leading-relaxed">
                        There are no known risks beyond what you'd normally experience using a computer. Some people might feel brief mental fatigue or mild stress when facing moral trade-offs (like choosing between difficult rescue options), but you can pause or stop at any time.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2">Potential Benefits of Participating</h2>
                      <p className="leading-relaxed">
                        By taking part, you'll help us learn how people and AI can work together to make better decisions during emergency situations like wildfires. Your participation will help researchers design future AI systems that are more ethical, transparent, and human-centered tools that could improve safety and decision support in real-world disaster response. You may also find it interesting to see how your own values and reasoning compare to the AI experts' perspectives.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2">Compensation</h2>
                      <p className="leading-relaxed">
                        Those who are taking designated undergraduate-level courses may be eligible to receive extra credit upon the completion of the study.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2">Confidentiality</h2>
                      <p className="leading-relaxed">
                        Your responses will remain completely anonymous. No names, emails, or identifiable information will be collected. Data will be stored on secure, password-protected servers accessible only to the research team. Results will be reported in aggregate form only, ensuring that no individual participant can be identified.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2">Voluntary Participation</h2>
                      <p className="leading-relaxed">
                        Your participation in this study is completely voluntary. There is no penalty for not participating. You may also refuse to answer questions that are asked in the study.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2">Right to Withdraw from the Study</h2>
                      <p className="leading-relaxed">
                        You have the right to withdraw from the study at any time without consequence.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2">Whom to Contact if You Have Questions</h2>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        <div>
                          <p className="font-semibold text-gray-900">About the study:</p>
                          <p>Waseem Samkari, Ph.D. Candidate</p>
                          <p>College of Engineering and Science</p>
                          <p>Florida Institute of Technology</p>
                          <p>Email: <a href="mailto:wsamkari2022@my.fit.edu" className="text-orange-600 hover:text-orange-700 underline">wsamkari2022@my.fit.edu</a></p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">About your rights as a research participant:</p>
                          <p>Dr. Jignya Patel, IRB Chairperson</p>
                          <p>150 West University Blvd.</p>
                          <p>Melbourne, FL 32901</p>
                          <p>Email: <a href="mailto:FIT_IRB@fit.edu" className="text-orange-600 hover:text-orange-700 underline">FIT_IRB@fit.edu</a></p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t-2 border-orange-200 pt-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-4">Agreement</h2>
                      <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6">
                        <label className="flex items-start gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={consentChecked}
                            onChange={(e) => setConsentChecked(e.target.checked)}
                            className="mt-1 w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500 focus:ring-2 cursor-pointer"
                          />
                          <span className="text-gray-800 leading-relaxed group-hover:text-gray-900 transition-colors">
                            I have read the procedure described above. I voluntarily agree to participate in the procedure and I have received a copy of this description.
                          </span>
                        </label>

                        <button
                          onClick={handleConsentConfirm}
                          disabled={!consentChecked}
                          className={`mt-6 w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-200 ${
                            consentChecked
                              ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 hover:shadow-lg transform hover:scale-105 cursor-pointer'
                              : 'bg-gray-300 cursor-not-allowed opacity-60'
                          }`}
                        >
                          Confirm and Continue
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={`transition-all duration-500 ${showDemographics ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-[100%]'}`}>
              <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {/* Left Side - Title and Features */}
            <div className="flex-1 text-center lg:text-left">
              <div className="flex justify-center lg:justify-start mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
                  <div className="relative bg-gradient-to-r from-orange-500 to-red-600 p-3 rounded-full shadow-2xl">
                    <UserCircle className="h-10 w-10 text-white" />
                  </div>
                </div>
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-yellow-600 bg-clip-text text-transparent mb-3">
                Wildfire Crisis Simulation
              </h1>
              <div className="w-20 h-1 bg-gradient-to-r from-orange-400 to-red-500 mx-auto lg:mx-0 rounded-full mb-4"></div>
              <p className="text-base text-gray-700 leading-relaxed mb-6">
                Experience ethical decision-making in crisis scenarios. Your choices will help us understand how values influence critical decisions.
              </p>

              {/* Feature Highlights - Horizontal on larger screens */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-white/70 backdrop-blur-sm p-3 rounded-lg shadow border border-white/50">
                  <Flame className="h-5 w-5 text-orange-500 mb-1 mx-auto lg:mx-0" />
                  <h3 className="font-semibold text-gray-800 text-xs">Crisis Management</h3>
                </div>
                <div className="bg-white/70 backdrop-blur-sm p-3 rounded-lg shadow border border-white/50">
                  <Shield className="h-5 w-5 text-red-500 mb-1 mx-auto lg:mx-0" />
                  <h3 className="font-semibold text-gray-800 text-xs">Ethical Decisions</h3>
                </div>
                <div className="bg-white/70 backdrop-blur-sm p-3 rounded-lg shadow border border-white/50">
                  <Users className="h-5 w-5 text-yellow-500 mb-1 mx-auto lg:mx-0" />
                  <h3 className="font-semibold text-gray-800 text-xs">Impact Analysis</h3>
                </div>
                <div className="bg-white/70 backdrop-blur-sm p-3 rounded-lg shadow border border-white/50">
                  <Zap className="h-5 w-5 text-orange-500 mb-1 mx-auto lg:mx-0" />
                  <h3 className="font-semibold text-gray-800 text-xs">Expert Insights</h3>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-96 flex-shrink-0">
              <div className="bg-white/80 backdrop-blur-lg py-6 px-6 shadow-2xl rounded-2xl border border-white/50">
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="age" className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Age
                    </label>
                    <input
                      id="age"
                      name="age"
                      type="number"
                      required
                      min="18"
                      max="120"
                      value={formData.age}
                      onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                      className="appearance-none block w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white/90 backdrop-blur-sm"
                      placeholder="Enter your age"
                    />
                  </div>

                  <div>
                    <label htmlFor="gender" className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Gender
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      required
                      value={formData.gender}
                      onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                      className="appearance-none block w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white/90 backdrop-blur-sm text-gray-700"
                    >
                      <option value="">Select your gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Dealing with AI Systems
                    </label>
                    <div className="flex gap-2">
                      {['Never', 'Rarely', 'Often', 'Very Often', 'Most of the Time'].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, aiExperience: level }))}
                          className={`flex-1 py-2 px-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                            formData.aiExperience === level
                              ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg scale-105'
                              : 'bg-white/90 text-gray-700 border border-gray-200 hover:border-orange-300 hover:shadow-md'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                      Experience with Moral Reasoning
                      <div className="relative">
                        <button
                          type="button"
                          onMouseEnter={() => setShowTooltip(true)}
                          onMouseLeave={() => setShowTooltip(false)}
                          onClick={() => setShowTooltip(!showTooltip)}
                          className="text-orange-500 hover:text-orange-600 transition-colors"
                        >
                          <Info size={16} />
                        </button>
                        {showTooltip && (
                          <div className="absolute left-0 top-6 z-50 bg-gray-800 text-white text-xs rounded-lg py-2 px-3 shadow-xl whitespace-nowrap">
                            i.e., Philosophy Class, Moral Machine
                            <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-800 transform rotate-45"></div>
                          </div>
                        )}
                      </div>
                    </label>
                    <div className="flex gap-2">
                      {['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, moralReasoningExperience: level }))}
                          className={`flex-1 py-2 px-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                            formData.moralReasoningExperience === level
                              ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg scale-105'
                              : 'bg-white/90 text-gray-700 border border-gray-200 hover:border-orange-300 hover:shadow-md'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-2.5 animate-shake">
                      <p className="text-red-600 text-sm font-medium">{error}</p>
                    </div>
                  )}

                  <div>
                    <button
                      type="submit"
                      className="group relative w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200 transform hover:scale-105 hover:shadow-xl"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-200"></span>
                      <span className="relative flex items-center">
                        Begin Assessment
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                      </span>
                    </button>
                  </div>
                </form>

                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    Your responses will be used for research purposes only
                  </p>
                </div>
              </div>
            </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #f97316, #dc2626);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #ea580c, #b91c1c);
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default DemographicPage;