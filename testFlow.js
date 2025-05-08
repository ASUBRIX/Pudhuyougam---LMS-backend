const axios = require('axios');

// Base URL for the API
const API_URL = 'http://localhost:3000/api';

// Generate unique timestamps for usernames
const timestamp = Date.now();

// User credentials
const adminCredentials = {
  first_name: `admin_first_name${timestamp}`,
  last_name: `admin_last_name${timestamp}`,
  email: `admin${timestamp}@example.com`,
  password: 'Admin123!',
  phone_number: `9${timestamp.toString().substring(0, 9)}` // 10 digits
};

const studentCredentials = {
  first_name: `student_first_name${timestamp}`,
  last_name: `student_last_name${timestamp}`,
  email: `student${timestamp}@example.com`,
  password: 'Student123!',
  phone_number: `8${timestamp.toString().substring(0, 9)}` // 10 digits
};

let adminAuthKey, studentAuthKey;
let folderId, testId;

// Helper function to make API requests with better error handling
async function apiRequest(method, endpoint, data = null, authKey = null) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (authKey) {
      headers.auth_key = authKey;
    }

    const config = { headers };
    
    let response;
    if (method === 'get') {
      response = await axios.get(`${API_URL}${endpoint}`, config);
    } else if (method === 'post') {
      response = await axios.post(`${API_URL}${endpoint}`, data, config);
    } else if (method === 'put') {
      response = await axios.put(`${API_URL}${endpoint}`, data, config);
    } else if (method === 'delete') {
      response = await axios.delete(`${API_URL}${endpoint}`, config);
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error in ${method.toUpperCase()} ${endpoint}:`, error.response?.data || error.message);
    throw error;
  }
}

async function runTestFlow() {
  console.log('===== STARTING TEST FLOW =====');
  
  try {
    // STEP 1: Register admin
    console.log('\n1. Registering admin user...');
    await apiRequest('post', '/users/register', {
      first_name: adminCredentials.first_name,
      last_name: adminCredentials.last_name,
      email: adminCredentials.email,
      password_hash: adminCredentials.password,
      phone_number: adminCredentials.phone_number,
      role: 'admin'
    });
    console.log('Admin registered successfully');
    
    // STEP 2: Login as admin
    console.log('\n2. Logging in as admin...');
    const adminLogin = await apiRequest('post', '/users/login/email', {
      email: adminCredentials.email,
      password_hash: adminCredentials.password
    });
    adminAuthKey = adminLogin.auth_key;
    console.log('Admin logged in successfully');
    
    // STEP 3: Create a test folder
    console.log('\n3. Creating "Maths" test folder...');
    const folderResponse = await apiRequest('post', '/tests/folders/create', {
      name: 'Maths',
      parent_id: null
    }, adminAuthKey);
    folderId = folderResponse.id;
    console.log(`Folder "Maths" created with ID: ${folderId}`);
    
    // STEP 4: Create a test inside the folder
    console.log('\n4. Creating a test in the Maths folder...');
    const testResponse = await apiRequest('post', '/tests/test/create', {
      folder_id: folderId,
      title: 'Basic Mathematics Test',
      description: 'Test your basic math skills',
      category: 'Mathematics',
      passing_score: 70,
      duration_hours: 0,
      duration_minutes: 30,
      instructions: 'Answer all questions. Each question carries equal marks.'
    }, adminAuthKey);
    testId = testResponse.id;
    console.log(`Test created with ID: ${testId}`);
    
    // STEP 5: Add questions to the test
    console.log('\n5. Adding questions to the test...');
    
    // Question 1
    await apiRequest('post', `/tests/test/${testId}/questions`, {
      question_english: 'What is 2+2?',
      question_tamil: 'இரண்டும் இரண்டும் என்ன?',
      options: [
        { option_english: '3', option_tamil: '3', is_correct: false },
        { option_english: '4', option_tamil: '4', is_correct: true },
        { option_english: '5', option_tamil: '5', is_correct: false },
        { option_english: '6', option_tamil: '6', is_correct: false }
      ]
    }, adminAuthKey);
    
    // Question 2
    await apiRequest('post', `/tests/test/${testId}/questions`, {
      question_english: 'What is 5×3?',
      question_tamil: '5×3 என்றால் என்ன?',
      options: [
        { option_english: '8', option_tamil: '8', is_correct: false },
        { option_english: '10', option_tamil: '10', is_correct: false },
        { option_english: '15', option_tamil: '15', is_correct: true },
        { option_english: '20', option_tamil: '20', is_correct: false }
      ]
    }, adminAuthKey);
    
    // Question 3
    await apiRequest('post', `/tests/test/${testId}/questions`, {
      question_english: 'Solve: 10-7',
      question_tamil: 'தீர்க்கவும்: 10-7',
      options: [
        { option_english: '1', option_tamil: '1', is_correct: false },
        { option_english: '2', option_tamil: '2', is_correct: false },
        { option_english: '3', option_tamil: '3', is_correct: true },
        { option_english: '4', option_tamil: '4', is_correct: false }
      ]
    }, adminAuthKey);
    
    console.log('Questions added successfully');
    
    // STEP 6: Update test settings to make it free and published
    console.log('\n6. Updating test settings...');
    await apiRequest('put', `/tests/test/${testId}/settings`, {
      title: 'Basic Mathematics Test',
      description: 'Test your basic math skills',
      category: 'Mathematics',
      passing_score: 70,
      duration_hours: 0,
      duration_minutes: 30,
      instructions: 'Answer all questions. Each question carries equal marks.',
      shuffle_questions: true,
      show_results_immediately: true,
      allow_answer_review: true,
      enable_time_limit: true,
      status: 'published',
      is_free: true
    }, adminAuthKey);
    console.log('Test settings updated - test is now published and free');
    
    // STEP 7: Register a student
    console.log('\n7. Registering student user...');
    await apiRequest('post', '/users/register', {
      first_name: studentCredentials.first_name,
      last_name: studentCredentials.last_name,
      email: studentCredentials.email,
      password_hash: studentCredentials.password,
      phone_number: studentCredentials.phone_number,
      role: 'student'
    });
    console.log('Student registered successfully');
    
    // STEP 8: Login as student
    console.log('\n8. Logging in as student...');
    const studentLogin = await apiRequest('post', '/users/login/email', {
      email: studentCredentials.email,
      password_hash: studentCredentials.password
    });
    studentAuthKey = studentLogin.auth_key;
    console.log('Student logged in successfully');
    
    // STEP 9: Get free test folders
    console.log('\n9. Getting free test folders...');
    const freeTestsResponse = await apiRequest('get', '/tests/free', null, studentAuthKey);
    console.log('Free test folders:', JSON.stringify(freeTestsResponse, null, 2));
    
    // STEP 9.5: Get ALL parent folders, regardless of whether they have tests
    console.log('\n9.5. Getting ALL parent folders...');
    const allFoldersResponse = await apiRequest('get', '/tests/free/all', null, studentAuthKey);
    console.log('All parent folders:', JSON.stringify(allFoldersResponse, null, 2));
    console.log('Total parent folders:', allFoldersResponse.folders.length);
    console.log('Total free test folders:', freeTestsResponse.folders.length);
    console.log('Difference (empty folders):', allFoldersResponse.folders.length - freeTestsResponse.folders.length);
    
    // STEP 10: Get the contents of our Maths folder
    console.log(`\n10. Getting contents of Maths folder (ID: ${folderId})...`);
    const folderContentsResponse = await apiRequest('get', `/tests/folders/${folderId}/contents/public`, null, studentAuthKey);
    console.log('Folder contents:', JSON.stringify(folderContentsResponse, null, 2));
    
    // STEP 11: Get test details
    console.log(`\n11. Getting test details (ID: ${testId})...`);
    const testDetailsResponse = await apiRequest('get', `/tests/test/${testId}/take`, null, studentAuthKey);
    console.log('Test details:', JSON.stringify(testDetailsResponse, null, 2));
    
    // STEP 12: Get questions for the test
    console.log(`\n12. Getting test questions (ID: ${testId})...`);
    const questionsResponse = await apiRequest('get', `/tests/test/${testId}/questions/details`, null, studentAuthKey);
    console.log('Test questions:', JSON.stringify(questionsResponse, null, 2));
    
    // STEP 13: Submit test answers
    console.log(`\n13. Submitting test answers (ID: ${testId})...`);
    // Create answers for submission - answering all questions correctly
    const answers = questionsResponse.questions.map(question => {
      // Get the correct option for this question (in a real test, the student wouldn't know this)
      // In a real test, this would be the option the student selected
      const correctOption = question.options.find((option, index) => index === 1); // Just picking the second option for this example
      
      return {
        question_id: question.question_id,
        selected_option_id: correctOption.option_id
      };
    });
    
    const submitResponse = await apiRequest('post', `/tests/test/${testId}/submit`, {
      answers: answers,
      time_taken_seconds: 600 // 10 minutes
    }, studentAuthKey);
    
    console.log('Test submission response:', JSON.stringify(submitResponse, null, 2));
    
    console.log('\n===== TEST FLOW COMPLETED SUCCESSFULLY =====');
    
  } catch (error) {
    console.error('Test flow failed:', error.message);
  }
}

// Run the test flow
runTestFlow(); 