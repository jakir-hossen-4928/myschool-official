import React, { useState, useEffect, useRef } from 'react';
import { databases, APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID, TEACHERS_COLLECTION_ID } from '../lib/appwrite';
import { Query } from 'appwrite';

const API_KEY = import.meta.env.VITE_MYSCHOOL_AI_API;
const MODEL = import.meta.env.VITE_MYSCHOOL_AI_MODEL;

const MySchoolChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentResponse = await databases.listDocuments(
          APPWRITE_DATABASE_ID,
          APPWRITE_COLLECTION_ID,
          [Query.limit(1000)]
        );
        setStudents(studentResponse.documents);

        const teacherResponse = await databases.listDocuments(
          APPWRITE_DATABASE_ID,
          TEACHERS_COLLECTION_ID,
          [Query.limit(1000)]
        );
        setTeachers(teacherResponse.documents);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

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
          messages: [{ role: 'system', content: 'You are a helpful assistant with access to school data.' }, { role: 'user', content: personalizedPrompt }],
        }),
      });

      const data = await response.json();
      const botMessage = { role: 'bot', content: data.choices[0].message.content, timestamp: new Date().toLocaleTimeString() };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error fetching response:', error);
      setMessages(prev => [...prev, { role: 'bot', content: 'Error processing your request.', timestamp: new Date().toLocaleTimeString() }]);
    } finally {
      setIsTyping(false);
    }
  };

  const personalizePrompt = async (userInput) => {
    const lowerInput = userInput.toLowerCase();

    const studentMatch = students.find(s => userInput.includes(s.name));
    if (studentMatch) {
      return `${userInput}\nStudent Info: Name: ${studentMatch.name}, Class: ${studentMatch.class}, Number: ${studentMatch.number}, Mother: ${studentMatch.motherName}, Father: ${studentMatch.fatherName}, Description: ${studentMatch.description || 'N/A'}.`;
    }

    const teacherMatch = teachers.find(t => userInput.includes(t.nameBangla) || userInput.includes(t.nameEnglish));
    if (teacherMatch) {
      return `${userInput}\nTeacher Info: Name: ${teacherMatch.nameEnglish} (${teacherMatch.nameBangla}), Subject: ${teacherMatch.subject}, Designation: ${teacherMatch.designation}, Contact: ${teacherMatch.mobile}, Email: ${teacherMatch.email}, Address: ${teacherMatch.address}.`;
    }

    return userInput;
  };

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-t-lg p-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-700">MySchool Chatbot</h1>
      </div>
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto bg-white p-4 space-y-4 rounded-b-lg">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-lg shadow-md ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>{msg.content}</div>
          </div>
        ))}
        {isTyping && <div className="text-gray-500">Typing...</div>}
      </div>
      <div className="mt-4 flex items-center gap-2">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()} className="flex-1 p-3 border rounded-lg outline-none" />
        <button onClick={sendMessage} className="px-4 py-3 bg-blue-500 text-white rounded-lg">Send</button>
      </div>
    </div>
  );
};

export default MySchoolChat;