# Collaborative Definition Website

A single-page collaborative website where users can type a 100-word definition of America inside a 10.5in × 10.5in white box with specific styling requirements. The text auto-saves in the browser and syncs to a backend so that all users see the same evolving text.

## Features

- 10.5in × 10.5in white box with 1in margins
- Oriya Sangam MN Bold, all caps, font size 26px, line-height 34px
- 100-word limit with counter
- Auto-save functionality (1.5 seconds after last keystroke)
- Persistence in localStorage and on the server
- Responsive design for mobile devices

## Installation

1. Clone or download this repository
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

## Running the Application

1. Start the server:

```bash
node server.js
```

2. Open `index.html` in your browser:
   - If you have VS Code with Live Server extension, right-click on `index.html` and select "Open with Live Server"
   - Otherwise, you can open the file directly in your browser

3. The application will be running at:
   - Frontend: http://localhost:5500 (if using Live Server) or file:///path/to/index.html
   - Backend API: http://localhost:3000

## API Endpoints

- `GET /api/text` - Get the current saved text
- `POST /api/save` - Save text with timestamp

## Technical Details

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js with Express
- Data storage: File-based JSON store
- Synchronization: Timestamp-based versioning to prevent overwrites
