import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { BookOpen, Plus, ChevronDown, ChevronUp, Loader } from 'lucide-react';

const JournalHistory = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    API.get('/journal').then(r => setEntries(r.data.data || [])).catch(() => setEntries([])).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center py-16">
      <Loader size={32} className="animate-spin text-indigo-400" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Journal History</h1>
          <p className="text-gray-400 text-sm">Your past entries</p>
        </div>
        <Link to="/journal"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
          <Plus size={16} /> New Entry
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <BookOpen size={40} className="mx-auto mb-3 text-gray-200" />
          <p className="text-gray-500 mb-4">No journal entries yet</p>
          <Link to="/journal" className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors">
            Write Your First Entry
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === idx ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{entry.prompt || 'Journal Entry'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(entry.createdAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                {expanded === idx ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
              </button>
              {expanded === idx && (
                <div className="px-5 pb-5 border-t border-gray-50">
                  <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed pt-4">{entry.content}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JournalHistory;