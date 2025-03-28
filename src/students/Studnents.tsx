import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash, Edit, Download, X, Settings, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
// import Loading from '@/components/loader/Loading';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
interface Student {
  id?: string;
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

const StudentManagement = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
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
    showPhoto: true,
  });
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const itemsPerPage = 30;

  const handleFetchStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/students`, {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          class: selectedClass || undefined,
        },
      });
      setStudents(response.data.students);
      setTotalStudents(response.data.total);
    } catch (error) {
      toast.error('Failed to fetch students');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, selectedClass]);

  useEffect(() => {
    const savedOptions = localStorage.getItem('displayOptions');
    if (savedOptions) setDisplayOptions(JSON.parse(savedOptions));
    handleFetchStudents();
  }, [handleFetchStudents]);

  useEffect(() => {
    localStorage.setItem('displayOptions', JSON.stringify(displayOptions));
  }, [displayOptions]);

  const handleSave = async () => {
    if (!editStudent || !editStudent.name || !editStudent.class) {
      toast.error('Name and Class are required');
      return;
    }
    setIsLoading(true);
    try {
      if (editStudent.id) {
        await axios.put(`${BACKEND_URL}/students/${editStudent.id}`, editStudent);
        toast.success('Student updated successfully');
      } else {
        await axios.post(`${BACKEND_URL}/students`, editStudent);
        toast.success('Student saved successfully');
      }
      await handleFetchStudents();
      setShowModal(false);
      setEditStudent(null);
      setSelectedImage(null);
    } catch (error) {
      toast.error('Failed to save student');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (studentId: string) => {
    setIsLoading(true);
    try {
      await axios.delete(`${BACKEND_URL}/students/${studentId}`);
      await handleFetchStudents();
      setShowDeleteModal(null);
      toast.success('Student deleted successfully');
    } catch (error) {
      toast.error('Failed to delete student');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportToCSV = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/students/export-csv`, {
        params: { class: selectedClass || undefined },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `students${selectedClass ? `_${selectedClass}` : ''}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('CSV exported successfully');
    } catch (error) {
      toast.error('Failed to export CSV');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImage(file);
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const response = await axios.post(`${BACKEND_URL}/students/upload-photo`, formData);
      setEditStudent(prev => (prev ? { ...prev, photoUrl: response.data.photoUrl } : null));
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoDownload = async (student: Student) => {
    if (!student.photoUrl) {
      toast.error('No photo available to download');
      return;
    }
    try {
      const response = await axios.get(student.photoUrl, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${student.name}_${student.class}.jpg`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Photo downloaded');
    } catch (error) {
      toast.error('Failed to download photo');
      console.error(error);
    }
  };

  const totalPages = Math.ceil(totalStudents / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <ToastContainer position="top-right" autoClose={3000} />
      {isLoading}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Student Profiles
            </h1>
            <p className="text-gray-600 mt-1">Total Students: {totalStudents}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={() => {
                setEditStudent({
                  name: '', number: '', class: '', description: '',
                  englishName: '', motherName: '', fatherName: ''
                });
                setShowModal(true);
              }}
              className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl
              hover:bg-blue-700 transition-colors shadow-lg gap-2"
            >
              <Plus size={20} />
              <span className="text-sm font-medium">Add Student</span>
            </button>

            <button
              onClick={handleExportToCSV}
              className="flex items-center justify-center px-6 py-3 bg-emerald-600 text-white rounded-xl
              hover:bg-emerald-700 transition-colors shadow-lg gap-2"
            >
              <Download size={20} />
              <span className="text-sm font-medium">Export CSV</span>
            </button>

            <button
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors shadow-lg gap-2"
            >
              <Settings size={20} />
              <span className="text-sm font-medium">Customize View</span>
              {Object.values(displayOptions).filter(v => !v).length > 0 && (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {Object.values(displayOptions).filter(v => !v).length}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Class Filter Chips */}
        <div className="flex flex-wrap gap-2">
          {CLASS_OPTIONS.map(cls => (
            <button
              key={cls}
              onClick={() => {
                setSelectedClass(prev => prev === cls ? '' : cls);
                setCurrentPage(0);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedClass === cls
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 shadow-sm hover:shadow-md'
                }`}
            >
              {cls}
            </button>
          ))}
        </div>





        {/* Student Profiles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <motion.div
                  key={`skeleton-${index}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-2xl p-4 shadow-sm animate-pulse"
                >
                  <div className="h-40 bg-gray-200 rounded-xl mb-4" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </motion.div>
              ))
            ) : students.length > 0 ? (
              students.map(student => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Profile Header */}
                  {displayOptions.showPhoto && (
                    <div className="relative group">
                      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-100">
                        {student.photoUrl ? (
                          <img
                            src={student.photoUrl}
                            alt={student.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <User size={48} />
                          </div>
                        )}
                      </div>

                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {student.photoUrl && (
                          <button
                            onClick={() => handlePhotoDownload(student)}
                            className="p-2 bg-white rounded-lg shadow-sm hover:bg-green-50 text-green-600"
                          >
                            <Download size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => { setEditStudent(student); setShowModal(true); }}
                          className="p-2 bg-white rounded-lg shadow-sm hover:bg-blue-50 text-blue-600"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => setShowDeleteModal(student.id!)}
                          className="p-2 bg-white rounded-lg shadow-sm hover:bg-red-50 text-red-600"
                        >
                          <Trash size={18} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Profile Details */}
                  <div className="mt-4 space-y-2">
                    {Object.entries(displayOptions).map(([key, show]) => {
                      if (!show) return null;
                      const field = key.replace('show', '').toLowerCase();
                      if (field === 'photo') return null; // Skip photo as it's handled above

                      switch (field) {
                        case 'name':
                          return student.name && (
                            <h3 key={field} className="text-xl font-semibold text-gray-900">{student.name}</h3>
                          );
                        case 'class':
                          return student.class && (
                            <span key={field} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                              {student.class}
                            </span>
                          );
                        case 'number':
                          return student.number && (
                            <a
                              href={`tel:${student.number}`}
                              key={field}
                              className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm hover:bg-green-200 transition-colors"
                            >
                              {student.number.replace(/^88/, '')}
                            </a>
                          );
                        case 'englishname':
                          return student.englishName && (
                            <p key={field} className="text-sm text-gray-600">
                              <span className="font-medium">English Name:</span> {student.englishName}
                            </p>
                          );
                        case 'fathername':
                          return student.fatherName && (
                            <p key={field} className="text-sm text-gray-600">
                              <span className="font-medium">Father:</span> {student.fatherName}
                            </p>
                          );
                        case 'mothername':
                          return student.motherName && (
                            <p key={field} className="text-sm text-gray-600">
                              <span className="font-medium">Mother:</span> {student.motherName}
                            </p>
                          );
                        case 'description':
                          return student.description && (
                            <p key={field} className="text-sm text-gray-600 pt-2 border-t border-gray-100 mt-2">
                              {student.description}
                            </p>
                          );
                        default:
                          return null;
                      }
                    })}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-500 text-lg">No students found</div>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => prev - 1)}
              disabled={currentPage === 0}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700
                hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={currentPage + 1 >= totalPages}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700
                hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
            >
              Next
            </button>
          </div>
          <div className="text-sm text-gray-600">
            Page {currentPage + 1} of {totalPages}
          </div>
        </div>

        {/* Add/Edit Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white rounded-2xl w-full max-w-2xl shadow-xl"
              >
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editStudent?.id ? 'Edit Student' : 'New Student'}
                  </h2>
                  <button
                    onClick={() => { setShowModal(false); setSelectedImage(null); }}
                    className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        value={editStudent?.name || ''}
                        onChange={e => setEditStudent(prev => prev ? { ...prev, name: e.target.value } : null)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2
                          focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Class <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={editStudent?.class || ''}
                        onChange={e => setEditStudent(prev => prev ? { ...prev, class: e.target.value } : null)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2
                          focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Class</option>
                        {CLASS_OPTIONS.map(cls => (
                          <option key={cls} value={cls}>{cls}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        English Name
                      </label>
                      <input
                        value={editStudent?.englishName || ''}
                        onChange={e => setEditStudent(prev => prev ? { ...prev, englishName: e.target.value } : null)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2
                          focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Number
                      </label>
                      <input
                        value={editStudent?.number || ''}
                        onChange={e => setEditStudent(prev => prev ? { ...prev, number: e.target.value } : null)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2
                          focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Father's Name
                      </label>
                      <input
                        value={editStudent?.fatherName || ''}
                        onChange={e => setEditStudent(prev => prev ? { ...prev, fatherName: e.target.value } : null)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2
                          focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mother's Name
                      </label>
                      <input
                        value={editStudent?.motherName || ''}
                        onChange={e => setEditStudent(prev => prev ? { ...prev, motherName: e.target.value } : null)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2
                          focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={editStudent?.description || ''}
                      onChange={e => setEditStudent(prev => prev ? { ...prev, description: e.target.value } : null)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2
                        focus:ring-blue-500 focus:border-transparent min-h-[100px]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Student Photo
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        {editStudent?.photoUrl ? (
                          <>
                            <img
                              src={editStudent.photoUrl}
                              alt="Preview"
                              className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                            />
                            <button
                              onClick={() => setEditStudent(prev => prev ? { ...prev, photoUrl: '' } : null)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full
                                hover:bg-red-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <div className="w-20 h-20 flex items-center justify-center bg-gray-100 rounded-lg">
                            <span className="text-gray-400 text-sm">No photo</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="photo-upload"
                        />
                        <label
                          htmlFor="photo-upload"
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                            transition-colors cursor-pointer text-center text-sm"
                        >
                          Upload Photo
                        </label>
                        <span className="text-xs text-gray-500">
                          Recommended size: 300x300px
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                  <button
                    onClick={() => { setShowModal(false); setSelectedImage(null); }}
                    className="px-6 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                      transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : 'Save Student'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
              >
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <Trash className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Delete Student?
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Are you sure you want to permanently remove this student record?
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => setShowDeleteModal(null)}
                      className="px-6 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDelete(showDeleteModal!)}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Confirm Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>


        <AnimatePresence>
          {showSettingsModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Customize View</h3>
                  <button
                    onClick={() => setShowSettingsModal(false)}
                    className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="space-y-3">
                  {Object.entries(displayOptions).map(([key, value]) => (
                    <label
                      key={key}
                      className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={e => setDisplayOptions(prev => ({ ...prev, [key]: e.target.checked }))}
                          className="sr-only"
                        />
                        <div
                          className={`w-5 h-5 border-2 rounded-md flex items-center justify-center transition-all ${value ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'
                            }`}
                        >
                          {value && (
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {key.replace('show', '').replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowSettingsModal(false)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>


      </div>
    </div>
  );
};

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

export default StudentManagement;