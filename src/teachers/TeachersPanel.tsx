import React, { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash, Edit, X, Settings, Download, Phone, Mail, BookOpen, Calendar, Droplet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import Loading from '@/components/loader/Loading';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export interface Teacher {
  id?: string;
  nameBangla: string;
  nameEnglish: string;
  subject: string;
  designation: string;
  joiningDate: string;
  nid: string;
  mobile: string;
  salary: string;
  email: string;
  address: string;
  bloodGroup: string;
  workingDays: string;
  photoUrl: string;
}

const MySchoolStaffPanel = () => {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editTeacher, setEditTeacher] = useState<Teacher | null>(null);
  const [operationStatus, setOperationStatus] = useState<'idle' | 'saving' | 'updating' | 'deleting' | 'uploading'>('idle');
  const [visibleFields, setVisibleFields] = useState(() => {
    const savedFields = localStorage.getItem('visibleFields');
    return savedFields
      ? JSON.parse(savedFields)
      : {
          nameBangla: true,
          nameEnglish: true,
          subject: true,
          designation: true,
          joiningDate: true,
          nid: true,
          mobile: true,
          salary: true,
          email: true,
          address: true,
          bloodGroup: true,
          workingDays: true,
          photoUrl: true,
        };
  });

  useEffect(() => {
    localStorage.setItem('visibleFields', JSON.stringify(visibleFields));
  }, [visibleFields]);

  const fetchTeachers = async () => {
    const response = await axios.get(`${BACKEND_URL}/teachers`);
    return response.data.teachers;
  };

  const { data: teachers = [], isLoading, error } = useQuery({
    queryKey: ['teachers'],
    queryFn: fetchTeachers,
  });

  const formatDateBD = useCallback((dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? 'Invalid Date'
      : new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
  }, []);

  const uploadImageToImgBB = async (file: File): Promise<string> => {
    const IMAGE_HOST_KEY = import.meta.env.VITE_IMGBB_API_KEY;
    if (!IMAGE_HOST_KEY) throw new Error('ImgBB API key not configured');
    const formData = new FormData();
    formData.append('image', file);
    setOperationStatus('uploading');
    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMAGE_HOST_KEY}`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Error uploading image to ImgBB');
      const data = await response.json();
      setOperationStatus('idle');
      return data.data.url;
    } catch (error) {
      setOperationStatus('idle');
      throw error;
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const photoUrl = await uploadImageToImgBB(file);
      setEditTeacher(prev => (prev ? { ...prev, photoUrl } : null));
      toast.success('Photo uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload photo');
    }
  };

  const downloadPhoto = (photoUrl: string, name: string) => {
    const link = document.createElement('a');
    link.href = photoUrl;
    link.download = `${name}_photo.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const saveMutation = useMutation({
    mutationFn: (teacher: Teacher) =>
      teacher.id
        ? axios.put(`${BACKEND_URL}/teachers/${teacher.id}`, teacher)
        : axios.post(`${BACKEND_URL}/teachers`, teacher),
    onMutate: () => setOperationStatus(editTeacher?.id ? 'updating' : 'saving'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast.success('Teacher saved successfully');
      setShowAddModal(false);
      setEditTeacher(null);
      setOperationStatus('idle');
    },
    onError: (error: any) => {
      toast.error(`Failed to save teacher: ${error.message}`);
      setOperationStatus('idle');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`${BACKEND_URL}/teachers/${id}`),
    onMutate: () => setOperationStatus('deleting'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast.success('Teacher deleted successfully');
      setShowDeleteModal(null);
      setOperationStatus('idle');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete teacher: ${error.message}`);
      setOperationStatus('idle');
    },
  });

  const handleSave = () => {
    if (!editTeacher?.nameBangla || !editTeacher?.designation) {
      toast.error('Name (Bangla) and Designation are required');
      return;
    }
    saveMutation.mutate(editTeacher!);
  };

  const canCloseModal = !['saving', 'updating', 'deleting', 'uploading'].includes(operationStatus);

  const fieldOrder = [
    'nameBangla',
    'nameEnglish',
    'subject',
    'designation',
    'joiningDate',
    'nid',
    'mobile',
    'salary',
    'email',
    'address',
    'bloodGroup',
    'workingDays',
    'photoUrl',
  ];

  const visibleFieldKeys = fieldOrder.filter(field => visibleFields[field]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 font-sans">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-full sm:max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row justify-between items-center py-4 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            School Staff Directory
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center px-4 py-2 bg-white text-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
            >
              <Settings size={18} className="mr-2 text-gray-500" />
              Customize View
            </button>
            <button
              onClick={() => {
                setEditTeacher({
                  id: '',
                  nameBangla: '',
                  nameEnglish: '',
                  subject: '',
                  designation: '',
                  joiningDate: '',
                  nid: '',
                  mobile: '',
                  salary: '',
                  email: '',
                  address: '',
                  bloodGroup: '',
                  workingDays: '',
                  photoUrl: '',
                });
                setShowAddModal(true);
              }}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} className="mr-2" />
              Add New Staff
            </button>
          </div>
        </header>

        {isLoading ? (
         <Loading />
        ) : error ? (
          <div className="p-4 text-center text-red-500">Error loading staff data: {(error as Error).message}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {teachers.map((teacher, index) => (
              <motion.div
                key={teacher.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                        <img
                          src={teacher.photoUrl || '/placeholder-avatar.png'}
                          alt={teacher.nameEnglish || teacher.nameBangla}
                          className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-sm"
                        />
                        <button
                          onClick={async () => {
                          try {
                            const response = await fetch(teacher.photoUrl!);
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `${teacher.nameEnglish || teacher.nameBangla}_photo.jpg`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            window.URL.revokeObjectURL(url);
                          } catch (error) {
                            toast.error('Failed to download image');
                          }
                          }}
                          className="absolute -bottom-2 -right-2 bg-blue-100 p-1.5 rounded-full shadow-sm hover:bg-blue-200 transition-colors"
                        >
                          <Download size={16} className="text-blue-600" />
                        </button>
                        </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-800">
                          {teacher.nameEnglish || teacher.nameBangla}
                        </h2>
                        <p className="text-sm text-gray-600">{teacher.designation}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditTeacher(teacher);
                          setShowAddModal(true);
                        }}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => setShowDeleteModal(teacher.id!)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {visibleFields.mobile && (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <Phone size={16} className="text-gray-500" />
                        <a href={`tel:${teacher.mobile}`} className="text-gray-700 hover:text-blue-600">
                          {teacher.mobile || 'N/A'}
                        </a>
                      </div>
                    )}

                    {visibleFields.email && (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <Mail size={16} className="text-gray-500" />
                        <a href={`mailto:${teacher.email}`} className="text-gray-700 hover:text-blue-600 truncate">
                          {teacher.email || 'N/A'}
                        </a>
                      </div>
                    )}

                    {visibleFields.subject && teacher.subject && (
                      <div className="col-span-2 flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <BookOpen size={16} className="text-gray-500" />
                        <span className="text-gray-700">{teacher.subject}</span>
                      </div>
                    )}

                    {visibleFields.joiningDate && (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <Calendar size={16} className="text-gray-500" />
                        <span className="text-gray-700">
                          Joined: {formatDateBD(teacher.joiningDate)}
                        </span>
                      </div>
                    )}

                    {visibleFields.bloodGroup && teacher.bloodGroup && (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <Droplet size={16} className="text-gray-500" />
                        <span className="text-gray-700">Blood Group: {teacher.bloodGroup}</span>
                      </div>
                    )}
                  </div>

                  {(visibleFields.address || visibleFields.nid || visibleFields.salary) && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                        Additional Information
                      </h3>
                      <div className="space-y-1 text-sm">
                        {visibleFields.address && teacher.address && (
                          <p className="text-gray-600">📍 {teacher.address}</p>
                        )}
                        {visibleFields.nid && teacher.nid && (
                          <p className="text-gray-600">🆔 NID: {teacher.nid}</p>
                        )}
                        {visibleFields.salary && teacher.salary && (
                          <p className="text-gray-600">💵 Salary: ৳{teacher.salary}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add/Edit Staff Modal */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {editTeacher?.id ? 'Edit Staff' : 'New Staff Member'}
                  </h2>
                  <button
                    onClick={() => canCloseModal && setShowAddModal(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Name (Bangla) *</label>
                      <input
                        type="text"
                        value={editTeacher?.nameBangla || ''}
                        onChange={e => setEditTeacher(prev => prev ? { ...prev, nameBangla: e.target.value } : null)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Name (English)</label>
                      <input
                        type="text"
                        value={editTeacher?.nameEnglish || ''}
                        onChange={e => setEditTeacher(prev => prev ? { ...prev, nameEnglish: e.target.value } : null)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Designation *</label>
                      <input
                        type="text"
                        value={editTeacher?.designation || ''}
                        onChange={e => setEditTeacher(prev => prev ? { ...prev, designation: e.target.value } : null)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Subject</label>
                      <input
                        type="text"
                        value={editTeacher?.subject || ''}
                        onChange={e => setEditTeacher(prev => prev ? { ...prev, subject: e.target.value } : null)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Joining Date</label>
                      <input
                        type="date"
                        value={editTeacher?.joiningDate ? editTeacher.joiningDate.split('T')[0] : ''}
                        onChange={e => setEditTeacher(prev => prev ? { ...prev, joiningDate: e.target.value } : null)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">NID</label>
                      <input
                        type="text"
                        value={editTeacher?.nid || ''}
                        onChange={e => setEditTeacher(prev => prev ? { ...prev, nid: e.target.value } : null)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Mobile</label>
                      <input
                        type="text"
                        value={editTeacher?.mobile || ''}
                        onChange={e => setEditTeacher(prev => prev ? { ...prev, mobile: e.target.value } : null)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Salary</label>
                      <input
                        type="number"
                        value={editTeacher?.salary || ''}
                        onChange={e => setEditTeacher(prev => prev ? { ...prev, salary: e.target.value } : null)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        value={editTeacher?.email || ''}
                        onChange={e => setEditTeacher(prev => prev ? { ...prev, email: e.target.value } : null)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      <input
                        type="text"
                        value={editTeacher?.address || ''}
                        onChange={e => setEditTeacher(prev => prev ? { ...prev, address: e.target.value } : null)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                      <input
                        type="text"
                        value={editTeacher?.bloodGroup || ''}
                        onChange={e => setEditTeacher(prev => prev ? { ...prev, bloodGroup: e.target.value } : null)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Working Days</label>
                      <input
                        type="text"
                        value={editTeacher?.workingDays || ''}
                        onChange={e => setEditTeacher(prev => prev ? { ...prev, workingDays: e.target.value } : null)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Profile Photo</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-100 file:text-blue-600 file:hover:bg-blue-200 transition-colors"
                      />
                      {editTeacher?.photoUrl && (
                        <div className="relative">
                          <img
                            src={editTeacher.photoUrl}
                            alt="Preview"
                            className="w-16 h-16 rounded-full border-4 border-white shadow-sm"
                          />
                          <button
                            onClick={() => setEditTeacher(prev => prev ? { ...prev, photoUrl: '' } : null)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-4">
                  <button
                    onClick={handleSave}
                    disabled={!canCloseModal}
                    className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {operationStatus === 'saving' ? 'Saving...' :
                     operationStatus === 'updating' ? 'Updating...' :
                     operationStatus === 'uploading' ? 'Uploading...' :
                     editTeacher?.id ? 'Save Changes' : 'Add Staff Member'}
                  </button>
                  <button
                    onClick={() => canCloseModal && setShowAddModal(false)}
                    className="py-3 px-6 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings Modal */}
        <AnimatePresence>
          {showSettingsModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Display Settings</h2>
                  <button
                    onClick={() => setShowSettingsModal(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {fieldOrder.map(field => (
                    <label
                      key={field}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={visibleFields[field]}
                        onChange={e => setVisibleFields(prev => ({ ...prev, [field]: e.target.checked }))}
                        className="h-5 w-5 text-blue-600 rounded border-gray-300"
                      />
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {field.replace(/([A-Z])/g, ' $1').replace('Url', ' URL')}
                      </span>
                    </label>
                  ))}
                </div>

                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="mt-6 w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Save Preferences
                </button>
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
              className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
              >
                <div className="text-center">
                  <Trash className="mx-auto h-12 w-12 text-red-500 mb-4" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Staff Member?</h3>
                  <p className="text-gray-600 mb-6">
                    This action cannot be undone. All information related to this staff member will be permanently removed.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => deleteMutation.mutate(showDeleteModal!)}
                      className="px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                    >
                      {operationStatus === 'deleting' ? 'Deleting...' : 'Yes, Delete'}
                    </button>
                    <button
                      onClick={() => setShowDeleteModal(null)}
                      className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MySchoolStaffPanel;