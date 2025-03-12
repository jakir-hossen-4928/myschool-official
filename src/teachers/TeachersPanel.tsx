import React, { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash, Edit, X, Settings, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fetchTeachers, saveTeacher, deleteTeacher } from '../lib/appwrite';

export interface Teacher {
  $id?: string;
  nameBangla: string;
  nameEnglish: string;
  subject: string;
  designation: string;
  joiningDate: string;
  nid: string;
  mobile: string;
  bloodGroup: string;
  email: string;
  address: string;
  photoUrl?: string;
  salary: string;
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
      return savedFields ? JSON.parse(savedFields) : {
        nameBangla: true, nameEnglish: true, subject: true, designation: true,
        joiningDate: true, nid: true, mobile: true, bloodGroup: true,
        email: true, address: true, salary: true, photoUrl: true,
      };
    });


    // Save visibleFields to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('visibleFields', JSON.stringify(visibleFields));
  }, [visibleFields]);

  const { data: teachers = [], isLoading, error } = useQuery({
    queryKey: ['teachers'],
    queryFn: fetchTeachers,
  });

  const formatDateBD = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
  }, []);

  // ImgBB upload function
  const uploadImageToImgBB = async (file: File): Promise<string> => {
    const IMAGE_HOST_KEY = import.meta.env.VITE_IMGBB_API_KEY;
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
      setEditTeacher(prev => prev ? { ...prev, photoUrl } : null);
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
    mutationFn: saveTeacher,
    onMutate: () => setOperationStatus(editTeacher?.$id ? 'updating' : 'saving'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast.success('Teacher saved successfully');
      setShowAddModal(false);
      setEditTeacher(null);
      setOperationStatus('idle');
    },
    onError: (error) => {
      toast.error(`Failed to save teacher: ${error.message}`);
      setOperationStatus('idle');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTeacher,
    onMutate: () => setOperationStatus('deleting'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast.success('Teacher deleted successfully');
      setShowDeleteModal(null);
      setOperationStatus('idle');
    },
    onError: (error) => {
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

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 font-sans">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-full sm:max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row justify-between items-center py-4 gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">MySchool Staff Panel</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              <Settings size={18} className="mr-2" /> Settings
            </button>
            <button
              onClick={() => {
                setEditTeacher({
                  nameBangla: '', nameEnglish: '', subject: '', designation: '',
                  joiningDate: '', nid: '', mobile: '', bloodGroup: '', email: '',
                  address: '', salary: '', photoUrl: ''
                });
                setShowAddModal(true);
              }}
              disabled={!canCloseModal}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
            >
              <Plus size={18} className="mr-2" /> Add Staff
            </button>
          </div>
        </header>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {isLoading ? (
            <div className="p-4 text-center text-gray-600">Loading...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">Error loading teachers</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-gray-700">
                <thead className="bg-gray-200 text-gray-600 uppercase tracking-wider">
                  <tr>
                    {visibleFields.nameBangla && <th className="p-2 sm:p-3 text-left">Name (Bangla)</th>}
                    {visibleFields.nameEnglish && <th className="p-2 sm:p-3 text-left">Name (English)</th>}
                    {visibleFields.subject && <th className="p-2 sm:p-3 text-left">Subject</th>}
                    {visibleFields.designation && <th className="p-2 sm:p-3 text-left">Designation</th>}
                    {visibleFields.joiningDate && <th className="p-2 sm:p-3 text-left">Joining Date</th>}
                    {visibleFields.nid && <th className="p-2 sm:p-3 text-left">NID</th>}
                    {visibleFields.mobile && <th className="p-2 sm:p-3 text-left">Mobile</th>}
                    {visibleFields.bloodGroup && <th className="p-2 sm:p-3 text-left">Blood Group</th>}
                    {visibleFields.email && <th className="p-2 sm:p-3 text-left">Email</th>}
                    {visibleFields.address && <th className="p-2 sm:p-3 text-left">Address</th>}
                    {visibleFields.salary && <th className="p-2 sm:p-3 text-left">Salary</th>}
                    {visibleFields.photoUrl && <th className="p-2 sm:p-3 text-left">Photo</th>}
                    <th className="p-2 sm:p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <AnimatePresence>
                  <tbody>
                    {teachers.map((teacher, index) => (
                      <motion.tr key={teacher.$id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100`}>
                        {visibleFields.nameBangla && <td className="p-2 sm:p-3">{teacher.nameBangla}</td>}
                        {visibleFields.nameEnglish && <td className="p-2 sm:p-3">{teacher.nameEnglish}</td>}
                        {visibleFields.subject && <td className="p-2 sm:p-3">{teacher.subject}</td>}
                        {visibleFields.designation && <td className="p-2 sm:p-3">{teacher.designation}</td>}
                        {visibleFields.joiningDate && <td className="p-2 sm:p-3">{formatDateBD(teacher.joiningDate)}</td>}
                        {visibleFields.nid && <td className="p-2 sm:p-3">{teacher.nid}</td>}
                        {visibleFields.mobile && <td className="p-2 sm:p-3">{teacher.mobile}</td>}
                        {visibleFields.bloodGroup && <td className="p-2 sm:p-3">{teacher.bloodGroup}</td>}
                        {visibleFields.email && <td className="p-2 sm:p-3">{teacher.email}</td>}
                        {visibleFields.address && <td className="p-2 sm:p-3">{teacher.address}</td>}
                        {visibleFields.salary && <td className="p-2 sm:p-3">{teacher.salary || 'N/A'}</td>}
                        {visibleFields.photoUrl && <td className="p-2 sm:p-3">
                          {teacher.photoUrl ? (
                            <div className="flex items-center gap-2">
                              <img
                                src={teacher.photoUrl}
                                alt={teacher.nameEnglish || teacher.nameBangla}
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-gray-200"
                              />
                              <button onClick={() => downloadPhoto(teacher.photoUrl!, teacher.nameEnglish || teacher.nameBangla)}
                                className="text-blue-600 hover:text-blue-800">
                                <Download size={16} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-500">No Photo</span>
                          )}
                        </td>}
                        <td className="p-2 sm:p-3 flex gap-2">
                          <button onClick={() => { setEditTeacher(teacher); setShowAddModal(true); }}
                            disabled={!canCloseModal} className="text-blue-600 hover:text-blue-800 disabled:text-gray-400">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => setShowDeleteModal(teacher.$id!)}
                            disabled={!canCloseModal} className="text-red-600 hover:text-red-800 disabled:text-gray-400">
                            <Trash size={16} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </AnimatePresence>
              </table>
            </div>
          )}
        </div>

        <AnimatePresence>
          {showAddModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-[90vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
                <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 border-b pb-2">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                    {editTeacher?.$id ? 'Edit Staff' : 'Add Staff'}
                  </h2>
                  <button onClick={() => canCloseModal && setShowAddModal(false)}
                    disabled={!canCloseModal} className="text-gray-500 hover:text-gray-700 disabled:opacity-50">
                    <X size={18} />
                  </button>
                </div>
                <form className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">Name (Bangla) *</label>
                      <input type="text" value={editTeacher?.nameBangla || ''} onChange={e => setEditTeacher(prev => prev ? { ...prev, nameBangla: e.target.value } : null)}
                        className="mt-1 w-full p-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500" disabled={!canCloseModal} />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">Name (English)</label>
                      <input type="text" value={editTeacher?.nameEnglish || ''} onChange={e => setEditTeacher(prev => prev ? { ...prev, nameEnglish: e.target.value } : null)}
                        className="mt-1 w-full p-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500" disabled={!canCloseModal} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">Subject</label>
                      <input type="text" value={editTeacher?.subject || ''} onChange={e => setEditTeacher(prev => prev ? { ...prev, subject: e.target.value } : null)}
                        className="mt-1 w-full p-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500" disabled={!canCloseModal} />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">Designation *</label>
                      <input type="text" value={editTeacher?.designation || ''} onChange={e => setEditTeacher(prev => prev ? { ...prev, designation: e.target.value } : null)}
                        className="mt-1 w-full p-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500" disabled={!canCloseModal} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">Joining Date</label>
                      <input type="date" value={editTeacher?.joiningDate.split('T')[0] || ''} onChange={e => setEditTeacher(prev => prev ? { ...prev, joiningDate: e.target.value } : null)}
                        className="mt-1 w-full p-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500" disabled={!canCloseModal} />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">NID</label>
                      <input type="text" value={editTeacher?.nid || ''} onChange={e => setEditTeacher(prev => prev ? { ...prev, nid: e.target.value } : null)}
                        className="mt-1 w-full p-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500" disabled={!canCloseModal} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">Mobile</label>
                      <input type="text" value={editTeacher?.mobile || ''} onChange={e => setEditTeacher(prev => prev ? { ...prev, mobile: e.target.value } : null)}
                        className="mt-1 w-full p-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500" disabled={!canCloseModal} />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">Blood Group</label>
                      <input type="text" value={editTeacher?.bloodGroup || ''} onChange={e => setEditTeacher(prev => prev ? { ...prev, bloodGroup: e.target.value } : null)}
                        className="mt-1 w-full p-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500" disabled={!canCloseModal} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">Email</label>
                      <input type="email" value={editTeacher?.email || ''} onChange={e => setEditTeacher(prev => prev ? { ...prev, email: e.target.value } : null)}
                        className="mt-1 w-full p-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500" disabled={!canCloseModal} />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">Address</label>
                      <input type="text" value={editTeacher?.address || ''} onChange={e => setEditTeacher(prev => prev ? { ...prev, address: e.target.value } : null)}
                        className="mt-1 w-full p-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500" disabled={!canCloseModal} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">Salary</label>
                      <input type="number" value={editTeacher?.salary || ''} onChange={e => setEditTeacher(prev => prev ? { ...prev, salary: e.target.value } : null)}
                        className="mt-1 w-full p-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500" disabled={!canCloseModal} />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">Photo</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="mt-1 w-full p-2 text-sm border rounded-md text-gray-700 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:bg-blue-600 file:text-white file:hover:bg-blue-700"
                        disabled={!canCloseModal}
                      />
                      {editTeacher?.photoUrl && (
                        <div className="mt-2 relative inline-block">
                          <img
                            src={editTeacher.photoUrl}
                            alt="Preview"
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-md object-cover border-2 border-gray-200"
                          />
                          <button
                            onClick={() => setEditTeacher(prev => prev ? { ...prev, photoUrl: '' } : null)}
                            className="absolute top-0 right-0 bg-red-600 text-white p-1 rounded-full -mt-2 -mr-2 hover:bg-red-700"
                            disabled={!canCloseModal}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button type="button" onClick={handleSave} disabled={!canCloseModal}
                      className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 flex items-center justify-center">
                      {operationStatus === 'saving' || operationStatus === 'updating' || operationStatus === 'uploading' ? (
                        <>
                          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                          {operationStatus === 'uploading' ? 'Uploading...' : operationStatus === 'saving' ? 'Saving...' : 'Updating...'}
                        </>
                      ) : (
                        editTeacher?.$id ? 'Update' : 'Save'
                      )}
                    </button>
                    <button type="button" onClick={() => canCloseModal && setShowAddModal(false)} disabled={!canCloseModal}
                      className="w-full py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:bg-gray-300">
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
    {showSettingsModal && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
          className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Display Settings</h2>
            <button onClick={() => setShowSettingsModal(false)} className="text-gray-500 hover:text-gray-700">
              <X size={18} />
            </button>
          </div>
          <div className="space-y-2">
            {Object.keys(visibleFields).map(field => (
              <label key={field} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={visibleFields[field]}
                  onChange={e => setVisibleFields(prev => ({ ...prev, [field]: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <span className="text-sm capitalize">{field.replace(/([A-Z])/g, ' $1')}</span>
              </label>
            ))}
          </div>
          <button
            onClick={() => {
              localStorage.setItem('visibleFields', JSON.stringify(visibleFields)); // Explicitly save on button click
              setShowSettingsModal(false);
              toast.success('Settings saved successfully');
            }}
            className="mt-4 w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save Settings
          </button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>

        <AnimatePresence>
          {showDeleteModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl">
                <h2 className="text-lg font-semibold mb-3 text-gray-800">Confirm Deletion</h2>
                <p className="text-sm text-gray-600 mb-4">Are you sure you want to delete this staff member?</p>
                <div className="flex gap-3">
                  <button onClick={() => deleteMutation.mutate(showDeleteModal!)} disabled={!canCloseModal}
                    className="flex-1 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400 flex items-center justify-center">
                    {operationStatus === 'deleting' ? (
                      <>
                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Deleting...
                      </>
                    ) : (
                      'Yes'
                    )}
                  </button>
                  <button onClick={() => setShowDeleteModal(null)} disabled={!canCloseModal}
                    className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:bg-gray-300">
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

export default MySchoolStaffPanel;