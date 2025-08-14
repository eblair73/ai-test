# AI Test Application

A demonstration application built with Node.js backend, Next.js frontend, Rust DevOps tools, and MongoDB integration.

## Architecture

- **Backend**: Node.js with Express.js API server (port 3001)
- **Frontend**: Next.js React application with TypeScript and Tailwind CSS (port 3000)
- **DevOps**: Rust-based CLI tools for health checks, testing, and deployment
- **Database**: MongoDB for storing calculation history (optional)

## Features

- Simple calculator that adds two numbers
- Real-time API communication between frontend and backend
- Input validation and error handling
- Calculation history storage (when MongoDB is available)
- Comprehensive DevOps tools for health checks and testing

## Project Structure

```
ai-test/
├── backend/           # Node.js API server
│   ├── server.js      # Main server file
│   ├── package.json   # Dependencies and scripts
│   └── .env.example   # Environment configuration template
├── frontend/          # Next.js React application
│   ├── src/app/       # App router pages and components
│   └── package.json   # Dependencies and scripts
├── devops/            # Rust CLI tools
│   ├── src/main.rs    # DevOps utilities
│   └── Cargo.toml     # Rust dependencies
└── README.md          # This file
```

## Quick Start

### Prerequisites

- Node.js (v18+)
- npm
- Rust and Cargo
- MongoDB (optional, for calculation history)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-test
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Build DevOps Tools**
   ```bash
   cd ../devops
   cargo build --release
   ```

### Running the Application

1. **Start the Backend API**
   ```bash
   cd backend
   npm start
   ```
   The API will be available at http://localhost:3001

2. **Start the Frontend (in a new terminal)**
   ```bash
   cd frontend
   npm run dev
   ```
   The web application will be available at http://localhost:3000

3. **Use DevOps Tools (in a new terminal)**
   ```bash
   cd devops
   
   # Check API health
   cargo run --release -- health
   
   # Run API tests
   cargo run --release -- test
   
   # Show all available commands
   cargo run --release -- help
   ```

## API Endpoints

### Health Check
- **GET** `/api/health`
- Returns server status information

### Addition Calculator
- **POST** `/api/add`
- Body: `{ "num1": number, "num2": number }`
- Returns: `{ "num1": number, "num2": number, "sum": number, "timestamp": string }`

### Calculation History
- **GET** `/api/history`
- Returns the last 10 calculations (requires MongoDB)

## DevOps Commands

The Rust-based DevOps CLI provides several utilities:

- `health` - Check API health status
- `build` - Build all components
- `start` - Show startup instructions
- `stop` - Stop running services
- `test` - Run comprehensive API tests

## Environment Configuration

Create a `.env` file in the backend directory:

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/ai-test
```

## Testing

The application includes:

1. **Input validation** - Ensures only valid numbers are accepted
2. **Error handling** - Proper error messages for invalid requests
3. **DevOps tests** - Automated API testing via Rust CLI
4. **Health checks** - Service availability monitoring

## Technology Stack

- **Backend**: Node.js, Express.js, MongoDB driver, CORS, dotenv
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **DevOps**: Rust, Tokio, Reqwest, Serde JSON
- **Database**: MongoDB (optional)

## Development Notes

- The application works without MongoDB (calculations just won't be stored)
- CORS is configured for local development
- Frontend includes proper TypeScript types and error handling
- DevOps tools provide comprehensive testing and health monitoring

## Screenshots

The application provides a clean, responsive interface for entering two numbers and calculating their sum, with real-time feedback and error handling.