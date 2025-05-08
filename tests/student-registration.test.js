const axios = require('axios');
const { query } = require('../config/database');

// Configure axios base URL - adjust as needed for your environment
const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Change if your API runs on a different port/path
  validateStatus: () => true // Don't throw errors for non-2xx responses
});

// Test student registration
async function testStudentRegistration() {
  console.log('Starting student registration test...');
  
  try {
    // 1. Generate unique data for testing
    const timestamp = Date.now();
    const testStudent = {
      first_name: `Test${timestamp}`,
      last_name: 'Student',
      email: `test.student${timestamp}@example.com`,
      password_hash: 'securepassword123',
      phone_number: `+91${timestamp}`.substring(0, 15),
      role: 'student'
    };
    
    console.log(`Testing with data:`, testStudent);
    
    // 2. Register the student
    console.log('Sending registration request...');
    const response = await api.post('/users/register', testStudent);
    
    console.log(`Registration response status: ${response.status}`);
    console.log('Registration response:', response.data);
    
    if (response.status !== 201) {
      console.error('❌ Registration failed:', response.data);
      return;
    }
    
    // 3. Get the user ID from the response
    const userId = response.data.id;
    console.log(`Created user with ID: ${userId}`);
    
    // 4. Verify user was created in users table
    const userResult = await query('SELECT * FROM users WHERE id = $1', [userId]);
    
    if (userResult.rows.length === 0) {
      console.error('❌ User not found in users table!');
      return;
    }
    
    console.log('✅ User found in users table:', userResult.rows[0]);
    
    // 5. Verify student was created in students table
    const studentResult = await query('SELECT * FROM students WHERE user_id = $1', [userId]);
    
    if (studentResult.rows.length === 0) {
      console.error('❌ Student not found in students table!');
      return;
    }
    
    console.log('✅ Student found in students table:', studentResult.rows[0]);
    console.log('✅ TEST PASSED: Student was created successfully in both tables!');
    
  } catch (error) {
    console.error('Error during test:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testStudentRegistration().then(() => {
  console.log('Test completed.');
  // Close any open connections
  setTimeout(() => process.exit(0), 1000);
}).catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
}); 