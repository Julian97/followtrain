// server.js - Main Express server
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');

// Load dotenv only in development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL_MODE === 'require' || 
       (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost')) ? 
       { rejectUnauthorized: false } : false
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',') || ['https://your-domain.com', 'https://www.your-domain.com']
    : ['http://localhost:3000', 'http://127.0.0.1:3000']
}));
app.use(express.json({ limit: '1mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Social Media API integrations
const socialMediaAPI = {
  async fetchInstagramProfile(username) {
    // Instagram Basic Display API integration
    try {
      // Note: Instagram's API requires app approval for production
      const response = await fetch(`https://graph.instagram.com/${username}?fields=id,username,account_type,media_count&access_token=${process.env.INSTAGRAM_ACCESS_TOKEN}`);
      if (!response.ok) throw new Error('Instagram API failed');
      
      const data = await response.json();
      return {
        username: data.username,
        displayName: data.username,
        bio: data.biography || '',
        avatar: data.profile_picture_url || `https://ui-avatars.com/api/?name=${username}&background=random`,
        followers: data.followers_count || 0,
        isVerified: data.is_verified || false
      };
    } catch (error) {
      console.error('Instagram API error:', error);
      return null;
    }
  },

  async fetchTwitterProfile(username) {
    // Twitter API v2 integration
    try {
      const response = await fetch(
        `https://api.twitter.com/2/users/by/username/${username}?user.fields=description,public_metrics,profile_image_url,verified`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`
          }
        }
      );
      
      if (!response.ok) throw new Error('Twitter API failed');
      
      const result = await response.json();
      const user = result.data;
      
      return {
        username: user.username,
        displayName: user.name,
        bio: user.description || '',
        avatar: user.profile_image_url || `https://ui-avatars.com/api/?name=${username}&background=random`,
        followers: user.public_metrics?.followers_count || 0,
        isVerified: user.verified || false
      };
    } catch (error) {
      console.error('Twitter API error:', error);
      return null;
    }
  },

  async fetchLinkedInProfile(username) {
    // LinkedIn API integration (requires partnership)
    try {
      const response = await fetch(
        `https://api.linkedin.com/v2/people/(vanityName:${username})`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
            'cache-control': 'no-cache',
            'X-Restli-Protocol-Version': '2.0.0'
          }
        }
      );
      
      if (!response.ok) throw new Error('LinkedIn API failed');
      
      const data = await response.json();
      return {
        username: username,
        displayName: `${data.localizedFirstName} ${data.localizedLastName}`,
        bio: data.headline || '',
        avatar: data.profilePicture?.displayImage || `https://ui-avatars.com/api/?name=${username}&background=random`,
        followers: 0, // LinkedIn doesn't provide follower count in basic API
        isVerified: false
      };
    } catch (error) {
      console.error('LinkedIn API error:', error);
      return null;
    }
  },

  // Fallback function for platforms without API access
  generateFallbackProfile(username, platform) {
    return {
      username,
      displayName: username.charAt(0).toUpperCase() + username.slice(1),
      bio: `${platform} user`,
      avatar: `https://ui-avatars.com/api/?name=${username}&background=random`,
      followers: Math.floor(Math.random() * 10000),
      isVerified: false
    };
  }
};

// Database queries
const dbQueries = {
  async createTrain(train) {
    const query = `
      INSERT INTO trains (id, name, platform, participants, created_at, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    
    const values = [
      train.id,
      train.name,
      train.platform,
      JSON.stringify(train.participants),
      train.createdAt,
      train.expiresAt
    ];
    
    const result = await pool.query(query, values);
    const row = result.rows[0];
    
    return {
      ...row,
      participants: JSON.parse(row.participants)
    };
  },

  async getTrain(trainId) {
    const query = 'SELECT * FROM trains WHERE id = $1 AND expires_at > NOW()';
    const result = await pool.query(query, [trainId]);
    
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return {
      ...row,
      participants: JSON.parse(row.participants)
    };
  },

  async updateTrain(trainId, updates) {
    const setClause = Object.keys(updates).map((key, index) => 
      `${key} = $${index + 2}`
    ).join(', ');
    
    const query = `
      UPDATE trains 
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1 
      RETURNING *;
    `;
    
    const values = [trainId, ...Object.values(updates)];
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return {
      ...row,
      participants: typeof row.participants === 'string' 
        ? JSON.parse(row.participants) 
        : row.participants
    };
  },

  async getTrainStats() {
    const query = `
      SELECT 
        COUNT(*) as total_trains,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as trains_today,
        platform,
        COUNT(*) as platform_count
      FROM trains 
      WHERE expires_at > NOW()
      GROUP BY platform;
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }
};

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get profile data
app.get('/api/profile/:platform/:username', async (req, res) => {
  try {
    const { platform, username } = req.params;
    
    let profileData = null;
    
    // Try platform-specific API first
    switch (platform) {
      case 'instagram':
        profileData = await socialMediaAPI.fetchInstagramProfile(username);
        break;
      case 'twitter':
        profileData = await socialMediaAPI.fetchTwitterProfile(username);
        break;
      case 'linkedin':
        profileData = await socialMediaAPI.fetchLinkedInProfile(username);
        break;
      default:
        // For platforms without API access, use fallback
        profileData = socialMediaAPI.generateFallbackProfile(username, platform);
    }
    
    // If API failed, use fallback
    if (!profileData) {
      profileData = socialMediaAPI.generateFallbackProfile(username, platform);
    }
    
    res.json(profileData);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile data' });
  }
});

// Create new train
app.post('/api/trains', async (req, res) => {
  try {
    const train = req.body;
    
    // Validate train data
    if (!train.id || !train.platform || !train.participants) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const savedTrain = await dbQueries.createTrain(train);
    res.status(201).json(savedTrain);
  } catch (error) {
    console.error('Create train error:', error);
    res.status(500).json({ error: 'Failed to create train' });
  }
});

// Get train by ID
app.get('/api/trains/:trainId', async (req, res) => {
  try {
    const { trainId } = req.params;
    const train = await dbQueries.getTrain(trainId);
    
    if (!train) {
      return res.status(404).json({ error: 'Train not found or expired' });
    }
    
    res.json(train);
  } catch (error) {
    console.error('Get train error:', error);
    res.status(500).json({ error: 'Failed to fetch train' });
  }
});

// Update train (add participants)
app.patch('/api/trains/:trainId', async (req, res) => {
  try {
    const { trainId } = req.params;
    const updates = req.body;
    
    // If updating participants, stringify for database storage
    if (updates.participants) {
      updates.participants = JSON.stringify(updates.participants);
    }
    
    const updatedTrain = await dbQueries.updateTrain(trainId, updates);
    
    if (!updatedTrain) {
      return res.status(404).json({ error: 'Train not found' });
    }
    
    res.json(updatedTrain);
  } catch (error) {
    console.error('Update train error:', error);
    res.status(500).json({ error: 'Failed to update train' });
  }
});

// Get platform statistics
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await dbQueries.getTrainStats();
    res.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`FollowTrain API server running on port ${PORT}`);
});

// Database initialization
async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS trains (
        id VARCHAR(10) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        platform VARCHAR(50) NOT NULL,
        participants JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        expires_at TIMESTAMPTZ NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_trains_platform ON trains(platform);
      CREATE INDEX IF NOT EXISTS idx_trains_created_at ON trains(created_at);
      CREATE INDEX IF NOT EXISTS idx_trains_expires_at ON trains(expires_at);
    `);
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

initializeDatabase();
