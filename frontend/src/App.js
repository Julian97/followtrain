import React, { useState, useEffect } from 'react';
import { Plus, Share2, Copy, Users, ExternalLink, Instagram, Facebook, Twitter, Linkedin, MessageCircle, Phone, AlertCircle } from 'lucide-react';

// API Configuration
const API_BASE = window.env?.REACT_APP_API_URL || 
  process.env.REACT_APP_API_URL || 
  (window.location.hostname === 'localhost' 
    ? 'http://localhost:3001/api'
    : 'https://followtrain.zeabur.app/api');

const FollowTrain = () => {
  const [trains, setTrains] = useState({});
  const [currentView, setCurrentView] = useState('create');
  const [currentTrainId, setCurrentTrainId] = useState(null);
  const [shareUrl, setShareUrl] = useState('');
  const [showCopied, setShowCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Platform configurations
  const platforms = {
    instagram: {
      name: 'Instagram',
      icon: Instagram,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      placeholder: 'instagram.com/username or @username',
      urlPattern: /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([A-Za-z0-9_.]+)/,
      deepLink: (username) => `https://instagram.com/${username}`
    },
    tiktok: {
      name: 'TikTok',
      icon: MessageCircle,
      color: 'bg-black',
      placeholder: 'tiktok.com/@username or @username',
      urlPattern: /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@([A-Za-z0-9_.]+)/,
      deepLink: (username) => `https://tiktok.com/@${username}`
    },
    twitter: {
      name: 'Twitter/X',
      icon: Twitter,
      color: 'bg-black',
      placeholder: 'x.com/username or @username',
      urlPattern: /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/([A-Za-z0-9_]+)/,
      deepLink: (username) => `https://x.com/${username}`
    },
    linkedin: {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-blue-600',
      placeholder: 'linkedin.com/in/username',
      urlPattern: /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([A-Za-z0-9-]+)/,
      deepLink: (username) => `https://linkedin.com/in/${username}`
    },
    facebook: {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600',
      placeholder: 'facebook.com/username',
      urlPattern: /(?:https?:\/\/)?(?:www\.)?facebook\.com\/([A-Za-z0-9.]+)/,
      deepLink: (username) => `https://facebook.com/${username}`
    },
    telegram: {
      name: 'Telegram',
      icon: MessageCircle,
      color: 'bg-blue-500',
      placeholder: 't.me/username or @username',
      urlPattern: /(?:https?:\/\/)?(?:www\.)?t\.me\/([A-Za-z0-9_]+)/,
      deepLink: (username) => `https://t.me/${username}`
    }
  };

  // Generate random train ID
  const generateTrainId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  // Extract username from URL or handle
  const extractUsername = (input, platform) => {
    const config = platforms[platform];
    if (!config) return null;

    // Remove @ symbol if present
    let cleaned = input.replace(/^@/, '');
    
    // Try to match URL pattern
    const match = cleaned.match(config.urlPattern);
    if (match) {
      return match[1];
    }
    
    // If no URL pattern matched, assume it's just a username
    return cleaned.replace(/[^A-Za-z0-9_.]/g, '');
  };

  // API Helper Functions
  const apiCall = async (endpoint, options = {}) => {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  // Fetch profile data from social media APIs
  const fetchProfileData = async (username, platform) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiCall(`/profile/${platform}/${username}`);
      return data;
    } catch (error) {
      // Fallback to mock data if API fails
      console.warn('API failed, using fallback data:', error);
      return {
        username,
        displayName: username.charAt(0).toUpperCase() + username.slice(1),
        bio: `${platforms[platform].name} user`,
        avatar: `https://ui-avatars.com/api/?name=${username}&background=random`,
        followers: Math.floor(Math.random() * 10000),
        isVerified: false
      };
    } finally {
      setLoading(false);
    }
  };

  // Load train data from backend
  const loadTrain = async (trainId) => {
    try {
      setLoading(true);
      const train = await apiCall(`/trains/${trainId}`);
      setTrains(prev => ({ ...prev, [trainId]: train }));
      return train;
    } catch (error) {
      setError('Failed to load train data');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Save train to backend
  const saveTrain = async (train) => {
    try {
      const savedTrain = await apiCall('/trains', {
        method: 'POST',
        body: JSON.stringify(train)
      });
      return savedTrain;
    } catch (error) {
      console.error('Failed to save train:', error);
      // Continue with local storage as fallback
      return train;
    }
  };

  // Update train in backend
  const updateTrain = async (trainId, updates) => {
    try {
      const updatedTrain = await apiCall(`/trains/${trainId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      });
      return updatedTrain;
    } catch (error) {
      console.error('Failed to update train:', error);
      // Continue with local updates as fallback
      return { ...trains[trainId], ...updates };
    }
  };

  // Create new train
  const createTrain = async (platform, userInput, trainName = null) => {
    const trainId = generateTrainId();
    const username = extractUsername(userInput, platform);
    
    if (!username) {
      setError('Please enter a valid profile URL or username');
      return;
    }

    try {
      setError(null);
      const profileData = await fetchProfileData(username, platform);
      
      const newTrain = {
        id: trainId,
        name: trainName || `${platforms[platform].name} Train`,
        platform,
        participants: [{
          ...profileData,
          isHost: true,
          joinedAt: new Date().toISOString()
        }],
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      };

      // Save to backend
      const savedTrain = await saveTrain(newTrain);
      
      setTrains(prev => ({ ...prev, [trainId]: savedTrain }));
      setCurrentTrainId(trainId);
      setShareUrl(`${window.location.origin}?train=${trainId}`);
      setCurrentView('train');
      
      // Analytics tracking
      if (typeof gtag !== 'undefined') {
        gtag('event', 'train_created', {
          platform: platform,
          participants_count: 1
        });
      }
      
    } catch (error) {
      setError('Error creating train. Please try again.');
      console.error('Create train error:', error);
    }
  };

  // Join existing train
  const joinTrain = async (trainId, userInput) => {
    const train = trains[trainId];
    if (!train) return;

    const username = extractUsername(userInput, train.platform);
    if (!username) {
      setError('Please enter a valid profile URL or username');
      return;
    }

    // Check if user already joined
    const alreadyJoined = train.participants.some(p => p.username.toLowerCase() === username.toLowerCase());
    if (alreadyJoined) {
      setError('This profile is already in the train!');
      return;
    }

    try {
      setError(null);
      const profileData = await fetchProfileData(username, train.platform);
      
      const newParticipant = {
        ...profileData,
        isHost: false,
        joinedAt: new Date().toISOString()
      };
      
      const updatedTrain = await updateTrain(trainId, {
        participants: [...train.participants, newParticipant]
      });
      
      setTrains(prev => ({
        ...prev,
        [trainId]: updatedTrain
      }));
      
      // Analytics tracking
      if (typeof gtag !== 'undefined') {
        gtag('event', 'train_joined', {
          platform: train.platform,
          participants_count: updatedTrain.participants.length
        });
      }
      
    } catch (error) {
      setError('Error joining train. Please try again.');
      console.error('Join train error:', error);
    }
  };

  // Copy share URL
  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  // Open profile in app
  const openProfile = (participant, platform) => {
    const config = platforms[platform];
    const url = config.deepLink(participant.username);
    window.open(url, '_blank');
  };

  // Check for train ID in URL on load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const trainId = urlParams.get('train');
    if (trainId) {
      // Try to load from backend first
      loadTrain(trainId).then(train => {
        if (train) {
          setCurrentTrainId(trainId);
          setCurrentView('train');
        }
      });
    }
  }, []);

  // Error Alert Component
  const ErrorAlert = ({ message, onClose }) => {
    if (!message) return null;
    
    return (
      <div className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-800 text-sm">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      </div>
    );
  };

  // Loading Component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
    </div>
  );

  // Create Train View
  const CreateTrainView = () => {
    const [selectedPlatform, setSelectedPlatform] = useState('instagram');
    const [userInput, setUserInput] = useState('');
    const [trainName, setTrainName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = async () => {
      if (!userInput.trim()) return;
      setIsCreating(true);
      await createTrain(selectedPlatform, userInput, trainName);
      setIsCreating(false);
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <div className="max-w-md mx-auto pt-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">FollowTrain</h1>
            <p className="text-gray-600">Create a social following chain for your group</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Choose Platform
              </label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(platforms).map(([key, platform]) => {
                  const IconComponent = platform.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedPlatform(key)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        selectedPlatform === key
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <IconComponent className={`w-6 h-6 mx-auto mb-1 ${
                        selectedPlatform === key ? 'text-purple-600' : 'text-gray-600'
                      }`} />
                      <div className="text-xs font-medium text-gray-700">
                        {platform.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Train Name (Optional)
              </label>
              <input
                type="text"
                value={trainName}
                onChange={(e) => setTrainName(e.target.value)}
                placeholder="e.g., Marketing Team, Book Club..."
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your {platforms[selectedPlatform].name} Profile
              </label>
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={platforms[selectedPlatform].placeholder}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleCreate}
              disabled={!userInput.trim() || loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              {loading ? 'Creating Train...' : 'Create FollowTrain'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Join Train Modal
  const JoinTrainModal = ({ train, onClose, onJoin }) => {
    const [userInput, setUserInput] = useState('');
    const [isJoining, setIsJoining] = useState(false);

    const handleJoin = async () => {
      if (!userInput.trim()) return;
      setIsJoining(true);
      await onJoin(train.id, userInput);
      setIsJoining(false);
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md">
          <h3 className="text-xl font-bold mb-4">Join {train.name}</h3>
          <p className="text-gray-600 mb-4">
            Add your {platforms[train.platform].name} profile to join the train
          </p>
          
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={platforms[train.platform].placeholder}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4"
          />
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-xl font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleJoin}
              disabled={!userInput.trim() || isJoining}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
            >
              {isJoining ? 'Joining...' : 'Join Train'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Train View
  const TrainView = () => {
    const [showJoinModal, setShowJoinModal] = useState(false);
    const train = trains[currentTrainId];

    if (!train) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Train Not Found</h2>
            <p className="text-gray-600 mb-4">This train doesn't exist or has expired</p>
            <button
              onClick={() => setCurrentView('create')}
              className="bg-purple-600 text-white py-2 px-4 rounded-xl hover:bg-purple-700"
            >
              Create New Train
            </button>
          </div>
        </div>
      );
    }

    const platformConfig = platforms[train.platform];
    const IconComponent = platformConfig.icon;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        {/* Header */}
        <div className="bg-white shadow-sm p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${platformConfig.color}`}>
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-800">{train.name}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  {train.participants.length} participant{train.participants.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={copyShareUrl}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {showCopied ? (
                  <span className="text-xs text-green-600 font-medium">Copied!</span>
                ) : (
                  <Share2 className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Participants Grid */}
        <div className="max-w-4xl mx-auto p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {train.participants.map((participant, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => openProfile(participant, train.platform)}
              >
                <div className="flex items-start gap-3">
                  <img
                    src={participant.avatar}
                    alt={participant.displayName}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800 truncate">
                        {participant.displayName}
                      </h3>
                      {participant.isHost && (
                        <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                          Host
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      @{participant.username}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {participant.bio}
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
            
            {/* Add New Participant Card */}
            <div
              onClick={() => setShowJoinModal(true)}
              className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer border-2 border-dashed border-gray-200 hover:border-purple-300"
            >
              <div className="h-full flex flex-col items-center justify-center text-gray-500 hover:text-purple-600 transition-colors">
                <Plus className="w-8 h-8 mb-2" />
                <p className="text-sm font-medium">Join Train</p>
                <p className="text-xs text-center">Add your profile</p>
              </div>
            </div>
          </div>
        </div>

        {/* Join Modal */}
        {showJoinModal && (
          <JoinTrainModal
            train={train}
            onClose={() => setShowJoinModal(false)}
            onJoin={joinTrain}
          />
        )}
      </div>
    );
  };

  // Main Render
  return (
    <>
      <ErrorAlert message={error} onClose={() => setError(null)} />
      {currentView === 'create' ? <CreateTrainView /> : <TrainView />}
    </>
  );
};

export default FollowTrain;
