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

### Comparing Two Candidates

The dashboard provides a powerful side-by-side comparison feature to help you evaluate multiple candidates:

#### How to Compare

1. **Select First Candidate**:
   - In the candidate table, find the candidate you want to compare
   - Click the "Compare" button in the Actions column
   - The candidate is now selected for comparison

2. **Select Second Candidate**:
   - Find another candidate in the table
   - Click their "Compare" button
   - A comparison panel will automatically appear showing both candidates

3. **View Comparison**:
   - When 2 candidates are selected, a detailed comparison table is displayed
   - All metrics are shown side-by-side for easy evaluation:
     - Overall Score
     - Priority Level
     - Assignment Score
     - Video Score
     - ATS Score
     - GitHub Score
     - Communication Score
     - Review Status
     - Shortlist Status

4. **Add a Third Candidate**:
   - Click "Compare" on a third candidate
   - The new candidate replaces the first one, keeping the second
   - Comparison automatically updates

5. **Manage Comparison**:
   - **Remove from Comparison**: Click the "Remove" button on any card view to deselect a candidate
   - **Clear Comparison**: Click the "Clear Comparison" button to reset all selections

#### Use Cases

- **Quick Evaluation**: Compare top candidates to identify the strongest fits
- **Decision Making**: See how candidates rank against each other across all metrics
- **Shortlisting**: Compare candidates to make final shortlist decisions
- **Score Analysis**: Understand individual candidate strengths and weaknesses relative to others

### Data Persistence

All your work is automatically saved to your browser's local storage:

- **Auto-Save**: All changes are saved instantly
  - Assignment ratings
  - Video ratings and notes
  - Shortlist status
  - Review status
  
- **Persistent Data**: Your progress survives page refreshes
  - Close the browser and come back later - all data is preserved
  - Multiple sessions can continue from where you left off

- **Reset Option**: Use the "Reset All Data" button in the header to start fresh
  - A confirmation dialog prevents accidental resets
  - Clears all evaluations and reloads default candidate data

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
