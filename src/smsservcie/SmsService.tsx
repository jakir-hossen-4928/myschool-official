import React, { useState, useEffect, useCallback } from 'react';
import { databases, APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID } from '../lib/appwrite';
import { Query } from 'appwrite';
import { motion, AnimatePresence } from 'framer-motion';
import { FiInfo, FiClipboard, FiSend, FiUsers, FiDollarSign, FiWifi, FiX } from 'react-icons/fi';

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

const ERROR_CODES: { [key: number]: string } = {
  202: "SMS Submitted Successfully",
  1001: "Invalid Number",
  1002: "Sender ID not correct or disabled",
  1003: "Please fill all required fields or contact your System Administrator",
  1005: "Internal Error",
  1006: "Balance Validity Not Available",
  1007: "Balance Insufficient",
  1011: "User ID not found",
  1012: "Masking SMS must be sent in Bengali",
  1013: "Sender ID has not found Gateway by API key",
  1014: "Sender Type Name not found using this sender by API key",
  1015: "Sender ID has not found any valid Gateway by API key",
  1016: "Sender Type Name Active Price Info not found by this sender ID",
  1017: "Sender Type Name Price Info not found by this sender ID",
  1018: "The Owner of this account is disabled",
  1019: "The Sender Type Name Price of this account is disabled",
  1020: "The parent of this account is not found",
  1021: "The parent active Sender Type Name price of this account is not found",
  1031: "Your Account Not Verified, Please Contact Administrator",
  1032: "IP Not whitelisted"
};

const PLACEHOLDERS = [
  { key: '{student_name}', label: 'Student Name' },
  { key: '{english_name}', label: 'English Name' },
  { key: '{class}', label: 'Class' },
  { key: '{mother_name}', label: 'Mother Name' },
  { key: '{father_name}', label: 'Father Name' },
];

