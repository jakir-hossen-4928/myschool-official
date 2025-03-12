import React, { useRef, useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import { FaWhatsapp, FaDownload, FaImage, FaShare } from "react-icons/fa";

const defaultRoutine = {
  schoolName: "MySchool Class Routine",
  classLevels: [
    { name: "Play-Nursery", teacher: "Teacher A" },
    { name: "One", teacher: "Teacher B" },
    { name: "Two", teacher: "Teacher C" },
    { name: "Three", teacher: "Teacher D" },
    { name: "Four", teacher: "Teacher E" },
    { name: "Five", teacher: "Teacher F" },
    { name: "Six", teacher: "Teacher G" },
  ],
  timeSlots: [
    "8:00 - 8:30 AM",
    "8:30 - 9:00 AM",
    "9:00 - 9:30 AM",
    "9:30 - 10:00 AM",
    "10:00 - 10:30 AM",
    "10:30 - 11:00 AM",
    "11:00 - 11:30 AM",
    "11:30 - 12:00 PM",
    "12:00 - 12:30 PM",
    "12:30 - 1:00 PM",
  ],
  subjects: [
    { name: "Welcome Activity", teacher: "Ms. Anna" },
    { name: "Math", teacher: "Mr. John" },
    { name: "English", teacher: "Ms. Emma" },
    { name: "Science", teacher: "Dr. Smith" },
    { name: "Break", teacher: "-" },
    { name: "Art", teacher: "Ms. Lily" },
    { name: "Social Studies", teacher: "Mr. Alex" },
    { name: "Physical Ed", teacher: "Coach Brown" },
    { name: "Language", teacher: "Ms. Garcia" },
    { name: "Review", teacher: "Mr. Ryan" },
  ],
};

const ClassRoutine = () => {
  const routineRef = useRef(null);
  const [routine, setRoutine] = useState(() => {
    const savedRoutine = localStorage.getItem("classRoutine");
    return savedRoutine ? JSON.parse(savedRoutine) : defaultRoutine;
  });

  useEffect(() => {
    localStorage.setItem("classRoutine", JSON.stringify(routine));
  }, [routine]);

  const handleEdit = (type, index, field, value) => {
    const updatedRoutine = { ...routine };
    updatedRoutine[type][index][field] = value;
    setRoutine(updatedRoutine);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor("#4f46e5");
    doc.text(routine.schoolName, 105, 20, { align: "center" });

    autoTable(doc, {
      head: [["Time", ...routine.classLevels.map((cl) => `${cl.name}\n${cl.teacher}`)]],
      body: routine.timeSlots.map((time, i) => [
        time,
        ...routine.classLevels.map(() => `${routine.subjects[i].name}\n${routine.subjects[i].teacher}`),
      ]),
      startY: 25,
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: "#4f46e5", textColor: "white" },
      alternateRowStyles: { fillColor: "#f3f4f6" },
    });

    doc.save("Class_Routine.pdf");
  };

  const generateImage = async () => {
    if (routineRef.current) {
      const canvas = await html2canvas(routineRef.current, {
        scale: 2,
        useCORS: true,
        scrollY: 0,
        windowWidth: routineRef.current.scrollWidth,
        windowHeight: routineRef.current.scrollHeight,
      });

      const image = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.href = image;
      link.download = "Class_Routine.png";
      link.click();
    }
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <h1 className="text-2xl md:text-4xl font-bold text-center text-indigo-600 mb-6">
        {routine.schoolName}
      </h1>

      {/* Buttons */}
      <div className="flex flex-col md:flex-row justify-center md:justify-end gap-4 mb-6">
        <button
          onClick={generatePDF}
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 md:py-3 rounded-lg hover:bg-indigo-700 transition-all shadow-lg text-sm md:text-base"
        >
          <FaDownload className="text-lg" />
          Export PDF
        </button>
        <button
          onClick={generateImage}
          className="flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 md:py-3 rounded-lg hover:bg-purple-700 transition-all shadow-lg text-sm md:text-base"
        >
          <FaImage className="text-lg" />
          Export Image
        </button>
      </div>

      {/* Table Container */}
      <div ref={routineRef} className="overflow-x-auto bg-white p-4 md:p-8 shadow-xl rounded-2xl mb-8">
        <table className="w-full text-xs md:text-sm lg:text-base">
          <thead>
            <tr className="bg-indigo-600 text-white">
              <th className="p-3 md:p-4 border border-slate-200">Time</th>
              {routine.classLevels.map((level, i) => (
                <th key={level.name} className="p-3 md:p-4 border border-slate-200">
                  <div className="flex flex-col items-center">
                    <input
                      value={level.name}
                      onChange={(e) => handleEdit("classLevels", i, "name", e.target.value)}
                      className="w-full text-center bg-transparent border-b border-white focus:outline-none text-xs md:text-sm"
                    />
                    <input
                      value={level.teacher}
                      onChange={(e) => handleEdit("classLevels", i, "teacher", e.target.value)}
                      className="w-full text-center bg-transparent border-b border-white focus:outline-none text-xs mt-1"
                    />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {routine.timeSlots.map((time, index) => (
              <tr key={time} className="even:bg-slate-50">
                <td className="p-3 md:p-4 border border-slate-200 font-medium">{time}</td>
                {routine.classLevels.map((_, i) => (
                  <td key={`${time}-${i}`} className="p-3 md:p-4 border border-slate-200">
                    <div className="flex flex-col items-center">
                      <input
                        value={routine.subjects[index].name}
                        onChange={(e) => handleEdit("subjects", index, "name", e.target.value)}
                        className="w-full text-center bg-transparent border-b border-slate-300 focus:outline-none text-xs md:text-sm"
                      />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClassRoutine;
