import React, { useState, useEffect, useRef } from 'react';

const API_KEY = import.meta.env.VITE_MYSCHOOL_AI_API;
const MODEL = import.meta.env.VITE_MYSCHOOL_AI_MODEL;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const MySchoolChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const chatContainerRef = useRef(null);

  // Fetch data from backend on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentRes, teacherRes, transactionRes] = await Promise.all([
          fetch(`${BACKEND_URL}/students`).then(res => res.json()),
          fetch(`${BACKEND_URL}/teachers`).then(res => res.json()),
          fetch(`${BACKEND_URL}/transactions`).then(res => res.json()),
        ]);

        setStudents(studentRes.students || []);
        setTeachers(teacherRes.teachers || []);
        setTransactions(transactionRes.transactions || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setMessages(prev => [...prev, { role: 'bot', content: 'Oops, I couldn’t load the school data. Let’s try something else!', timestamp: new Date().toLocaleTimeString() }]);
      }
    };
    fetchData();
  }, []);

  // Auto-scroll to the latest message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input, timestamp: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const personalizedPrompt = await personalizePrompt(input);
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            {
              role: 'system',
              content: 'You are a friendly and helpful assistant for MySchool. Use the provided data to give clear, concise, and user-friendly answers. If unsure, say so politely and suggest an alternative.',
            },
            { role: 'user', content: personalizedPrompt },
          ],
        }),
      });

      const data = await response.json();
      const botMessage = { role: 'bot', content: data.choices[0].message.content, timestamp: new Date().toLocaleTimeString() };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error fetching response:', error);
      setMessages(prev => [...prev, { role: 'bot', content: 'Sorry, something went wrong. Can I help you with anything else?', timestamp: new Date().toLocaleTimeString() }]);
    } finally {
      setIsTyping(false);
    }
  };

  const personalizePrompt = (userInput) => {
    const lowerInput = userInput.toLowerCase();

    // Check for student-related queries
    const studentMatch = students.find(s => lowerInput.includes(s.name.toLowerCase()) || lowerInput.includes(s.englishName.toLowerCase()));
    if (studentMatch) {
      return `The user asked: "${userInput}". Provide a friendly response using this student info: Name: ${studentMatch.name}, English Name: ${studentMatch.englishName}, Class: ${studentMatch.class}, Number: ${studentMatch.number}, Mother: ${studentMatch.motherName}, Father: ${studentMatch.fatherName}, Description: ${studentMatch.description || 'N/A'}.`;
    }

    // Check for teacher-related queries
    const teacherMatch = teachers.find(t => lowerInput.includes(t.nameBangla.toLowerCase()) || lowerInput.includes(t.nameEnglish.toLowerCase()));
    if (teacherMatch) {
      return `The user asked: "${userInput}". Provide a friendly response using this teacher info: Name: ${teacherMatch.nameEnglish} (${teacherMatch.nameBangla}), Subject: ${teacherMatch.subject}, Designation: ${teacherMatch.designation}, Contact: ${teacherMatch.mobile}, Email: ${teacherMatch.email}, Address: ${teacherMatch.address}.`;
    }

    // Check for transaction-related queries
    if (lowerInput.includes('transaction') || lowerInput.includes('amount') || lowerInput.includes('expense') || lowerInput.includes('income')) {
      const recentTransactions = transactions.slice(0, 5); // Limit to 5 for brevity
      const transactionSummary = recentTransactions.map(t => `ID: ${t.id}, Date: ${t.date}, Description: ${t.description}, Amount: ${t.amount}, Type: ${t.type}, Category: ${t.category}`).join('\n');
      return `The user asked: "${userInput}". Here’s a summary of recent transactions:\n${transactionSummary}\nProvide a friendly response based on this data.`;
    }

    // Default: Pass the input as-is with context
    return `The user asked: "${userInput}". You have access to student, teacher, and transaction data. Respond in a friendly, helpful way based on any relevant info you can infer, or ask for clarification if needed.`;
  };

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-t-lg p-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-700">MySchool Chatbot</h1>
      </div>
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto bg-white p-4 space-y-4 rounded-b-lg">
        {messages.length === 0 && (
          <div className="text-gray-500 text-center">Hi there! How can I assist you today?</div>
        )}
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-lg shadow-md ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
              {msg.content}
              <span className="text-xs opacity-50 block mt-1">{msg.timestamp}</span>
            </div>
          </div>
        ))}
        {isTyping && <div className="text-gray-500">Typing...</div>}
      </div>
      <div className="mt-4 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          className="flex-1 p-3 border rounded-lg outline-none"
          placeholder="Ask me anything about students, teachers, or transactions!"
        />
        <button onClick={sendMessage} className="px-4 py-3 bg-blue-500 text-white rounded-lg">Send</button>
      </div>
    </div>
  );
};

export default MySchoolChat;