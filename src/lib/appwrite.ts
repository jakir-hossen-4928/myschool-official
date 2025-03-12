import { Client, Databases, ID, Query, Account } from "appwrite";

// Load environment variables
const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;
const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const APPWRITE_DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const APPWRITE_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const IMAGE_HOST_KEY = import.meta.env.VITE_IMGBB_API_KEY;
const TEACHERS_COLLECTION_ID = import.meta.env.VITE_TEACHERS_COLLECTION_ID;

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

const databases = new Databases(client);
const account = new Account(client);

export {
    client,
    databases,
    account,
    APPWRITE_DATABASE_ID,
    APPWRITE_COLLECTION_ID,
    IMAGE_HOST_KEY, TEACHERS_COLLECTION_ID
};


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

interface StudentOverviewStats {
  totalStudents: number;
  missingFields: {
    name: number;
    description: number;
    class: number;
    number: number;
    englishName: number;
    motherName: number;
    fatherName: number;
    photoUrl: number;
  };
  classDistribution: { [className: string]: number };
  incompleteProfiles: number;
  lastUpdated: string;
  uniqueParents: number;
}
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
  workindays: string;
}




// Updated login function
export const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Ensure we're using the correct method name (createEmailPasswordSession for newer versions)
      await account.createEmailPasswordSession(email, password); // Updated method name
      localStorage.setItem("isAuthenticated", "true");
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  export const logout = async (): Promise<void> => {
    try {
      await account.deleteSession('current');
      localStorage.removeItem("isAuthenticated");
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  export const isAuthenticated = async (): Promise<boolean> => {
    try {
      await account.get();
      localStorage.setItem("isAuthenticated", "true");
      return true;
    } catch (error) {
      localStorage.removeItem("isAuthenticated");
      return false;
    }
  };
  export const resetPassword = async (email: string, resetUrl: string): Promise<void> => {
    try {
      await account.createRecovery(email, resetUrl);
      console.log("Password recovery email sent successfully");
    } catch (error) {
      console.error("Error initiating password recovery:", error);
      throw error;
    }
  };
// Fetch students with pagination and optional class filter
export const fetchStudents = async (
  currentPage: number,
  itemsPerPage: number,
  selectedClass: string
): Promise<{ students: Student[]; total: number }> => {
  try {
    const queries = [Query.limit(itemsPerPage), Query.offset(currentPage * itemsPerPage)];
    if (selectedClass) queries.push(Query.equal('class', selectedClass));

    const response = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_COLLECTION_ID,
      queries
    );

    return {
      students: response.documents as Student[],
      total: response.total
    };
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error;
  }
};

// Save or update a student
export const saveStudent = async (student: Student): Promise<void> => {
  try {
    const studentData = {
      name: student.name || '',
      number: student.number || '',
      class: student.class || '',
      description: student.description || '',
      englishName: student.englishName || '',
      motherName: student.motherName || '',
      fatherName: student.fatherName || '',
      photoUrl: student.photoUrl || ''
    };

    if (student.$id) {
      await databases.updateDocument(
        APPWRITE_DATABASE_ID,
  APPWRITE_COLLECTION_ID,
        student.$id,
        studentData
      );
    } else {
      await databases.createDocument(
        APPWRITE_DATABASE_ID,
  APPWRITE_COLLECTION_ID,
        ID.unique(),
        studentData
      );
    }
  } catch (error) {
    console.error('Error saving student:', error);
    throw error;
  }
};

// Delete a student
export const deleteStudent = async (studentId: string): Promise<void> => {
  try {
    await databases.deleteDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_COLLECTION_ID,
      studentId
    );
  } catch (error) {
    console.error('Error deleting student:', error);
    throw error;
  }
};

// Export all students to CSV
export const exportStudentsToCSV = async (selectedClass: string): Promise<void> => {
  try {
    let allStudents: Student[] = [];
    const limit = 100;
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        APPWRITE_COLLECTION_ID,
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
      throw new Error('No students found to export');
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
    throw error;
  }
};

