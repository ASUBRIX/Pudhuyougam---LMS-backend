const axios = require('axios');

// Configure axios base URL - adjust as needed for your environment
const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Change if your API runs on a different port/path
  validateStatus: () => true // Don't throw errors for non-2xx responses
});

// Test student routes
async function testStudentRoutes() {
  console.log('Starting student routes test...');
  
  try {
    // User credentials from the previous test
    const credentials = {
      email: 'test.student1744971483537@example.com',
      password_hash: 'securepassword123'
    };
    
    // 1. Login with the student credentials
    console.log('Logging in with student credentials...');
    const loginResponse = await api.post('/users/login/email', credentials);
    
    console.log(`Login response status: ${loginResponse.status}`);
    
    if (loginResponse.status !== 200) {
      console.error('❌ Login failed:', loginResponse.data);
      return;
    }
    
    console.log('✅ Login successful');
    
    // Extract auth_key and user info
    const { auth_key, user } = loginResponse.data;
    console.log(`Logged in as: ${user.first_name} ${user.last_name} (ID: ${user.id})`);
    
    // Set auth header for subsequent requests
    api.defaults.headers.common['auth_key'] = auth_key;
    
    // 2. Get student profile
    console.log('\nFetching student profile...');
    const profileResponse = await api.get('/students/profile');
    
    console.log(`Profile response status: ${profileResponse.status}`);
    
    if (profileResponse.status !== 200) {
      console.error('❌ Profile fetch failed:', profileResponse.data);
    } else {
      console.log('✅ Profile fetch successful');
      console.log('Student profile:', profileResponse.data);
    }
    
    // 3. Update student profile
    console.log('\nUpdating student profile...');
    const updateData = {
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phone: user.phone_number,
      about: 'This is a test update via the test script.',
      education: JSON.stringify([{ 
        institution: 'Test University', 
        degree: 'Computer Science', 
        year: '2023' 
      }])
    };
    
    const updateResponse = await api.put('/students/profile', updateData);
    
    console.log(`Update response status: ${updateResponse.status}`);
    
    if (updateResponse.status !== 200) {
      console.error('❌ Profile update failed:', updateResponse.data);
    } else {
      console.log('✅ Profile update successful');
      console.log('Updated profile:', updateResponse.data.student);
    }
    
    // 4. Fetch profile again to verify updates
    console.log('\nFetching updated profile...');
    const updatedProfileResponse = await api.get('/students/profile');
    
    if (updatedProfileResponse.status !== 200) {
      console.error('❌ Updated profile fetch failed:', updatedProfileResponse.data);
    } else {
      console.log('✅ Updated profile fetch successful');
      console.log('Updated student profile:', updatedProfileResponse.data);
    }
    
    console.log('\n✅ TEST COMPLETED');
    
  } catch (error) {
    console.error('Error during test:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testStudentRoutes().then(() => {
  console.log('Test completed.');
  // Close any open connections
  setTimeout(() => process.exit(0), 1000);
}).catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
}); 