# Candidate Review Dashboard

A modern, responsive web application for recruiters to review and prioritize job candidates. Built with React, Vite, and Tailwind CSS, this dashboard provides a comprehensive interface for evaluating assignments, videos, and overall candidate fit.

## Features

- **Candidate Management**: View and filter 100+ candidates with detailed profiles
- **Evaluation System**: Rate assignments and videos with weighted scoring criteria
- **Priority Engine**: Automatic priority calculation based on multiple factors
- **Comparison Mode**: Side-by-side candidate comparison
- **Real-time Updates**: Live priority recalculation as evaluations change
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Theme**: Modern UI optimized for extended use

## Tech Stack

- **Frontend**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **Development**: ESLint for code quality

## Setup Instructions

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd candidate-review-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173` (or the port shown in the terminal)

## Usage

### Basic Navigation

- **Dashboard Summary**: View total candidates, reviewed count, shortlisted, and pending
- **Search & Filters**: Use the left panel to filter by scores and review status
- **Candidate Table**: Browse candidates with sortable columns
- **Detail View**: Click "View" to open detailed evaluation panels

### Evaluation Process

1. **Select a Candidate**: Click the "View" button in the candidate table
2. **Rate Assignment**: Use sliders to evaluate code quality criteria (UI Clarity, Component Structure, etc.)
3. **Rate Video**: Evaluate presentation and technical explanation skills
4. **Add Notes**: Include timestamped notes for video reviews
5. **Shortlist**: Mark promising candidates for further consideration

### Priority System

Candidates are automatically prioritized based on:
- 30% Assignment Score
- 25% Video Score
- 20% ATS Score
- 15% GitHub Score
- 10% Communication Score

Priority levels:
- **P0 (Green)**: Interview immediately (>80)
- **P1 (Yellow)**: Strong shortlist (70-80)
- **P2 (Orange)**: Review later (60-70)
- **P3 (Red)**: Reject (<60)

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure

```
src/
├── App.jsx          # Main application component
├── data.js          # Dummy candidate data and generation
├── utils.js         # Priority calculation utilities
├── main.jsx         # Application entry point
├── index.css        # Global styles
└── assets/          # Static assets
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is for educational purposes. Please ensure compliance with your organization's data handling policies when adapting for production use.
