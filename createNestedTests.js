const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
let adminAuthKey = '';

// Generate unique identifiers
const adminTimestamp = Date.now();
const adminEmail = `admin${adminTimestamp}@example.com`;
const adminPassword = 'admin123';

async function createNestedTestStructure() {
  try {
    console.log('=== Creating Nested Test Structure ===');
    
    // 1. Register a new admin user
    console.log('\n1. Register a new admin:');
    const registerAdminResponse = await axios.post(`${BASE_URL}/users/register`, {
      username: `admin${adminTimestamp}`,
      email: adminEmail,
      password_hash: adminPassword,
      phone_number: `2${adminTimestamp.toString().substring(0, 10)}`,
      full_name: `Admin User ${adminTimestamp}`,
      role: 'admin'
    });
    console.log('Admin registration response:', registerAdminResponse.data);
    
    // 2. Log in as admin
    console.log('\n2. Log in as admin:');
    const adminLoginResponse = await axios.post(`${BASE_URL}/users/login/email`, {
      email: adminEmail,
      password_hash: adminPassword
    });
    console.log('Admin login response:', adminLoginResponse.data);
    adminAuthKey = adminLoginResponse.data.auth_key;
    
    // 3. Create main parent folder
    console.log('\n3. Create main parent folder:');
    const mainFolderResponse = await axios.post(`${BASE_URL}/tests/folders/create`, {
      name: 'Main Test Folder',
      parent_id: null
    }, {
      headers: { 
        'auth_key': adminAuthKey,
        'Content-Type': 'application/json'
      }
    });
    console.log('Main folder response:', mainFolderResponse.data);
    const mainFolderId = mainFolderResponse.data.id;
    
    // 4. Create first subfolder
    console.log('\n4. Create first subfolder:');
    const subfolder1Response = await axios.post(`${BASE_URL}/tests/folders/create`, {
      name: 'Subfolder 1',
      parent_id: mainFolderId
    }, {
      headers: { 
        'auth_key': adminAuthKey,
        'Content-Type': 'application/json'
      }
    });
    console.log('Subfolder 1 response:', subfolder1Response.data);
    const subfolder1Id = subfolder1Response.data.id;
    
    // 5. Create second subfolder
    console.log('\n5. Create second subfolder:');
    const subfolder2Response = await axios.post(`${BASE_URL}/tests/folders/create`, {
      name: 'Subfolder 2',
      parent_id: mainFolderId
    }, {
      headers: { 
        'auth_key': adminAuthKey,
        'Content-Type': 'application/json'
      }
    });
    console.log('Subfolder 2 response:', subfolder2Response.data);
    const subfolder2Id = subfolder2Response.data.id;
    
    // 6. Create Test 1 in Subfolder 1
    console.log('\n6. Create Test 1 in Subfolder 1:');
    const test1Response = await axios.post(`${BASE_URL}/tests/tests/create`, {
      folder_id: subfolder1Id,
      title: 'Subfolder 1 - Test 1',
      description: 'This is Test 1 in Subfolder 1',
      category: 'Math',
      passing_score: 60,
      duration_hours: 0,
      duration_minutes: 30,
      instructions: 'Complete all questions'
    }, {
      headers: { 
        'auth_key': adminAuthKey,
        'Content-Type': 'application/json'
      }
    });
    console.log('Test 1 in Subfolder 1 response:', test1Response.data);
    const test1Id = test1Response.data.id;
    
    // 7. Add question to Test 1
    console.log('\n7. Add question to Test 1:');
    const addQuestionTest1Response = await axios.post(`${BASE_URL}/tests/tests/${test1Id}/questions`, {
      question_english: 'What is 5+3?',
      question_tamil: '5+3 என்ன?',
      options: [
        { option_english: '7', option_tamil: '7', is_correct: false },
        { option_english: '8', option_tamil: '8', is_correct: true },
        { option_english: '9', option_tamil: '9', is_correct: false },
        { option_english: '10', option_tamil: '10', is_correct: false }
      ]
    }, {
      headers: { 
        'auth_key': adminAuthKey,
        'Content-Type': 'application/json'
      }
    });
    console.log('Add question to Test 1 response:', addQuestionTest1Response.data);
    
    // 8. Update Test 1 settings to make it free and published
    console.log('\n8. Update Test 1 settings:');
    const updateTest1SettingsResponse = await axios.put(`${BASE_URL}/tests/tests/${test1Id}/settings`, {
      shuffle_questions: true,
      show_results_immediately: true,
      allow_answer_review: true,
      enable_time_limit: true,
      status: 'published',
      is_free: true
    }, {
      headers: { 
        'auth_key': adminAuthKey,
        'Content-Type': 'application/json'
      }
    });
    console.log('Update Test 1 settings response:', updateTest1SettingsResponse.data);
    
    // 9. Create Test 2 in Subfolder 1
    console.log('\n9. Create Test 2 in Subfolder 1:');
    const test2Response = await axios.post(`${BASE_URL}/tests/tests/create`, {
      folder_id: subfolder1Id,
      title: 'Subfolder 1 - Test 2',
      description: 'This is Test 2 in Subfolder 1',
      category: 'Science',
      passing_score: 70,
      duration_hours: 0,
      duration_minutes: 45,
      instructions: 'Answer all questions carefully'
    }, {
      headers: { 
        'auth_key': adminAuthKey,
        'Content-Type': 'application/json'
      }
    });
    console.log('Test 2 in Subfolder 1 response:', test2Response.data);
    const test2Id = test2Response.data.id;
    
    // 10. Add question to Test 2
    console.log('\n10. Add question to Test 2:');
    const addQuestionTest2Response = await axios.post(`${BASE_URL}/tests/tests/${test2Id}/questions`, {
      question_english: 'What is H2O?',
      question_tamil: 'H2O என்றால் என்ன?',
      options: [
        { option_english: 'Hydrogen', option_tamil: 'ஹைட்ரஜன்', is_correct: false },
        { option_english: 'Oxygen', option_tamil: 'ஆக்சிஜன்', is_correct: false },
        { option_english: 'Water', option_tamil: 'நீர்', is_correct: true },
        { option_english: 'Carbon Dioxide', option_tamil: 'கார்பன் டை ஆக்சைடு', is_correct: false }
      ]
    }, {
      headers: { 
        'auth_key': adminAuthKey,
        'Content-Type': 'application/json'
      }
    });
    console.log('Add question to Test 2 response:', addQuestionTest2Response.data);
    
    // 11. Update Test 2 settings to make it free and published
    console.log('\n11. Update Test 2 settings:');
    const updateTest2SettingsResponse = await axios.put(`${BASE_URL}/tests/tests/${test2Id}/settings`, {
      shuffle_questions: true,
      show_results_immediately: true,
      allow_answer_review: true,
      enable_time_limit: true,
      status: 'published',
      is_free: true
    }, {
      headers: { 
        'auth_key': adminAuthKey,
        'Content-Type': 'application/json'
      }
    });
    console.log('Update Test 2 settings response:', updateTest2SettingsResponse.data);
    
    // 12. Create Test 3 in Subfolder 2
    console.log('\n12. Create Test 3 in Subfolder 2:');
    const test3Response = await axios.post(`${BASE_URL}/tests/tests/create`, {
      folder_id: subfolder2Id,
      title: 'Subfolder 2 - Test 3',
      description: 'This is Test 3 in Subfolder 2',
      category: 'English',
      passing_score: 75,
      duration_hours: 1,
      duration_minutes: 0,
      instructions: 'Read questions carefully before answering'
    }, {
      headers: { 
        'auth_key': adminAuthKey,
        'Content-Type': 'application/json'
      }
    });
    console.log('Test 3 in Subfolder 2 response:', test3Response.data);
    const test3Id = test3Response.data.id;
    
    // 13. Add question to Test 3
    console.log('\n13. Add question to Test 3:');
    const addQuestionTest3Response = await axios.post(`${BASE_URL}/tests/tests/${test3Id}/questions`, {
      question_english: 'What is the opposite of "happy"?',
      question_tamil: '"happy" இன் எதிர்ச்சொல் என்ன?',
      options: [
        { option_english: 'Sad', option_tamil: 'சோகம்', is_correct: true },
        { option_english: 'Angry', option_tamil: 'கோபம்', is_correct: false },
        { option_english: 'Excited', option_tamil: 'உற்சாகம்', is_correct: false },
        { option_english: 'Tired', option_tamil: 'களைப்பு', is_correct: false }
      ]
    }, {
      headers: { 
        'auth_key': adminAuthKey,
        'Content-Type': 'application/json'
      }
    });
    console.log('Add question to Test 3 response:', addQuestionTest3Response.data);
    
    // 14. Update Test 3 settings to make it free and published
    console.log('\n14. Update Test 3 settings:');
    const updateTest3SettingsResponse = await axios.put(`${BASE_URL}/tests/tests/${test3Id}/settings`, {
      shuffle_questions: true,
      show_results_immediately: true,
      allow_answer_review: true,
      enable_time_limit: true,
      status: 'published',
      is_free: true
    }, {
      headers: { 
        'auth_key': adminAuthKey,
        'Content-Type': 'application/json'
      }
    });
    console.log('Update Test 3 settings response:', updateTest3SettingsResponse.data);
    
    // 15. Create Test 4 in Subfolder 2
    console.log('\n15. Create Test 4 in Subfolder 2:');
    const test4Response = await axios.post(`${BASE_URL}/tests/tests/create`, {
      folder_id: subfolder2Id,
      title: 'Subfolder 2 - Test 4',
      description: 'This is Test 4 in Subfolder 2',
      category: 'General Knowledge',
      passing_score: 50,
      duration_hours: 0,
      duration_minutes: 20,
      instructions: 'Choose the best answer for each question'
    }, {
      headers: { 
        'auth_key': adminAuthKey,
        'Content-Type': 'application/json'
      }
    });
    console.log('Test 4 in Subfolder 2 response:', test4Response.data);
    const test4Id = test4Response.data.id;
    
    // 16. Add question to Test 4
    console.log('\n16. Add question to Test 4:');
    const addQuestionTest4Response = await axios.post(`${BASE_URL}/tests/tests/${test4Id}/questions`, {
      question_english: 'Which is the largest planet in our solar system?',
      question_tamil: 'நமது சூரிய குடும்பத்தில் மிகப்பெரிய கோள் எது?',
      options: [
        { option_english: 'Earth', option_tamil: 'பூமி', is_correct: false },
        { option_english: 'Mars', option_tamil: 'செவ்வாய்', is_correct: false },
        { option_english: 'Jupiter', option_tamil: 'வியாழன்', is_correct: true },
        { option_english: 'Saturn', option_tamil: 'சனி', is_correct: false }
      ]
    }, {
      headers: { 
        'auth_key': adminAuthKey,
        'Content-Type': 'application/json'
      }
    });
    console.log('Add question to Test 4 response:', addQuestionTest4Response.data);
    
    // 17. Update Test 4 settings to make it free and published
    console.log('\n17. Update Test 4 settings:');
    const updateTest4SettingsResponse = await axios.put(`${BASE_URL}/tests/tests/${test4Id}/settings`, {
      shuffle_questions: true,
      show_results_immediately: true,
      allow_answer_review: true,
      enable_time_limit: true,
      status: 'published',
      is_free: true
    }, {
      headers: { 
        'auth_key': adminAuthKey,
        'Content-Type': 'application/json'
      }
    });
    console.log('Update Test 4 settings response:', updateTest4SettingsResponse.data);
    
    // 18. Verify the folder structure by getting contents of the main folder
    console.log('\n18. Verify main folder contents:');
    const mainFolderContentsResponse = await axios.get(`${BASE_URL}/tests/folders/${mainFolderId}/contents`, {
      headers: { 
        'auth_key': adminAuthKey,
        'Content-Type': 'application/json'
      }
    });
    console.log('Main folder contents:', mainFolderContentsResponse.data);

    // 19. Verify subfolder 1 contents
    console.log('\n19. Verify subfolder 1 contents:');
    const subfolder1ContentsResponse = await axios.get(`${BASE_URL}/tests/folders/${subfolder1Id}/contents`, {
      headers: { 
        'auth_key': adminAuthKey,
        'Content-Type': 'application/json'
      }
    });
    console.log('Subfolder 1 contents:', subfolder1ContentsResponse.data);

    // 20. Verify subfolder 2 contents
    console.log('\n20. Verify subfolder 2 contents:');
    const subfolder2ContentsResponse = await axios.get(`${BASE_URL}/tests/folders/${subfolder2Id}/contents`, {
      headers: { 
        'auth_key': adminAuthKey,
        'Content-Type': 'application/json'
      }
    });
    console.log('Subfolder 2 contents:', subfolder2ContentsResponse.data);
    
    console.log('\n=== Nested Test Structure Created Successfully ===');
  } catch (error) {
    console.error('Error in creating nested test structure:', error.response?.data || error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
  }
}

createNestedTestStructure(); 