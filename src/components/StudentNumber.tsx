import React, { useState, useEffect } from 'react';
import { Plus, Trash, Edit, LogOut, Download } from 'lucide-react';
import { Client, Databases, ID, Query } from 'appwrite';
import { motion, AnimatePresence } from 'framer-motion';

// Appwrite setup
const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('676984e50037cf350bb8');

const databases = new Databases(client);

interface Student {
  $id?: string;
  name: string;
  number: string;
  class: string;
  description?: string;
  englishName: string;
  motherName: string;
  fatherName: string;
  photoUrl?: string;
}

const CLASS_OPTIONS = [
  "নার্সারি", "প্লে", "প্রথম", "দ্বিতীয়", "তৃতীয়", "চতুর্থ", "পঞ্চম", "ষষ্ঠ"
];

const IMAGE_HOST_KEY = '57b4746af92a5b794e089bc9d0ab3d37';

function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [displayOptions, setDisplayOptions] = useState({
    showName: true,
    showNumber: true,
    showClass: true,
    showDescription: true,
    showEnglishName: true,
    showFatherName: true,
    showMotherName: true,
    showPhoto: true
  });
  const itemsPerPage = 30;

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsAuthenticated(loggedIn);

    // Load saved display preferences or set all to true by default
    const savedOptions = localStorage.getItem('displayOptions');
    if (savedOptions) {
      setDisplayOptions(JSON.parse(savedOptions));
    } else {
      setDisplayOptions({
        showName: true,
        showNumber: true,
        showClass: true,
        showDescription: true,
        showEnglishName: true,
        showFatherName: true,
        showMotherName: true,
        showPhoto: true
      });
    }

    if (loggedIn) fetchStudents();
  }, [currentPage, selectedClass]);

  // Save display preferences whenever they change
  useEffect(() => {
    localStorage.setItem('displayOptions', JSON.stringify(displayOptions));
  }, [displayOptions]);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const queries = [Query.limit(itemsPerPage), Query.offset(currentPage * itemsPerPage)];
      if (selectedClass) queries.push(Query.equal('class', selectedClass));

      const response = await databases.listDocuments(
        '67740d6d001e6019b3b7',
        '67740d7700148b3fcccb',
        queries
      );

      setStudents(response.documents as Student[]);
      setTotalStudents(response.total);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'myschool2025') {
      setIsAuthenticated(true);
      localStorage.setItem('isLoggedIn', 'true');
      fetchStudents();
    } else {
      alert('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isLoggedIn');
  };

  const handleSave = async () => {
    if (!editStudent) return;

    setIsLoading(true);
    try {
      const studentData = {
        name: editStudent.name || '',
        number: editStudent.number || '',
        class: editStudent.class || '',
        description: editStudent.description || '',
        englishName: editStudent.englishName || '',
        motherName: editStudent.motherName || '',
        fatherName: editStudent.fatherName || '',
        photoUrl: editStudent.photoUrl || ''
      };
      if (editStudent.$id) {
        await databases.updateDocument(
          '67740d6d001e6019b3b7',
          '67740d7700148b3fcccb',
          editStudent.$id,
          studentData
        );
      } else {
        await databases.createDocument(
          '67740d6d001e6019b3b7',
          '67740d7700148b3fcccb',
          ID.unique(),
          studentData
        );
      }
      fetchStudents();
      setShowModal(false);
      setEditStudent(null);
      setSelectedImage(null);
    } catch (error) {
      console.error('Error saving student:', error);
      alert('Failed to save student. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (studentId: string) => {
    setIsLoading(true);
    try {
      await databases.deleteDocument(
        '67740d6d001e6019b3b7',
        '67740d7700148b3fcccb',
        studentId
      );
      fetchStudents();
      setShowDeleteModal(null);
    } catch (error) {
      console.error('Error deleting student:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = async () => {
    try {
      setIsLoading(true);
      let allStudents: Student[] = [];
      const limit = 100;
      let offset = 0;
      let hasMore = true;

      while (hasMore) {
        const response = await databases.listDocuments(
          '67740d6d001e6019b3b7',
          '67740d7700148b3fcccb',
          [
            Query.limit(limit),
            Query.offset(offset),
            ...(selectedClass ? [Query.equal('class', selectedClass)] : [])
          ]
        );

        allStudents = [...allStudents, ...(response.documents as Student[])];
        offset += limit;
        hasMore = offset < response.total;
      }

      if (allStudents.length === 0) {
        alert('No students found to export');
        return;
      }

      const headers = ['Name', 'Class', 'Number', 'Description', 'English Name', 'Mother Name', 'Father Name', 'Photo URL'];
      const csvRows = [
        headers.join(','),
        ...allStudents.map(student =>
          [
            `"${student.name}"`,
            `"${student.class}"`,
            `"${student.number}"`,
            `"${student.description || ''}"`,
            `"${student.englishName || ''}"`,
            `"${student.motherName || ''}"`,
            `"${student.fatherName || ''}"`,
            `"${student.photoUrl || ''}"`
          ].join(',')
        )
      ];

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `myschool_student_number_dataset_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      alert('Failed to export students data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedImage(file);
    const formData = new FormData();
    formData.append("image", file);

    try {
      setIsLoading(true);
      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${IMAGE_HOST_KEY}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        setEditStudent(prev => prev ? { ...prev, photoUrl: data.data.url } : null);
      } else {
        console.error("Error uploading image to ImgBB");
        alert("Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error uploading image");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoDownload = async (student: Student) => {
    if (!student.photoUrl) return;

    try {
      const response = await fetch(student.photoUrl);
      const blob = await response.blob();
      const urlParts = student.photoUrl.split('.');
      const extension = urlParts[urlParts.length - 1].toLowerCase();
      const fileName = `${student.englishName || student.name}_${student.class}.${extension === 'png' || extension === 'jpg' || extension === 'jpeg' ? extension : 'jpg'}`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading photo:', error);
      alert('Failed to download photo. Please try again.');
    }
  };

  const totalPages = Math.ceil(totalStudents / itemsPerPage);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          whileHover={{ scale: 1.005 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 relative overflow-hidden border border-white/20 backdrop-blur-lg"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-pink-100 opacity-30" />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 text-center mb-8">
              Welcome Back
            </h2>
            <form onSubmit={handleLogin} className="space-y-6">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-4 pl-12 border-0 bg-gray-50/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white shadow-sm transition-all"
                  />
                  <svg className="w-6 h-6 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-4 pl-12 border-0 bg-gray-50/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white shadow-sm transition-all"
                  />
                  <svg className="w-6 h-6 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="w-full p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Unlock Your Account
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl font-semibold text-gray-800">MySchool Student Management</h1>
          <div className="flex gap-3">
            <button onClick={() => { setEditStudent({ name: '', number: '', class: '', description: '', englishName: '', motherName: '', fatherName: '' }); setShowModal(true); }} className="flex items-center p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
              <Plus size={20} /> <span className="ml-1">Add</span>
            </button>
            <button
              onClick={exportToCSV}
              disabled={isLoading}
              className="flex items-center p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Export CSV</span>
            </button>
            <button onClick={handleLogout} className="flex items-center p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
              <LogOut size={20} /> <span className="ml-1">Logout</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <select
            value={selectedClass}
            onChange={(e) => { setSelectedClass(e.target.value); setCurrentPage(0); }}
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-auto"
          >
            <option value="">All Classes</option>
            {CLASS_OPTIONS.map(cls => <option key={cls} value={cls}>{cls}</option>)}
          </select>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-md mb-6">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex justify-between items-center hover:bg-gray-50 rounded-lg p-2 -m-2"
          >
            <h3 className="text-lg font-semibold text-gray-800">Display Options</h3>
            <svg
              className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isExpanded && (
            <div className="mt-4 animate-slideDown">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {Object.entries(displayOptions).map(([key, value]) => (
                  <label key={key} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={e => setDisplayOptions(prev => ({ ...prev, [key]: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm capitalize">
                      {key.replace('show', '').replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <motion.div
  layout
  className="bg-white rounded-xl shadow-md overflow-x-auto relative"
>
  {isLoading && (
    <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-8 h-8 border-4 border-t-blue-500 border-gray-300 rounded-full"
      />
    </div>
  )}
  <div className="w-full overflow-x-auto">
    <table className="w-full text-sm md:text-base">
      <thead>
        <tr className="bg-gray-100 text-gray-700">
          <th className="p-3 text-left">Name</th>
          {displayOptions.showEnglishName && <th className="p-3 text-left whitespace-nowrap">English Name</th>}
          {displayOptions.showMotherName && <th className="p-3 text-left whitespace-nowrap">Mother's Name</th>}
          {displayOptions.showFatherName && <th className="p-3 text-left whitespace-nowrap">Father's Name</th>}
          <th className="p-3 text-left whitespace-nowrap">Number</th>
          {displayOptions.showDescription && <th className="p-3 text-left whitespace-nowrap">Description</th>}
          {displayOptions.showPhoto && <th className="p-3 text-left whitespace-nowrap">Photo</th>}
          <th className="p-3 text-left whitespace-nowrap sticky right-0 bg-gray-100">Actions</th>
        </tr>
      </thead>
      <AnimatePresence>
        <tbody>
          {students.map(student => {
            // Function to format the number by removing '88' prefix if present
            const formatNumber = (number: string) => {
              return number.startsWith('88') ? number.slice(2) : number;
            };

            return (
              <motion.tr
                key={student.$id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                <td className="p-3">{student.name}</td>
                {displayOptions.showEnglishName && <td className="p-3 whitespace-nowrap">{student.englishName}</td>}
                {displayOptions.showMotherName && <td className="p-3 whitespace-nowrap">{student.motherName}</td>}
                {displayOptions.showFatherName && <td className="p-3 whitespace-nowrap">{student.fatherName}</td>}
                <td className="p-3 whitespace-nowrap">{formatNumber(student.number)}</td>
                {displayOptions.showDescription && <td className="p-3 whitespace-nowrap">{student.description}</td>}
                {displayOptions.showPhoto && (
                  <td className="p-3 whitespace-nowrap">
                    {student.photoUrl && (
                      <img src={student.photoUrl} alt="passport" className="w-12 h-12 object-cover rounded" />
                    )}
                  </td>
                )}
                <td className="p-3 flex gap-2 whitespace-nowrap sticky right-0 bg-white shadow-[inset_8px_0_8px_-8px_rgba(0,0,0,0.1)]">
                  <button
                    onClick={() => { setEditStudent(student); setShowModal(true); }}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(student.$id!)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash size={20} />
                  </button>
                  {student.photoUrl && (
                    <button
                      onClick={() => handlePhotoDownload(student)}
                      className="text-green-500 hover:text-green-700"
                    >
                      <Download size={20} />
                    </button>
                  )}
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </AnimatePresence>
    </table>
  </div>
  {students.length === 0 && !isLoading && (
    <div className="p-4 text-center text-gray-500">No students found</div>
  )}
</motion.div>

        <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center mt-4 gap-4">
          <div className="flex justify-center gap-4 w-full sm:w-auto">
            <button
              disabled={currentPage === 0 || isLoading}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="p-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 hover:bg-blue-600 transition-colors w-24 sm:w-auto"
            >
              Previous
            </button>
            <button
              disabled={currentPage + 1 >= totalPages || isLoading}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="p-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 hover:bg-blue-600 transition-colors w-24 sm:w-auto"
            >
              Next
            </button>
          </div>
          <span className="text-gray-700">Page {currentPage + 1} of {totalPages}</span>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">{editStudent?.$id ? 'Edit' : 'Add'} Student</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Name"
                  value={editStudent?.name || ''}
                  onChange={e => setEditStudent({ ...editStudent!, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
                <input
                  type="text"
                  placeholder="English Name"
                  value={editStudent?.englishName || ''}
                  onChange={e => setEditStudent({ ...editStudent!, englishName: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"

                />
                <input
                  type="text"
                  placeholder="Number"
                  value={editStudent?.number || ''}
                  onChange={e => setEditStudent({ ...editStudent!, number: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
                <select
                  value={editStudent?.class || ''}
                  onChange={e => setEditStudent({ ...editStudent!, class: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                >
                  <option value="">Select Class</option>
                  {CLASS_OPTIONS.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                </select>
                <textarea
                  placeholder="Description"
                  value={editStudent?.description || ''}
                  onChange={e => setEditStudent({ ...editStudent!, description: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[100px]"
                />
                <input
                  type="text"
                  placeholder="Father's Name"
                  value={editStudent?.fatherName || ''}
                  onChange={e => setEditStudent({ ...editStudent!, fatherName: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"

                />
                <input
                  type="text"
                  placeholder="Mother's Name"
                  value={editStudent?.motherName || ''}
                  onChange={e => setEditStudent({ ...editStudent!, motherName: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"

                />
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageUpload}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                  {editStudent?.photoUrl && (
                    <div className="relative">
                      <img src={editStudent.photoUrl} alt="Preview" className="w-32 h-32 object-cover rounded mx-auto" />
                      <button
                        onClick={() => setEditStudent({ ...editStudent!, photoUrl: '' })}
                        className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={isLoading || !editStudent?.name || !editStudent?.number || !editStudent?.class}
                    className="flex-1 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedImage(null);
                    }}
                    disabled={isLoading}
                    className="flex-1 p-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl p-6 w-full max-w-sm"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Confirm Delete</h2>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this student?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDelete(showDeleteModal)}
                  disabled={isLoading}
                  className="flex-1 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowDeleteModal(null)}
                  disabled={isLoading}
                  className="flex-1 p-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
                >
                  No
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;