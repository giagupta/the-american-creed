const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',  // In production, you might want to restrict this
    methods: ['GET', 'POST']
  }
});

// Use environment variable for port (required by most hosting providers)
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize data store
let definitionData = {
  text: '',
  updatedAt: Date.now()
};

// Load data from file if it exists
const loadData = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      definitionData = JSON.parse(data);
      console.log('Data loaded from file');
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
};

// Save data to file
const saveData = () => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(definitionData, null, 2));
    console.log('Data saved to file');
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

// Count words in text
const countWords = (text) => {
  const plainText = text.replace(/<[^>]*>/g, ' '); // Remove HTML tags
  return plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
};

// API Routes
// Get current text
app.get('/api/text', (req, res) => {
  res.json(definitionData);
});

// Save text
app.post('/api/save', (req, res) => {
  const { text, updatedAt } = req.body;
  
  // Validate input
  if (!text || !updatedAt) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Enforce word limit
  const wordCount = countWords(text);
  if (wordCount > 100) {
    return res.status(400).json({ error: 'Text exceeds 100 word limit' });
  }
  
  // Only update if the incoming timestamp is newer
  if (updatedAt > definitionData.updatedAt) {
    definitionData = {
      text,
      updatedAt
    };
    
    // Save to file
    saveData();
  }
  
  res.json(definitionData);
});

// Add a simple status route
app.get('/', (req, res) => {
  res.send('WebSocket server for collaborative definition website is running');
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Send current text to newly connected client
  socket.emit('initialText', definitionData);
  
  // Listen for text updates from clients
  socket.on('textUpdate', (data) => {
    // Validate input
    if (!data.text || !data.updatedAt) {
      return;
    }
    
    // Enforce word limit
    const wordCount = countWords(data.text);
    if (wordCount > 100) {
      return;
    }
    
    // Only update if the incoming timestamp is newer
    if (data.updatedAt > definitionData.updatedAt) {
      definitionData = {
        text: data.text,
        updatedAt: data.updatedAt
      };
      
      // Save to file
      saveData();
      
      // Broadcast to all other clients
      socket.broadcast.emit('textUpdate', definitionData);
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  loadData(); // Load data when server starts
});
