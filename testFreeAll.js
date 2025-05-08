const axios = require('axios');

// Base URL for the API
const API_URL = 'http://localhost:3000/api';

// Generate unique timestamps for usernames
const timestamp = Date.now();

// User credentials
const studentCredentials = {
  username: `student${timestamp}`,
  email: `student${timestamp}@example.com`,
  password: 'Student123!',
  full_name: 'Test Student',
  phone_number: `8${timestamp.toString().substring(0, 9)}` // 10 digits
};

// Expected folder IDs from database
const EXPECTED_FOLDER_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 11, 12, 13, 14, 15, 16, 17, 18];

async function testFreeEndpoints() {
  try {
    // Register a student
    console.log('1. Registering student user...');
    await axios.post(`${API_URL}/users/register`, {
      username: studentCredentials.username,
      email: studentCredentials.email,
      password_hash: studentCredentials.password,
      phone_number: studentCredentials.phone_number,
      full_name: studentCredentials.full_name,
      role: 'student'
    });
    console.log('Student registered successfully');
    
    // Login as student
    console.log('2. Logging in as student...');
    const studentLogin = await axios.post(`${API_URL}/users/login/email`, {
      email: studentCredentials.email,
      password_hash: studentCredentials.password
    });
    const studentAuthKey = studentLogin.data.auth_key;
    console.log(`Student logged in, auth key: ${studentAuthKey.substring(0, 10)}...`);
    
    console.log('\n========= ENDPOINT COMPARISON =========');
    
    // Test /free endpoint
    console.log('\nTesting /free endpoint...');
    const freeResponse = await axios.get(`${API_URL}/tests/free`, {
      headers: { 'auth_key': studentAuthKey }
    });
    
    console.log(`Status: ${freeResponse.status}`);
    console.log(`Folders returned: ${freeResponse.data.folders.length}`);
    
    const freeIds = freeResponse.data.folders.map(f => f.id).sort((a, b) => a - b);
    console.log('Folder IDs:', freeIds.join(', '));
    
    // Test /free/all endpoint
    console.log('\nTesting /free/all endpoint...');
    const freeAllResponse = await axios.get(`${API_URL}/tests/free/all`, {
      headers: { 'auth_key': studentAuthKey }
    });
    
    console.log(`Status: ${freeAllResponse.status}`);
    console.log(`Folders returned: ${freeAllResponse.data.folders.length}`);
    
    const freeAllIds = freeAllResponse.data.folders.map(f => f.id).sort((a, b) => a - b);
    console.log('Folder IDs:', freeAllIds.join(', '));
    
    // Compare results
    console.log('\n========= ANALYSIS =========');
    console.log(`Database expected folders: ${EXPECTED_FOLDER_IDS.length}`);
    console.log(`/free folders: ${freeResponse.data.folders.length}`);
    console.log(`/free/all folders: ${freeAllResponse.data.folders.length}`);
    
    // Calculate missing IDs from /free/all
    const freeAllIdsSet = new Set(freeAllIds);
    const missingFromFreeAll = EXPECTED_FOLDER_IDS.filter(id => !freeAllIdsSet.has(id));
    
    console.log('\nMissing folders in /free/all that should be returned:');
    if (missingFromFreeAll.length > 0) {
      console.log(`Missing folder IDs: ${missingFromFreeAll.join(', ')}`);
      
      // Print information to help debug
      console.log('\nFor debugging:');
      console.log('Expected IDs from database:', EXPECTED_FOLDER_IDS.join(', '));
      console.log('Actual IDs from /free/all:', freeAllIds.join(', '));
    } else {
      console.log('All expected parent folders are present in the /free/all endpoint.');
    }
    
  } catch (error) {
    console.error('Error testing endpoints:', error.response?.data || error.message);
  }
}

testFreeEndpoints(); 