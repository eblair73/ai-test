const fastify = require('fastify')({ logger: true });
const { MongoClient } = require('mongodb');
require('dotenv').config();

const PORT = process.env.PORT || 3001;

// Register CORS plugin
fastify.register(require('@fastify/cors'));

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
fastify.get('/api/health', async (request, reply) => {
  reply.send({ status: 'OK', message: 'API is running' });
});

fastify.post('/api/add', async (request, reply) => {
  try {
    const { num1, num2 } = request.body;
    
    // Validation
    if (typeof num1 !== 'number' || typeof num2 !== 'number') {
      return reply.status(400).send({ 
        error: 'Both num1 and num2 must be numbers' 
      });
    }
    
    if (!isFinite(num1) || !isFinite(num2)) {
      return reply.status(400).send({ 
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
    
    reply.send({
      num1,
      num2,
      sum,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in /api/add:', error);
    reply.status(500).send({ error: 'Internal server error' });
  }
});

fastify.get('/api/history', async (request, reply) => {
  try {
    if (!db) {
      return reply.status(503).send({ error: 'Database not available' });
    }
    
    const history = await db.collection('calculations')
      .find({})
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();
    
    reply.send(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    reply.status(500).send({ error: 'Failed to fetch calculation history' });
  }
});

// Start server
async function startServer() {
  await connectToMongoDB();
  
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

startServer().catch(console.error);