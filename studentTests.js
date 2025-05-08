const axios = require('axios');
const crypto = require('crypto');

// Base URL
const API_URL = 'http://localhost:3000/api';

// Hash a password (SHA-256)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function registerStudentAndGetTests() {
  try {
    // First, get admin credentials for student creation
    console.log('Step 1: Getting admin access');
    const adminPassword = hashPassword('password123');
    const adminLoginResponse = await axios.post(`${API_URL}/users/login/email`, {
      email: 'admin@lms.com',
      password_hash: adminPassword
    });
    console.log('Admin login successful');
    const adminAuthKey = adminLoginResponse.data.auth_key;
    
    // Step 2: Create a test folder and test (as admin)
    console.log('\nStep 2: Creating a test folder (as admin)');
    const createFolderResponse = await axios.post(
      `${API_URL}/tests/folders/create`,
      {
        name: 'Free Tests',
        parent_id: null
      },
      {
        headers: { auth_key: adminAuthKey }
      }
    );
    console.log('Test folder created:', createFolderResponse.data);
    const folderId = createFolderResponse.data.id;
    
    console.log('\nStep 3: Creating a test (as admin)');
    const createTestResponse = await axios.post(
      `${API_URL}/tests/tests/create`,
      {
        folder_id: folderId,
        title: 'Free Sample Test',
        description: 'A sample test for students',
        category: 'Demo',
        passing_score: 70,
        duration_hours: 0,
        duration_minutes: 30,
        instructions: 'Answer all questions',
        is_free: true
      },
      {
        headers: { auth_key: adminAuthKey }
      }
    );
    console.log('Test created:', createTestResponse.data);
    const testId = createTestResponse.data.id;
    
    // Add a question to the test
    console.log('\nStep 4: Adding a question to the test (as admin)');
    const addQuestionResponse = await axios.post(
      `${API_URL}/tests/tests/${testId}/questions`,
      {
        question_english: 'What is 2+2?',
        question_tamil: 'இரண்டு கூட்டல் இரண்டு என்ன?',
        options: [
          {
            option_english: '3',
            option_tamil: '3',
            is_correct: false
          },
          {
            option_english: '4',
            option_tamil: '4',
            is_correct: true
          },
          {
            option_english: '5',
            option_tamil: '5',
            is_correct: false
          },
          {
            option_english: '6',
            option_tamil: '6',
            is_correct: false
          }
        ]
      },
      {
        headers: { auth_key: adminAuthKey }
      }
    );
    console.log('Question added to test:', addQuestionResponse.data);
    
    // Update test settings
    console.log('\nStep 5: Updating test settings (as admin)');
    const updateTestResponse = await axios.put(
      `${API_URL}/tests/tests/${testId}/settings`,
      {
        status: 'published',
        shuffle_questions: false,
        show_results_immediately: true,
        allow_answer_review: true,
        enable_time_limit: true,
        is_free: true
      },
      {
        headers: { auth_key: adminAuthKey }
      }
    );
    console.log('Test settings updated:', updateTestResponse.data);
    
    // Step 6: Register a new student user
    console.log('\nStep 6: Registering a new student user');
    const studentPassword = hashPassword('student123');
    const studentEmail = `student${Date.now()}@example.com`; // Generate unique email
    
    const registerResponse = await axios.post(`${API_URL}/users/register`, {
      username: `student${Date.now()}`,
      email: studentEmail,
      password_hash: studentPassword,
      phone_number: `98765${Math.floor(10000 + Math.random() * 90000)}`, // Generate unique phone
      full_name: 'New Student',
      role: 'student'
    });
    
    console.log('Student user registered:', registerResponse.data);
    const studentUserId = registerResponse.data.id;
    
    // Step 7: Log in the student
    console.log('\nStep 7: Logging in the student');
    const loginResponse = await axios.post(`${API_URL}/users/login/email`, {
      email: studentEmail,
      password_hash: studentPassword
    });
    
    console.log('Student login successful!');
    const studentAuthKey = loginResponse.data.auth_key;
    
    // Step 8: Create a student profile (using admin auth)
    console.log('\nStep 8: Creating a student profile (using admin auth)');
    const createStudentResponse = await axios.post(
      `${API_URL}/students`,
      {
        userId: studentUserId,
        firstName: 'New',
        lastName: 'Student',
        email: studentEmail,
        phone: '9876543210',
        enrollmentDate: new Date().toISOString().split('T')[0], // Today's date
        program: 'Computer Science',
        status: 'active',
        about: 'A new student',
        education: [
          {
            level: 'High School',
            institution: 'ABC High School',
            year: '2022'
          }
        ],
        profilePicture: 'default.jpg'
      },
      {
        headers: { auth_key: adminAuthKey }
      }
    );
    
    console.log('Student profile created:', createStudentResponse.data);
    
    // Step 9: Get student profile
    console.log('\nStep 9: Getting student profile');
    const profileResponse = await axios.get(
      `${API_URL}/students/profile`,
      {
        headers: { auth_key: studentAuthKey }
      }
    );
    
    console.log('Student profile retrieved:', profileResponse.data);
    
    // Step 10: Get available tests for the student
    console.log('\nStep 10: Getting available tests');
    const testsResponse = await axios.get(
      `${API_URL}/tests/free`,
      {
        headers: { auth_key: studentAuthKey }
      }
    );
    
    console.log('Available test folders:', testsResponse.data);
    
    // If there are any folders, get contents of first folder
    if (testsResponse.data.folders && testsResponse.data.folders.length > 0) {
      const studentFolderId = testsResponse.data.folders[0].id;
      
      console.log(`\nStep 11: Getting content of folder ${studentFolderId}`);
      const folderContentsResponse = await axios.get(
        `${API_URL}/tests/folders/${studentFolderId}/contents/public`,
        {
          headers: { auth_key: studentAuthKey }
        }
      );
      
      console.log('Folder contents:', folderContentsResponse.data);
      
      // If there are any tests in this folder, get the first test details
      if (folderContentsResponse.data.tests && folderContentsResponse.data.tests.length > 0) {
        const studentTestId = folderContentsResponse.data.tests[0].id;
        
        console.log(`\nStep 12: Getting details of test ${studentTestId}`);
        const testDetailsResponse = await axios.get(
          `${API_URL}/tests/tests/${studentTestId}/take`,
          {
            headers: { auth_key: studentAuthKey }
          }
        );
        
        console.log('Test details:', testDetailsResponse.data);
      } else {
        console.log('No tests found in this folder.');
      }
    } else {
      console.log('No test folders available.');
    }
    
    console.log('\nProcess completed successfully!');
    
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

// Run the function
registerStudentAndGetTests(); 