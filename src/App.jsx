
import { useState, useMemo, useEffect } from 'react';
import { candidates as initialCandidates } from './data';
import { calculatePriority, getPriorityColor, getPriorityBgColor } from './utils';
import { loadCandidatesFromStorage, saveCandidatesToStorage } from './storage';

function App() {
  // Initialize candidates from localStorage or use default data
  const [candidates, setCandidates] = useState(() => {
    const stored = loadCandidatesFromStorage();
    if (stored) {
      return stored;
    }
    return initialCandidates.map(c => ({
      ...c,
      ...calculatePriority(c)
    }));
  });
  
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    assignmentMin: 0,
    assignmentMax: 100,
    videoMin: 0,
    videoMax: 100,
    atsMin: 0,
    atsMax: 100,
    reviewStatus: 'all' // all, reviewed, pending
  });
  const [sortBy, setSortBy] = useState('priority');
  const [sortOrder, setSortOrder] = useState('desc');
  const [comparisonCandidates, setComparisonCandidates] = useState([]);
  const [comparisonView, setComparisonView] = useState('overview'); // overview, assignment, video, detailed

  // Comparison view tabs
  const comparisonTabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'assignment', label: 'Assignment', icon: '💻' },
    { id: 'video', label: 'Video', icon: '🎥' },
    { id: 'detailed', label: 'Detailed', icon: '📋' }
  ];

  // Save to localStorage whenever candidates change
  useEffect(() => {
    saveCandidatesToStorage(candidates);
  }, [candidates]);

  const weights = {
    ui_clarity: 25,
    component_structure: 20,
    state_handling: 20,
    priority_logic: 15,
    edge_case_handling: 10,
    visual_hierarchy: 10
  };

  const getWeight = (key) => weights[key] || 0;

  const calculateAssignmentScore = (ratings) => {
    let total = 0;
    Object.entries(ratings).forEach(([key, value]) => {
      total += (value / 5) * weights[key];
    });
    return Math.round(total);
  };

  // Filtered and sorted candidates
  const filteredCandidates = useMemo(() => {
    let filtered = candidates.filter(c => {
      if (searchTerm && !c.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (c.assignment_score < filters.assignmentMin || c.assignment_score > filters.assignmentMax) return false;
      if (c.video_score < filters.videoMin || c.video_score > filters.videoMax) return false;
      if (c.ats_score < filters.atsMin || c.ats_score > filters.atsMax) return false;
      if (filters.reviewStatus === 'reviewed' && !c.reviewed) return false;
      if (filters.reviewStatus === 'pending' && c.reviewed) return false;
      return true;
    });

    filtered.sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case 'priority': {
          // Convert priority strings (P0, P1, P2, P3) to numbers for correct sorting
          const priorityMap = { 'P0': 0, 'P1': 1, 'P2': 2, 'P3': 3 };
          aVal = priorityMap[a.priority] ?? 999;
          bVal = priorityMap[b.priority] ?? 999;
          break;
        }
        case 'assignment':
          aVal = a.assignment_score;
          bVal = b.assignment_score;
          break;
        default:
          aVal = a.score;
          bVal = b.score;
      }
      if (sortOrder === 'asc') return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });

    return filtered;
  }, [candidates, searchTerm, filters, sortBy, sortOrder]);

  // Summary stats
  const summary = useMemo(() => {
    const total = candidates.length;
    const reviewed = candidates.filter(c => c.reviewed).length;
    const shortlisted = candidates.filter(c => c.shortlisted).length;
    const pending = total - reviewed;
    return { total, reviewed, shortlisted, pending };
  }, [candidates]);

  const updateCandidate = (id, updates) => {
    setCandidates(prev => prev.map(c => {
      if (c.id === id) {
        const updated = { ...c, ...updates };
        return { ...updated, ...calculatePriority(updated) };
      }
      return c;
    }));
  };

  const toggleShortlist = (id) => {
    const candidate = candidates.find(c => c.id === id);
    updateCandidate(id, { shortlisted: !candidate.shortlisted });
    // Update selectedCandidate to keep UI in sync
    if (selectedCandidate?.id === id) {
      setSelectedCandidate(prev => ({
        ...prev,
        shortlisted: !prev.shortlisted
      }));
    }
  };

  const markReviewed = (id) => {
    updateCandidate(id, { reviewed: true });
    // Update selectedCandidate to keep UI in sync
    if (selectedCandidate?.id === id) {
      setSelectedCandidate(prev => ({
        ...prev,
        reviewed: true
      }));
    }
  };

  const updateAssignmentRating = (id, rating, value) => {
    const candidate = candidates.find(c => c.id === id);
    updateCandidate(id, {
      assignment_ratings: { ...candidate.assignment_ratings, [rating]: value }
    });
    // Update selectedCandidate to keep UI in sync
    if (selectedCandidate?.id === id) {
      setSelectedCandidate(prev => ({
        ...prev,
        assignment_ratings: { ...prev.assignment_ratings, [rating]: value }
      }));
    }
  };

  const updateVideoRating = (id, rating, value) => {
    const candidate = candidates.find(c => c.id === id);
    updateCandidate(id, {
      video_ratings: { ...candidate.video_ratings, [rating]: value }
    });
    // Update selectedCandidate to keep UI in sync
    if (selectedCandidate?.id === id) {
      setSelectedCandidate(prev => ({
        ...prev,
        video_ratings: { ...prev.video_ratings, [rating]: value }
      }));
    }
  };

  const addVideoNote = (id, note) => {
    const candidate = candidates.find(c => c.id === id);
    updateCandidate(id, {
      video_notes: [...candidate.video_notes, note]
    });
    // Update selectedCandidate to keep UI in sync
    if (selectedCandidate?.id === id) {
      setSelectedCandidate(prev => ({
        ...prev,
        video_notes: [...prev.video_notes, note]
      }));
    }
  };

  const toggleComparison = (id) => {
    setComparisonCandidates(prev => {
      if (prev.includes(id)) {
        // Remove if already selected
        return prev.filter(cId => cId !== id);
      } else if (prev.length < 2) {
        // Add if less than 2 selected
        return [...prev, id];
      } else {
        // Replace the first one with the new candidate when already have 2
        return [id, prev[1]];
      }
    });
  };

  const clearComparison = () => {
    setComparisonCandidates([]);
  };

  const resetAllData = () => {
    if (confirm('Are you sure you want to reset all changes and reload default data?')) {
      const freshData = initialCandidates.map(c => ({
        ...c,
        ...calculatePriority(c)
      }));
      setCandidates(freshData);
      setComparisonCandidates([]);
      setSelectedCandidate(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header Summary */}
      <header className="bg-gray-800 p-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Candidate Review Dashboard</h1>
            <button
              onClick={resetAllData}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-semibold"
            >
              Reset All Data
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-700 p-3 rounded">
              <div className="text-2xl font-bold">{summary.total}</div>
              <div className="text-sm text-gray-300">Total Candidates</div>
            </div>
            <div className="bg-gray-700 p-3 rounded">
              <div className="text-2xl font-bold">{summary.reviewed}</div>
              <div className="text-sm text-gray-300">Reviewed</div>
            </div>
            <div className="bg-gray-700 p-3 rounded">
              <div className="text-2xl font-bold">{summary.shortlisted}</div>
              <div className="text-sm text-gray-300">Shortlisted</div>
            </div>
            <div className="bg-gray-700 p-3 rounded">
              <div className="text-2xl font-bold">{summary.pending}</div>
              <div className="text-sm text-gray-300">Pending</div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters and Search */}
          <div className="lg:w-1/4">
            <div className="bg-gray-800 p-4 rounded-lg mb-4">
              <h2 className="text-lg font-semibold mb-3">Search & Filters</h2>
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 mb-3 bg-gray-700 border border-gray-600 rounded"
              />
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm mb-1">Assignment Score</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={filters.assignmentMin}
                      onChange={(e) => setFilters(prev => ({ ...prev, assignmentMin: Number(e.target.value) }))}
                      className="w-1/2 p-1 bg-gray-700 border border-gray-600 rounded text-sm"
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={filters.assignmentMax}
                      onChange={(e) => setFilters(prev => ({ ...prev, assignmentMax: Number(e.target.value) }))}
                      className="w-1/2 p-1 bg-gray-700 border border-gray-600 rounded text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm mb-1">Video Score</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={filters.videoMin}
                      onChange={(e) => setFilters(prev => ({ ...prev, videoMin: Number(e.target.value) }))}
                      className="w-1/2 p-1 bg-gray-700 border border-gray-600 rounded text-sm"
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={filters.videoMax}
                      onChange={(e) => setFilters(prev => ({ ...prev, videoMax: Number(e.target.value) }))}
                      className="w-1/2 p-1 bg-gray-700 border border-gray-600 rounded text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm mb-1">ATS Score</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={filters.atsMin}
                      onChange={(e) => setFilters(prev => ({ ...prev, atsMin: Number(e.target.value) }))}
                      className="w-1/2 p-1 bg-gray-700 border border-gray-600 rounded text-sm"
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={filters.atsMax}
                      onChange={(e) => setFilters(prev => ({ ...prev, atsMax: Number(e.target.value) }))}
                      className="w-1/2 p-1 bg-gray-700 border border-gray-600 rounded text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm mb-1">Review Status</label>
                  <select
                    value={filters.reviewStatus}
                    onChange={(e) => setFilters(prev => ({ ...prev, reviewStatus: e.target.value }))}
                    className="w-full p-1 bg-gray-700 border border-gray-600 rounded text-sm"
                  >
                    <option value="all">All</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Sort Options */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-3">Sort By</h2>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-2 mb-2 bg-gray-700 border border-gray-600 rounded"
              >
                <option value="priority">Priority</option>
                <option value="assignment">Assignment Score</option>
                <option value="score">Overall Score</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>

          {/* Candidate List */}
          <div className="lg:w-3/4">
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-left">College</th>
                      <th className="p-3 text-center">Assignment</th>
                      <th className="p-3 text-center">Video</th>
                      <th className="p-3 text-center">ATS</th>
                      <th className="p-3 text-center">Priority</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCandidates.map(candidate => (
                      <tr key={candidate.id} className="border-t border-gray-700 hover:bg-gray-750">
                        <td className="p-3">{candidate.name}</td>
                        <td className="p-3">{candidate.college}</td>
                        <td className="p-3 text-center">{candidate.assignment_score}</td>
                        <td className="p-3 text-center">{candidate.video_score}</td>
                        <td className="p-3 text-center">{candidate.ats_score}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${getPriorityBgColor(candidate.priority)}`}>
                            {candidate.priority}
                          </span>
                        </td>
                        <td className="p-3 text-center space-x-2">
                          <button
                            onClick={() => setSelectedCandidate(candidate)}
                            className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
                          >
                            View
                          </button>
                          <button
                            onClick={() => toggleShortlist(candidate.id)}
                            className={`px-3 py-1 rounded text-sm ${candidate.shortlisted ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'}`}
                          >
                            {candidate.shortlisted ? 'Shortlisted' : 'Shortlist'}
                          </button>
                          <button
                            onClick={() => toggleComparison(candidate.id)}
                            className={`px-3 py-1 rounded text-sm ${comparisonCandidates.includes(candidate.id) ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-600 hover:bg-gray-700'}`}
                          >
                            Compare
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Mode */}
        {comparisonCandidates.length > 0 && (
          <div className="mt-6 bg-gray-800 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                Candidate Comparison ({comparisonCandidates.length}/2 selected)
              </h2>
              <button
                onClick={clearComparison}
                className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-sm"
              >
                Clear Comparison
              </button>
            </div>
            
            {comparisonCandidates.length === 2 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-700">
                      <th className="p-3 text-left border border-gray-600">Metric</th>
                      {comparisonCandidates.map(id => {
                        const candidate = candidates.find(c => c.id === id);
                        if (!candidate) return null;
                        return (
                          <th key={id} className="p-3 text-center border border-gray-600">
                            <div>{candidate.name}</div>
                            <div className="text-xs text-gray-400">{candidate.college}</div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: 'Overall Score', key: 'score' },
                      { label: 'Priority', key: 'priority' },
                      { label: 'Assignment Score', key: 'assignment_score' },
                      { label: 'Video Score', key: 'video_score' },
                      { label: 'ATS Score', key: 'ats_score' },
                      { label: 'GitHub Score', key: 'github_score' },
                      { label: 'Communication Score', key: 'communication_score' },
                      { label: 'Reviewed', key: 'reviewed' },
                      { label: 'Shortlisted', key: 'shortlisted' }
                    ].map((metric, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-750' : 'bg-gray-700'}>
                        <td className="p-3 font-semibold border border-gray-600">{metric.label}</td>
                        {comparisonCandidates.map(id => {
                          const candidate = candidates.find(c => c.id === id);
                          if (!candidate) return <td key={id} className="p-3 text-center border border-gray-600">N/A</td>;
                          let value = candidate[metric.key];
                          let displayValue = value;
                          
                          if (metric.key === 'priority') {
                            displayValue = (
                              <span className={`px-2 py-1 rounded text-xs font-bold ${getPriorityBgColor(value)}`}>
                                {value}
                              </span>
                            );
                          } else if (metric.key === 'reviewed' || metric.key === 'shortlisted') {
                            displayValue = value ? '✓' : '✗';
                          }
                          
                          return (
                            <td key={id} className="p-3 text-center border border-gray-600">
                              {displayValue}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {comparisonCandidates.map(id => {
                  const candidate = candidates.find(c => c.id === id);
                  if (!candidate) return null;
                  return (
                    <div key={id} className="bg-gray-700 p-4 rounded">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-lg">{candidate.name}</h3>
                          <p className="text-sm text-gray-400">{candidate.college}</p>
                        </div>
                        <button
                          onClick={() => toggleComparison(candidate.id)}
                          className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Overall Score:</span>
                          <span className="font-semibold">{candidate.score}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Priority:</span>
                          <span className={`font-semibold ${getPriorityColor(candidate.priority)}`}>{candidate.priority}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Assignment:</span>
                          <span className="font-semibold">{candidate.assignment_score}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Video:</span>
                          <span className="font-semibold">{candidate.video_score}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>ATS:</span>
                          <span className="font-semibold">{candidate.ats_score}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>GitHub:</span>
                          <span className="font-semibold">{candidate.github_score}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Communication:</span>
                          <span className="font-semibold">{candidate.communication_score}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Reviewed:</span>
                          <span className="font-semibold">{candidate.reviewed ? '✓' : '✗'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Shortlisted:</span>
                          <span className="font-semibold">{candidate.shortlisted ? '✓' : '✗'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Candidate Detail Modal */}
        {selectedCandidate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">{selectedCandidate.name}</h2>
                  <button
                    onClick={() => setSelectedCandidate(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Scores */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Scores</h3>
                    <div className="space-y-2">
                      <div>ATS: {selectedCandidate.ats_score}</div>
                      <div>Assignment: {selectedCandidate.assignment_score}</div>
                      <div>Video: {selectedCandidate.video_score}</div>
                      <div>Communication: {selectedCandidate.communication_score}</div>
                      <div>GitHub: {selectedCandidate.github_score}</div>
                      <div className={`font-bold ${getPriorityColor(selectedCandidate.priority)}`}>
                        Priority: {selectedCandidate.priority} (Score: {selectedCandidate.score})
                      </div>
                    </div>
                  </div>
                  
                  {/* Assignment Evaluation */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Assignment Evaluation</h3>
                    <div className="space-y-3">
                      {Object.entries(selectedCandidate.assignment_ratings).map(([key, value]) => (
                        <div key={key}>
                          <label className="block text-sm mb-1 capitalize">{key.replace('_', ' ')} ({getWeight(key)}%)</label>
                          <input
                            type="range"
                            min="0"
                            max="5"
                            value={value}
                            onChange={(e) => updateAssignmentRating(selectedCandidate.id, key, Number(e.target.value))}
                            className="w-full"
                          />
                          <span className="text-sm">{value}/5</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 text-sm">
                      <strong>Weighted Score: {calculateAssignmentScore(selectedCandidate.assignment_ratings)}</strong>
                    </div>
                  </div>
                  
                  {/* Video Evaluation */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Video Evaluation</h3>
                    <div className="space-y-3">
                      {Object.entries(selectedCandidate.video_ratings).map(([key, value]) => (
                        <div key={key}>
                          <label className="block text-sm mb-1 capitalize">{key.replace('_', ' ')}</label>
                          <input
                            type="range"
                            min="0"
                            max="5"
                            value={value}
                            onChange={(e) => updateVideoRating(selectedCandidate.id, key, Number(e.target.value))}
                            className="w-full"
                          />
                          <span className="text-sm">{value}/5</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="text-md font-semibold mb-2">Video Notes</h4>
                      <div className="space-y-2">
                        {selectedCandidate.video_notes.map((note, index) => (
                          <div key={index} className="bg-gray-700 p-2 rounded text-sm">
                            {note}
                          </div>
                        ))}
                      </div>
                      <div className="mt-2">
                        <input
                          type="text"
                          placeholder="Add note (e.g., 02:10 – clear explanation)"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && e.target.value.trim()) {
                              addVideoNote(selectedCandidate.id, e.target.value.trim());
                              e.target.value = '';
                            }
                          }}
                          className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Actions</h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => markReviewed(selectedCandidate.id)}
                        disabled={selectedCandidate.reviewed}
                        className={`w-full py-2 rounded ${selectedCandidate.reviewed ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                      >
                        {selectedCandidate.reviewed ? 'Reviewed' : 'Mark as Reviewed'}
                      </button>
                      <button
                        onClick={() => toggleShortlist(selectedCandidate.id)}
                        className={`w-full py-2 rounded ${selectedCandidate.shortlisted ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'}`}
                      >
                        {selectedCandidate.shortlisted ? 'Remove from Shortlist' : 'Add to Shortlist'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
