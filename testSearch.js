const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Valid admin credentials
const adminEmail = 'admin1744838249100@example.com';
const adminPassword = 'Admin123!';

async function getAuthToken() {
  try {
    console.log(`Attempting to login with email: ${adminEmail}`);
    const response = await axios.post(`${BASE_URL}/users/login/email`, {
      email: adminEmail,
      password_hash: adminPassword
    });
    
    if (response.data && response.data.auth_key) {
      return response.data.auth_key;
    } else {
      throw new Error('Auth key not found in response');
    }
  } catch (error) {
    console.error('Authentication failed:', error.response ? error.response.data : error.message);
    throw error;
  }
}

async function testSearchEndpoint() {
  try {
    console.log('Getting authentication token...');
    const authKey = await getAuthToken();
    console.log('Authentication successful with token:', authKey.substring(0, 10) + '...');
    
    // Check if the search endpoint exists first
    console.log('\nChecking endpoint existence...');
    try {
      // Test if our endpoint was added to the router
      console.log(`Making a simple GET request to: ${BASE_URL}/tests/search`);
      console.log('Using auth_key:', authKey.substring(0, 10) + '...');
      
      const checkResponse = await axios.get(`${BASE_URL}/tests/search`, {
        headers: { 'auth_key': authKey }
      });
      
      console.log('Search endpoint exists! Response status:', checkResponse.status);
      console.log('Response data:', JSON.stringify(checkResponse.data).substring(0, 200) + '...');
    } catch (error) {
      console.error('Error checking endpoint existence:', 
        error.response ? 
        `Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}` : 
        error.message);
    }
    
    console.log('\nTesting /search endpoint with parameters...');
    
    // Test 1: Sort by name
    console.log('\n1. Testing sort by name:');
    try {
      const url = `${BASE_URL}/tests/search`;
      console.log(`Making request to: ${url} with sort=name`);
      
      const sortByNameResponse = await axios.get(url, {
        params: { sort: 'name' },
        headers: { 'auth_key': authKey }
      });
      console.log('Status:', sortByNameResponse.status);
      console.log('Found tests:', sortByNameResponse.data.tests ? sortByNameResponse.data.tests.length : 0);
      console.log('Pagination:', sortByNameResponse.data.pagination);
    } catch (error) {
      console.error('Error in sort by name test:', 
        error.response ? 
        `Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}` : 
        error.message);
    }
    
    // Test 2: Sort by modified date
    console.log('\n2. Testing sort by modified date:');
    try {
      const sortByModifiedResponse = await axios.get(`${BASE_URL}/tests/search`, {
        params: { sort: 'modified' },
        headers: { 'auth_key': authKey }
      });
      console.log('Status:', sortByModifiedResponse.status);
      console.log('Found tests:', sortByModifiedResponse.data.tests ? sortByModifiedResponse.data.tests.length : 0);
      console.log('Pagination:', sortByModifiedResponse.data.pagination);
    } catch (error) {
      console.error('Error in sort by modified test:', error.response ? error.response.data : error.message);
    }
    
    // Test 3: Search with query
    console.log('\n3. Testing search with query:');
    try {
      const searchQueryResponse = await axios.get(`${BASE_URL}/tests/search`, {
        params: { query: 'test' },
        headers: { 'auth_key': authKey }
      });
      console.log('Status:', searchQueryResponse.status);
      console.log('Found tests:', searchQueryResponse.data.tests ? searchQueryResponse.data.tests.length : 0);
      console.log('Pagination:', searchQueryResponse.data.pagination);
    } catch (error) {
      console.error('Error in search with query test:', error.response ? error.response.data : error.message);
    }
    
    // Test 4: Search with query and sort
    console.log('\n4. Testing search with query and sort:');
    try {
      const searchAndSortResponse = await axios.get(`${BASE_URL}/tests/search`, {
        params: { query: 'test', sort: 'name' },
        headers: { 'auth_key': authKey }
      });
      console.log('Status:', searchAndSortResponse.status);
      console.log('Found tests:', searchAndSortResponse.data.tests ? searchAndSortResponse.data.tests.length : 0);
      console.log('Pagination:', searchAndSortResponse.data.pagination);
    } catch (error) {
      console.error('Error in search with query and sort test:', error.response ? error.response.data : error.message);
    }
    
    // Test 5: Pagination
    console.log('\n5. Testing pagination:');
    try {
      const paginationResponse = await axios.get(`${BASE_URL}/tests/search`, {
        params: { page: 1, limit: 5 },
        headers: { 'auth_key': authKey }
      });
      console.log('Status:', paginationResponse.status);
      console.log('Found tests:', paginationResponse.data.tests ? paginationResponse.data.tests.length : 0);
      console.log('Pagination:', paginationResponse.data.pagination);
    } catch (error) {
      console.error('Error in pagination test:', error.response ? error.response.data : error.message);
    }
    
  } catch (error) {
    console.error('Error testing search endpoint:', error.response ? error.response.data : error.message);
  }
}

testSearchEndpoint(); 