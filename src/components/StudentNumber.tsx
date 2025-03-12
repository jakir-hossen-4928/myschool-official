import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash, Edit, Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  fetchStudents,
  saveStudent,
  deleteStudent,
  exportStudentsToCSV,
  uploadImage,
  downloadPhoto
} from '../lib/appwrite';

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
    showPhoto: true
  });
  const itemsPerPage = 30;

  const handleFetchStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const { students: fetchedStudents, total } = await fetchStudents(currentPage, itemsPerPage, selectedClass);
      setStudents(fetchedStudents);
      setTotalStudents(total);

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
      await saveStudent(editStudent);
      await handleFetchStudents();
      setShowModal(false);
      setEditStudent(null);
      setSelectedImage(null);
      toast.success('Student saved successfully');
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
      await deleteStudent(studentId);
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
      await exportStudentsToCSV(selectedClass);
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
      const photoUrl = await uploadImage(file);
      setEditStudent(prev => prev ? { ...prev, photoUrl } : null);
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoDownload = async (student: Student) => {
    try {
      await downloadPhoto(student);
      toast.success('Photo downloaded');
    } catch (error) {
      toast.error('Failed to download photo');
      console.error(error);
    }
  };

  const totalPages = Math.ceil(totalStudents / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-inter">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex justify-center items-center gap-4 py-4">
          <div className="flex gap-3">
            <button
              onClick={() => {
                setEditStudent({ name: '', number: '', class: '', description: '', englishName: '', motherName: '', fatherName: '' });
                setShowModal(true);
              }}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Plus size={18} className="mr-2" /> Add Student
            </button>
            <button
              onClick={handleExportToCSV}
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 text-sm font-medium"
            >
              <Download size={18} className="mr-2" /> Export CSV
            </button>
          </div>
        </header>

        {/* Filter */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <select
            value={selectedClass}
            onChange={(e) => { setSelectedClass(e.target.value); setCurrentPage(0); }}
            className="w-full sm:w-60 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
          >
            <option value="">All Classes</option>
            {CLASS_OPTIONS.map(cls => <option key={cls} value={cls}>{cls}</option>)}
          </select>
        </div>

        {/* Display Options */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex justify-between items-center py-2 text-gray-900 font-medium"
          >
            Display Options
            <svg
              className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-3 overflow-hidden"
              >
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(displayOptions).map(([key, value]) => (
                    <label key={key} className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={e => setDisplayOptions(prev => ({ ...prev, [key]: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      {key.replace('show', '').replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center z-10">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 border-4 border-t-blue-600 border-gray-300 rounded-full"
              />
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-700">
              <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  {displayOptions.showEnglishName && <th className="p-3 text-left">English Name</th>}
                  {displayOptions.showMotherName && <th className="p-3 text-left">Mother</th>}
                  {displayOptions.showFatherName && <th className="p-3 text-left">Father</th>}
                  <th className="p-3 text-left">Number</th>
                  {displayOptions.showDescription && <th className="p-3 text-left">Description</th>}
                  {displayOptions.showPhoto && <th className="p-3 text-left">Photo</th>}
                  <th className="p-3 text-left sticky right-0 bg-gray-50">Actions</th>
                </tr>
              </thead>
              <AnimatePresence>
                <tbody>
                  {students.map(student => (
                    <motion.tr
                      key={student.$id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="p-3">{student.name}</td>
                      {displayOptions.showEnglishName && <td className="p-3">{student.englishName}</td>}
                      {displayOptions.showMotherName && <td className="p-3">{student.motherName}</td>}
                      {displayOptions.showFatherName && <td className="p-3">{student.fatherName}</td>}
                      <td className="p-3">{student.number?.startsWith('88') ? student.number.slice(2) : student.number}</td>
                      {displayOptions.showDescription && <td className="p-3">{student.description}</td>}
                      {displayOptions.showPhoto && (
                        <td className="p-3">
                          {student.photoUrl ? (
                            <img
                              src={student.photoUrl}
                              alt={student.name}
                              className="w-12 h-12 rounded-full object-cover border border-gray-200"
                              onClick={() => handlePhotoDownload(student)}
                              loading="lazy"
                            />
                          ) : (
                            <span className="text-gray-400">No Photo</span>
                          )}
                        </td>
                      )}
                      <td className="p-3 flex gap-2 sticky right-0 bg-white">
                        <button onClick={() => { setEditStudent(student); setShowModal(true); }} className="text-blue-600 hover:text-blue-800">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => setShowDeleteModal(student.$id!)} className="text-red-600 hover:text-red-800">
                          <Trash size={18} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </AnimatePresence>
            </table>
          </div>
          {!isLoading && students.length === 0 && (
            <div className="p-4 text-center text-gray-500">No students found</div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => prev - 1)}
              disabled={currentPage === 0 || isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={currentPage + 1 >= totalPages || isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
            >
              Next
            </button>
          </div>
          <span className="text-sm text-gray-600">Page {currentPage + 1} of {totalPages}</span>
        </div>


        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-opacity-50 flex items-start justify-center pt-16 pb-4 px-4 sm:p-4 z-50 overflow-y-auto"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-lg w-full max-w-[90vw] sm:max-w-md mx-auto p-4 sm:p-6 shadow-lg"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg sm:text-2xl font-semibold text-gray-900">
                    {editStudent?.$id ? 'Edit Student' : 'Add Student'}
                  </h2>
                  <button
                    onClick={() => { setShowModal(false); setSelectedImage(null); }}
                    className="text-gray-500 hover:text-gray-700 p-1"
                  >
                    <X size={18} />
                  </button>
                </div>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editStudent?.name || ''}
                        onChange={e => setEditStudent(prev => prev ? { ...prev, name: e.target.value } : null)}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">English Name</label>
                      <input
                        type="text"
                        value={editStudent?.englishName || ''}
                        onChange={e => setEditStudent(prev => prev ? { ...prev, englishName: e.target.value } : null)}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Class <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editStudent?.class || ''}
                      onChange={e => setEditStudent(prev => prev ? { ...prev, class: e.target.value } : null)}
                      className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                    >
                      <option value="">Select Class</option>
                      {CLASS_OPTIONS.map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Number</label>
                    <input
                      type="text"
                      value={editStudent?.number || ''}
                      onChange={e => setEditStudent(prev => prev ? { ...prev, number: e.target.value } : null)}
                      className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Father's Name</label>
                      <input
                        type="text"
                        value={editStudent?.fatherName || ''}
                        onChange={e => setEditStudent(prev => prev ? { ...prev, fatherName: e.target.value } : null)}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mother's Name</label>
                      <input
                        type="text"
                        value={editStudent?.motherName || ''}
                        onChange={e => setEditStudent(prev => prev ? { ...prev, motherName: e.target.value } : null)}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={editStudent?.description || ''}
                      onChange={e => setEditStudent(prev => prev ? { ...prev, description: e.target.value } : null)}
                      className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px] sm:min-h-[80px] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Photo</label>
                    <div className="mt-1 flex flex-col gap-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            // Create a select element for camera choice
                            const cameraInput = document.createElement('input');
                            cameraInput.type = 'file';
                            cameraInput.accept = 'image/*';
                            cameraInput.capture = 'environment'; // Defaults to back camera

                            // Allow multiple camera apps to be shown
                            cameraInput.setAttribute('multiple', ''); // This helps trigger app chooser on some devices

                            cameraInput.onchange = async (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) {
                                setSelectedImage(file);
                                setIsLoading(true);
                                try {
                                  const photoUrl = await uploadImage(file);
                                  setEditStudent(prev => prev ? { ...prev, photoUrl } : null);
                                  toast.success('Image uploaded successfully');
                                } catch (error) {
                                  toast.error('Failed to upload image');
                                  console.error(error);
                                } finally {
                                  setIsLoading(false);
                                }
                              }
                            };

                            // Create a temporary switch button for front/back camera
                            const switchCamera = () => {
                              const currentCapture = cameraInput.getAttribute('capture');
                              cameraInput.setAttribute(
                                'capture',
                                currentCapture === 'environment' ? 'user' : 'environment'
                              );
                              // Re-trigger the input click to apply new capture setting
                              cameraInput.click();
                            };

                            // Add event listener to switch cameras (this won't show UI, but functionality works)
                            cameraInput.addEventListener('click', (e) => {
                              // On mobile, this will show app chooser first
                              // After app selection, camera will open with default back camera
                              console.log('Camera opened with:', cameraInput.getAttribute('capture'));
                            });

                            cameraInput.click();

                            // Note: Actual camera switching UI would depend on the chosen camera app
                            // We can only set the initial preference; switching is handled by the native app
                          }}
                          className="flex-1 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium transition-colors"
                        >
                          Take Photo
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const galleryInput = document.createElement('input');
                            galleryInput.type = 'file';
                            galleryInput.accept = 'image/*';
                            galleryInput.onchange = async (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) {
                                setSelectedImage(file);
                                setIsLoading(true);
                                try {
                                  const photoUrl = await uploadImage(file);
                                  setEditStudent(prev => prev ? { ...prev, photoUrl } : null);
                                  toast.success('Image uploaded successfully');
                                } catch (error) {
                                  toast.error('Failed to upload image');
                                  console.error(error);
                                } finally {
                                  setIsLoading(false);
                                }
                              }
                            };
                            galleryInput.click();
                          }}
                          className="flex-1 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium transition-colors"
                        >
                          Pick from Gallery
                        </button>
                      </div>
                      <div className="mt-2">
                        {editStudent?.photoUrl ? (
                          <div className="relative inline-block">
                            <img
                              src={editStudent.photoUrl}
                              alt="Preview"
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-md object-cover"
                              loading="lazy"
                            />
                            <button
                              onClick={() => setEditStudent(prev => prev ? { ...prev, photoUrl: '' } : null)}
                              className="absolute top-0 right-0 bg-red-600 text-white p-1 rounded-full -mt-2 -mr-2 hover:bg-red-700"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-gray-100 rounded-md text-gray-500 text-sm">
                            No Photo
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={isLoading}
                      className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium transition-colors"
                    >
                      {isLoading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowModal(false); setSelectedImage(null); }}
                      disabled={isLoading}
                      className="w-full py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
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
              className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Confirm Deletion</h2>
                <p className="text-sm text-gray-600 mb-4">Are you sure you want to delete this student?</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleDelete(showDeleteModal!)}
                    disabled={isLoading}
                    className="flex-1 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
                  >
                    {isLoading ? 'Deleting...' : 'Yes'}
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(null)}
                    disabled={isLoading}
                    className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 text-sm font-medium"
                  >
                    No
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

export default StudentManagement;