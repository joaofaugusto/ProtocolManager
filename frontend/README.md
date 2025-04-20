# ProtocolManager Frontend

This React application manages insurance company branches, allowing users to view, create, edit, and delete branch information.

## Project Structure

```
frontend/
├── public/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Page components like Branches.tsx
│   ├── services/        # API services like branchService.ts
│   ├── types/           # TypeScript type definitions
│   ├── App.tsx          # Main application component
│   └── index.tsx        # Application entry point
├── .env                 # Environment variables
└── package.json         # Project dependencies
```

## Setup and Configuration

### Environment Variables

Create a `.env` file in the project root with:

```
REACT_APP_API_BASE_URL=http://localhost:8080
```

Adjust the URL according to your backend API location.

### Installation

```bash
npm install
```

## Available Scripts

### `npm start`

Runs the app in development mode at [http://localhost:3000](http://localhost:3000).

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.

## Features

- **Branch Management**: Create, read, update, and delete insurance company branches
- **Form Validation**: Prevents empty submissions
- **Error Handling**: User-friendly error messages
- **Success Notifications**: Feedback on successful operations

## API Integration

The application connects to a backend API using axios. API endpoints:

- `GET /api/branches`: Fetch all branches
- `GET /api/branches/:id`: Fetch a specific branch
- `POST /api/branches`: Create a new branch
- `PUT /api/branches/:id`: Update an existing branch
- `DELETE /api/branches/:id`: Delete a branch

## Technology Stack

- React
- TypeScript
- Axios for API requests
- Semantic UI for UI components