const SMSService = () => {
  const [message, setMessage] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedNumbers, setSelectedNumbers] = useState<string[]>([]);
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [smsRate] = useState(0.35); // Taka per SMS part
  const [totalCost, setTotalCost] = useState(0);
  const [ipAddress, setIpAddress] = useState('');
  const [accountBalance, setAccountBalance] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);

  const API_KEY = import.meta.env.VITE_BULKSMSBD_API_KEY;
  const SENDER_ID = import.meta.env.VITE_BULKSMSBD_SENDER_ID;
  const BASE_URL = import.meta.env.VITE_BULKSMSBD_URL;
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const log = (message: string) => {
    console.log(`[SMSService] ${message}`);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`].slice(-10));
  };

  // Insert placeholder into message
  const insertPlaceholder = (placeholder: string) => {
    setMessage(prev => `${prev}${placeholder} `);
  };

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      log('Fetching initial data...');
      try {
        // Fetch IP address
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        setIpAddress(ipData.ip);

        // Fetch balance from backend
        const balanceResponse = await fetch(`${BACKEND_URL}/getBalance`);
        const balanceData = await balanceResponse.json();

        if (balanceResponse.ok && balanceData.balance !== undefined) {
          setApiStatus('connected');
          setAccountBalance(parseFloat(balanceData.balance));
        } else {
          setApiStatus('error');
          log(`SMS provider error: ${balanceData.error || 'Unknown error'}`);
        }
      } catch (error) {
        setApiStatus('error');
        log(`Initialization error: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, [BACKEND_URL]);

  const fetchStudentsByClass = useCallback(async () => {
    if (!selectedClass) return;
    setIsLoading(true);
    log(`Fetching students for class: ${selectedClass}`);
    try {
      const totalResponse = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        APPWRITE_COLLECTION_ID,
        [Query.equal('class', selectedClass)]
      );
      setTotalStudents(totalResponse.total);

      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        APPWRITE_COLLECTION_ID,
        [
          Query.equal('class', selectedClass),
          Query.limit(itemsPerPage),
          Query.offset((currentPage - 1) * itemsPerPage),
          Query.orderAsc('name')
        ]
      );
      setStudents(response.documents as Student[]);
      log(`Fetched ${response.documents.length} of ${totalResponse.total} students`);
    } catch (error) {
      log(`Error fetching students: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  }, [selectedClass, currentPage, itemsPerPage]);

  useEffect(() => {
    fetchStudentsByClass();
  }, [fetchStudentsByClass]);


  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.number.includes(searchTerm)
  );

  const handleNumberSelection = (number: string) => {
    setSelectedNumbers(prev =>
      prev.includes(number) ? prev.filter(n => n !== number) : [...prev, number]
    );
  };
  const generatePersonalizedMessage = (student: Student) => {
    let personalizedMessage = message;
    personalizedMessage = personalizedMessage.replace('{student_name}', student.name);
    personalizedMessage = personalizedMessage.replace('{english_name}', student.englishName);
    personalizedMessage = personalizedMessage.replace('{class}', student.class);
    personalizedMessage = personalizedMessage.replace('{mother_name}', student.motherName);
    personalizedMessage = personalizedMessage.replace('{father_name}', student.fatherName);
    return personalizedMessage;
  };

  useEffect(() => {
    const calculateCost = () => {
      const gsm7BitExChars = /^[A-Za-z0-9 \r\n@£$¥èéùìòÇØøÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ!\"#$%&'()*+,\-./:;<=>?¡ÄÖÑÜ§¿äöñüà^{}\[~\]|€]+$/;

      const maxLength = selectedNumbers.reduce((max, number) => {
        const student = students.find(s => s.number === number);
        if (student) {
          const personalizedMessage = generatePersonalizedMessage(student);
          const isGSM7 = gsm7BitExChars.test(personalizedMessage);
          return Math.max(max, isGSM7 ? 160 : 70);
        }
        return max;
      }, 160); // Default to GSM-7 length if no students selected

      const maxMessageLength = selectedNumbers.reduce((max, number) => {
        const student = students.find(s => s.number === number);
        if (student) {
          const personalizedMessage = generatePersonalizedMessage(student);
          return Math.max(max, personalizedMessage.length);
        }
        return max;
      }, message.length);

      const parts = Math.ceil(maxMessageLength / maxLength);
      const cost = parts * selectedNumbers.length * smsRate;
      setTotalCost(cost);
    };
    calculateCost();
  }, [message, selectedNumbers, smsRate, students, generatePersonalizedMessage]);

  const sendSMS = async () => {
    if (!selectedNumbers.length || !message) {
      alert('Please select recipients and enter a message!');
      return;
    }
    if (totalCost > (accountBalance || 0)) {
      alert('Insufficient balance!');
      return;
    }

    setIsLoading(true);
    try {
      const promises = selectedNumbers.map(async (number) => {
        const student = students.find(s => s.number === number);
        if (!student) return;
        const personalizedMessage = generatePersonalizedMessage(student);
        const response = await fetch(`${BACKEND_URL}/sendSMS`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: API_KEY,
            senderid: SENDER_ID,
            number: number,
            message: personalizedMessage,
          }),
        });
        return response.json();
      });

      const results = await Promise.all(promises);
      const allSuccessful = results.every(result => result?.response_code === 202);

      if (allSuccessful) {
        alert('All SMS sent successfully!');
        setMessage('');
        setSelectedNumbers([]);
        setAccountBalance(prev => prev ? prev - totalCost : null);
        log('All SMS sent successfully');
      } else {
        const errors = results.map((result, index) =>
          result?.response_code !== 202
            ? `SMS to ${selectedNumbers[index]} failed: ${ERROR_CODES[result?.response_code] || 'Unknown error'}`
            : null
        ).filter(Boolean);
        alert(`Some SMS failed:\n${errors.join('\n')}`);
        log(`Some SMS failed: ${errors.join(', ')}`);
      }
    } catch (error) {
      alert('Failed to send SMS.');
      log(`SMS sending error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // UI Components
  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.3)'
  };

  const AnimatedGradient = () => (
    <motion.div
      className="absolute inset-0 z-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-100 via-green-100 to-purple-100 opacity-50 animate-gradient-x" />
    </motion.div>
  );

  const TutorialOverlay = () => (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div style={glassStyle} className="p-8 max-w-2xl relative">
        <button
          onClick={() => setShowTutorial(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <FiX size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <FiInfo className="text-blue-500" /> SMS Dashboard Guide
        </h2>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">1</div>
            <div>
              <h3 className="font-semibold">Select a Class</h3>
              <p className="text-gray-600">Choose the student class from the dropdown to load recipients</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">2</div>
            <div>
              <h3 className="font-semibold">Craft Your Message</h3>
              <p className="text-gray-600">Use placeholders to personalize messages for each student</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">3</div>
            <div>
              <h3 className="font-semibold">Review & Send</h3>
              <p className="text-gray-600">Check estimated costs and balance before sending</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setMessage(prev => prev + text); // Appends the pasted text to existing message
    } catch (error) {
      alert('Failed to paste from clipboard.');
      log(`Clipboard paste error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };


  return (
    <div className="relative min-h-screen">
      <AnimatedGradient />

      {showTutorial && <TutorialOverlay />}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 p-6 max-w-6xl mx-auto"
      >
        {/* Status Ribbon */}
        <motion.div
          style={glassStyle}
          className="flex flex-wrap gap-4 items-center justify-between p-4 mb-8 shadow-lg"
        >
          <div className="flex items-center gap-2">
            <FiWifi className={`text-lg ${apiStatus === 'connected' ? 'text-green-500' : 'text-red-500'}`} />
            <span className="font-medium">Connection: </span>
            <span className={`${apiStatus === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
              {apiStatus === 'connected' ? 'Secure Connection' : 'Connection Error'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <FiDollarSign className="text-green-500" />
            <span className="font-medium">Balance: </span>
            <span className="font-bold text-green-700">
              {accountBalance !== null ? `${accountBalance.toFixed(2)} টাকা` : '...'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <FiClipboard className="text-blue-500" />
            <span className="font-medium">Recipients: </span>
            <span className="font-bold text-blue-700">{selectedNumbers.length}</span>
          </div>
        </motion.div>

        {/* Message Composition */}
        <motion.div
          style={glassStyle}
          className="mb-8 p-6 shadow-lg"
          whileHover={{ scale: 1.005 }}
        >
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FiSend className="text-blue-500" /> Compose Message
          </h3>
          <textarea
            className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-300 bg-white/50 resize-none min-h-[150px]"
            placeholder="✍️ Start typing your message here... Use placeholders below to personalize!"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isLoading}
          />

          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {PLACEHOLDERS.map(({ key, label }) => (
              <motion.button
                key={key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => insertPlaceholder(key)}
                className="p-2 bg-white border rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center text-sm"
                disabled={isLoading}
              >
                <span className="text-blue-600">{label}</span>
              </motion.button>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <span className="bg-blue-100 px-2 py-1 rounded">Characters: {message.length}</span>
              <span className="bg-green-100 px-2 py-1 rounded">
                SMS Parts: {Math.ceil(
                  selectedNumbers.reduce((max, number) => {
                    const student = students.find(s => s.number === number);
                    if (student) {
                      const personalizedMessage = generatePersonalizedMessage(student);
                      return Math.max(max, personalizedMessage.length);
                    }
                    return max;
                  }, message.length) / 160
                )}
              </span>
              <span className="bg-purple-100 px-2 py-1 rounded">
      Total Cost: {totalCost.toFixed(2)} টাকা
    </span>
            </div>
            <button
              onClick={pasteFromClipboard}
              className="flex items-center gap-1 text-green-600 hover:text-green-700 text-sm"
              disabled={isLoading}
            >
              <FiClipboard /> Paste
            </button>
          </div>
        </motion.div>

        {/* Recipient Selection */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <motion.div
            style={glassStyle}
            className="p-4 md:p-6 shadow-lg"
            whileHover={{ scale: 1.005 }}
          >
            <h3 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
              <FiUsers className="text-green-500" /> Select Class
            </h3>
            <select
              className="w-full p-3 border rounded-xl bg-white/50 focus:ring-2 focus:ring-green-300"
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setCurrentPage(1);
                setSelectedNumbers([]);
              }}
              disabled={isLoading}
            >
              <option value="">Choose a class...</option>
              {CLASS_OPTIONS.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </motion.div>

          <motion.div
            style={glassStyle}
            className="p-4 md:p-6 shadow-lg"
            whileHover={{ scale: 1.005 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg md:text-xl font-bold flex items-center gap-2">
                <FiUsers className="text-purple-500" /> Students
                <span className="text-sm font-normal text-gray-500">({selectedNumbers.length} selected)</span>
              </h3>
              <input
                type="text"
                placeholder="🔍 Search students..."
                className="w-full p-2 border rounded-lg bg-white/50 focus:ring-2 focus:ring-purple-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="h-64 overflow-y-auto border rounded-xl bg-white/50 p-2">
              <AnimatePresence>
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-4"
                  >
                    Loading...
                  </motion.div>
                ) : filteredStudents.length === 0 ? (
                  <motion.div
                    key="no-students"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-4"
                  >
                    No students found
                  </motion.div>
                ) : (
                  filteredStudents.map(student => (
                    <motion.label
                      key={student.$id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 20, opacity: 0 }}
                      className="flex items-center mb-2 hover:bg-blue-100 p-2 rounded-lg"
                    >
                      <input
                        type="checkbox"
                        checked={selectedNumbers.includes(student.number)}
                        onChange={() => handleNumberSelection(student.number)}
                        className="mr-2"
                        disabled={isLoading}
                      />
                      <span>{student.name} ({student.number})</span>
                    </motion.label>
                  ))
                )}
              </AnimatePresence>
            </div>

            <div className="mt-4 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                <button
                  onClick={() => setSelectedNumbers(filteredStudents.map(s => s.number))}
                  className="text-sm md:text-base px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 w-full md:w-auto"
                  disabled={isLoading}
                >
                  Select All
                </button>
                <button
                  onClick={() => setSelectedNumbers([])}
                  className="text-sm md:text-base px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 w-full md:w-auto"
                  disabled={isLoading}
                >
                  Clear
                </button>
              </div>
              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || isLoading}
                  className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 w-full md:w-auto"
                >
                  Prev
                </button>
                <span className="px-3 py-2 text-center">Page {currentPage}</span>
                <button
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={students.length < itemsPerPage || isLoading}
                  className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 w-full md:w-auto"
                >
                  Next
                </button>
              </div>
            </div>
          </motion.div>
        </div>


        {/* Send Button */}
        <motion.div
          className="mt-8 text-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <button
            onClick={sendSMS}
            disabled={apiStatus !== 'connected' || !selectedNumbers.length || !message || isLoading}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Sending...
              </span>
            ) : (
              `📤 Send SMS to ${selectedNumbers.length} Recipients`
            )}
          </button>
          <p className="mt-2 text-sm text-gray-600">
            Estimated Cost: {totalCost.toFixed(2)} টাকা • SMS Parts: {Math.ceil(
              selectedNumbers.reduce((max, number) => {
                const student = students.find(s => s.number === number);
                if (student) {
                  const personalizedMessage = generatePersonalizedMessage(student);
                  return Math.max(max, personalizedMessage.length);
                }
                return max;
              }, message.length) / 160
            )}
          </p>
        </motion.div>

        {/* Activity Logs */}
        <motion.div
          style={glassStyle}
          className="mt-8 p-6 shadow-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FiClipboard className="text-blue-500" /> Activity Logs
          </h3>
          <div className="h-32 overflow-y-auto border rounded-xl bg-white/50 p-2 text-sm">
            {logs.map((log, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-1 border-b last:border-b-0"
              >
                {log}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SMSService;