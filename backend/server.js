const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection (optional - for storing calculation history)
let db = null;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-test';

async function connectToMongoDB() {
  try {
    const client = new MongoClient(MONGODB_URI, { 
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000 
    });
    await client.connect();
    db = client.db();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.log('MongoDB connection failed, continuing without database:', error.message);
  }
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is running' });
});

app.post('/api/add', async (req, res) => {
  try {
    const { num1, num2 } = req.body;
    
    // Validation
    if (typeof num1 !== 'number' || typeof num2 !== 'number') {
      return res.status(400).json({ 
        error: 'Both num1 and num2 must be numbers' 
      });
    }
    
    if (!isFinite(num1) || !isFinite(num2)) {
      return res.status(400).json({ 
        error: 'Numbers must be finite values' 
      });
    }
    
    const sum = num1 + num2;
    
    // Store in MongoDB if available
    if (db) {
      try {
        await db.collection('calculations').insertOne({
          num1,
          num2,
          sum,
          timestamp: new Date()
        });
      } catch (dbError) {
        console.log('Failed to store in database:', dbError.message);
      }
    }
    
    res.json({
      num1,
      num2,
      sum,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in /api/add:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/history', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }
    
    const history = await db.collection('calculations')
      .find({})
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();
    
    res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch calculation history' });
  }
});

// Start server
async function startServer() {
  await connectToMongoDB();
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
}

startServer().catch(console.error);