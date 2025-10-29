import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircleUser as UserCircle, ArrowRight, Flame, Shield, Users, Zap, Info } from 'lucide-react';
import { DatabaseService } from '../lib/databaseService';

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

  useEffect(() => {
    // Clear all localStorage data when demographics page loads to ensure fresh start
    localStorage.clear();
    
    // Trigger entrance animation
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

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

    const sessionId = DatabaseService.generateSessionId();
    localStorage.setItem('currentSessionId', sessionId);

    await DatabaseService.createUserSession({
      session_id: sessionId,
      demographics: formData
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

      <div className="relative z-10 h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className={`w-full max-w-4xl transition-all duration-1000 transform ${
          isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
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
                      Experience with AI Systems
                    </label>
                    <div className="flex gap-2">
                      {['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, aiExperience: level }))}
                          className={`flex-1 py-2 px-2 text-xs font-medium rounded-lg transition-all duration-200 ${
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
      </div>

      <style jsx>{`
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