// Upload image to ImgBB
export const uploadImage = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${IMAGE_HOST_KEY}`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Error uploading image to ImgBB');
    }

    const data = await response.json();
    return data.data.url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Download student photo
export const downloadPhoto = async (student: Student): Promise<void> => {
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
    throw error;
  }
};

export const studentOverview = async (): Promise<StudentOverviewStats> => {
  try {
    let allStudents: Student[] = [];
    const limit = 100;
    let offset = 0;
    let hasMore = true;
    let latestUpdate = new Date(0);

    // Fetch all students without pagination limit
    while (hasMore) {
      const response = await databases.listDocuments(
        '67740d6d001e6019b3b7',
        '67740d7700148b3fcccb',
        [Query.limit(limit), Query.offset(offset)]
      );

      allStudents = [...allStudents, ...(response.documents as Student[])];

      // Track latest update time
      response.documents.forEach(doc => {
        const updatedAt = new Date(doc.$updatedAt || doc.$createdAt);
        if (updatedAt > latestUpdate) latestUpdate = updatedAt;
      });

      offset += limit;
      hasMore = offset < response.total;
    }

    // Calculate statistics
    const classDistribution: { [key: string]: number } = {};
    const missingFields = {
      name: 0,
      description: 0,
      class: 0,
      number: 0,
      englishName: 0,
      motherName: 0,
      fatherName: 0,
      photoUrl: 0
    };
    let incompleteProfiles = 0;
    const parentNames = new Set<string>();

    allStudents.forEach(student => {
      // Class distribution
      classDistribution[student.class] = (classDistribution[student.class] || 0) + 1;

      // Track missing fields
      if (!student.name) missingFields.name++;
      if (!student.description) missingFields.description++;
      if (!student.class) missingFields.class++;
      if (!student.number) missingFields.number++;
      if (!student.englishName) missingFields.englishName++;
      if (!student.motherName) missingFields.motherName++;
      if (!student.fatherName) missingFields.fatherName++;
      if (!student.photoUrl) missingFields.photoUrl++;

      // Incomplete profile check
      if (!student.name || !student.class || !student.number ||
          !student.englishName || !student.motherName || !student.fatherName ||
          !student.photoUrl) {
        incompleteProfiles++;
      }

      // Unique parents
      if (student.motherName) parentNames.add(student.motherName);
      if (student.fatherName) parentNames.add(student.fatherName);
    });

    return {
      totalStudents: allStudents.length,
      missingFields,
      classDistribution,
      incompleteProfiles,
      lastUpdated: latestUpdate.toISOString(),
      uniqueParents: parentNames.size
    };
  } catch (error) {
    console.error('Error fetching student overview stats:', error);
    throw error;
  }
};



export const fetchTeachers = async (): Promise<Teacher[]> => {
    try {
        const response = await databases.listDocuments(
            APPWRITE_DATABASE_ID,
            TEACHERS_COLLECTION_ID,
            [Query.orderDesc('$createdAt')]
        );
        return response.documents as Teacher[];
    } catch (error) {
        console.error('Error fetching teachers:', error);
        throw error;
    }
};

export const saveTeacher = async (teacher: Teacher): Promise<void> => {
    try {
        const teacherData = {
            nameBangla: teacher.nameBangla || '',
            nameEnglish: teacher.nameEnglish || '',
            subject: teacher.subject || '',
            designation: teacher.designation || '',
            joiningDate: teacher.joiningDate || '',
            nid: teacher.nid || '',
            mobile: teacher.mobile || '',
            bloodGroup: teacher.bloodGroup || '',
            email: teacher.email || '',
            address: teacher.address || '',
            salary: teacher.salary || '0',
            workindays: teacher.workindays || '0', // Ensure this is always included
            photoUrl: teacher.photoUrl || ''
        };

        if (teacher.$id) {
            await databases.updateDocument(
                APPWRITE_DATABASE_ID,
                TEACHERS_COLLECTION_ID,
                teacher.$id,
                teacherData
            );
        } else {
            await databases.createDocument(
                APPWRITE_DATABASE_ID,
                TEACHERS_COLLECTION_ID,
                ID.unique(),
                teacherData
            );
        }
    } catch (error) {
        console.error('Error saving teacher:', error);
        throw error;
    }
};

export const deleteTeacher = async (teacherId: string): Promise<void> => {
    try {
        await databases.deleteDocument(
            APPWRITE_DATABASE_ID,
            TEACHERS_COLLECTION_ID,
            teacherId
        );
    } catch (error) {
        console.error('Error deleting teacher:', error);
        throw error;
    }
};