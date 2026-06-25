import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { BookOpen, Loader, Plus } from 'lucide-react';

const JournalHistory = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    fetchJournalEntries();
  }, []);

  const fetchJournalEntries = async () => {
    try {
      setLoading(true);
      const response = await API.get('/journal');
      if (response.data.success && response.data.data) {
        setEntries(response.data.data);
      } else {
        setEntries([]);
      }
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size={48} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <BookOpen size={30} className="text-indigo-500" />
            Journal History
          </h1>
          <p className="text-gray-300">Review your past journal entries</p>
        </div>
        <Link
          to="/journal"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg transition-colors font-medium"
        >
          <Plus size={18} />
          New Entry
        </Link>
      </div>

      {/* Entries List */}
      {entries.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <BookOpen size={48} className="mx-auto mb-4 text-gray-700" />
          <p className="text-gray-300 mb-4">No journal entries yet</p>
          <Link
            to="/journal"
            className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Write Your First Entry
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedEntry(selectedEntry === idx ? null : idx)}
              className="bg-gray-900 border border-gray-800 rounded-lg p-6 cursor-pointer hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-white">{entry.prompt}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(entry.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              {selectedEntry === idx && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-gray-300 whitespace-pre-wrap">{entry.content}</p>
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
