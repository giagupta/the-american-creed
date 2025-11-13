const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  loadData(); // Load data when server starts
});
