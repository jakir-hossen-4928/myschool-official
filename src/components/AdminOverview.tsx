import React, { useState, useEffect } from 'react';
import { studentOverview } from '../lib/appwrite';

const AdminOverview: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const overviewStats = await studentOverview();
      setStats(overviewStats);
    } catch (err) {
      setError('Failed to load statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        

        {/* Main Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title="Total Students" value={stats.totalStudents} color="bg-gradient-to-r from-blue-600 to-blue-400" icon="👩‍🎓" />
          <StatCard title="Missing Photos" value={stats.missingFields.photoUrl} color="bg-gradient-to-r from-red-600 to-red-400" icon="📸" />
          <StatCard title="Incomplete Profiles" value={stats.incompleteProfiles} color="bg-gradient-to-r from-yellow-600 to-yellow-400" icon="⚠️" />
          <StatCard title="Unique Parents" value={stats.uniqueParents} color="bg-gradient-to-r from-purple-600 to-purple-400" icon="👨‍👩‍👧" />
        </div>

        {/* Detailed Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Class Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">🏫</span> Class Distribution
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {Object.entries(stats.classDistribution).map(([className, count]) => (
                <div key={className} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 font-medium">{className || 'Unclassified'}</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Missing Data Overview */}
          <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">📊</span> Missing Data Overview
            </h2>
            <div className="space-y-3">
              {Object.entries(stats.missingFields).map(([field, count]) => (
                <div key={field} className="flex justify-between items-center">
                  <span className="text-gray-700 capitalize">{field}</span>
                  <span className={`text-sm px-2 py-1 rounded-full ${count > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Data Quality */}
          <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300 lg:col-span-2">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">✅</span> Data Quality
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated</span>
                <span className="font-medium text-gray-800">
                  {new Date(stats.lastUpdated).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Profile Completion</span>
                <span className="font-medium text-gray-800">
                  {Math.round(((stats.totalStudents - stats.incompleteProfiles) / stats.totalStudents) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${((stats.totalStudents - stats.incompleteProfiles) / stats.totalStudents) * 100}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced StatCard Component
interface StatCardProps {
  title: string;
  value: string | number;
  color: string;
  icon: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, color, icon }) => (
  <div className={`${color} text-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300`}>
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-3xl font-bold mt-2">{value}</p>
      </div>
      <span className="text-3xl opacity-75">{icon}</span>
    </div>
  </div>
);

export default AdminOverview;