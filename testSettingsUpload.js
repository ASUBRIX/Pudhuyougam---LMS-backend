const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Set the base URL for API requests
const baseURL = 'http://localhost:3000';

// Admin credentials for authentication
const adminCredentials = {
  email: 'admin1744877726803@example.com',
  password_hash: 'Admin123!' // In a real app, this would be hashed
};

// Test settings data
const testSettings = {
  site_name: 'Test LMS Platform',
  site_title: 'Test LMS - Education Platform',
  site_description: 'This is a test description for the LMS platform',
  site_email: 'test@example.com',
  site_phone: '+1 (555) 987-6543',
  site_address: '456 Test Avenue, Example City, 10002',
  copyright_text: '© 2025 Test LMS. All rights reserved.',
  facebook_url: 'https://facebook.com/test-lms',
  youtube_url: 'https://youtube.com/c/test-lms',
  telegram_url: 'https://t.me/test-lms',
  instagram_url: 'https://instagram.com/test-lms'
};

// Test image paths - you'll need to create or use existing test images
const logoPath = path.join(__dirname, 'test-logo.png'); // Create or use an existing image
const faviconPath = path.join(__dirname, 'test-favicon.ico'); // Create or use an existing image

// Function to login and get auth key
async function login() {
  try {
    const response = await axios.post(`${baseURL}/api/users/login/email`, adminCredentials);
    return response.data.auth_key;
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    throw error;
  }
}

// Function to get current settings
async function getSettings() {
  try {
    const response = await axios.get(`${baseURL}/api/settings`);
    console.log('Current settings:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error getting settings:', error.response?.data || error.message);
    throw error;
  }
}

// Function to update settings with file upload
async function updateSettings(authKey) {
  try {
    // Create form data object
    const formData = new FormData();
    
    // Add text fields
    Object.entries(testSettings).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    // Check if test images exist and add them
    let logoIncluded = false;
    let faviconIncluded = false;
    
    try {
      if (fs.existsSync(logoPath)) {
        formData.append('site_logo', fs.createReadStream(logoPath));
        logoIncluded = true;
        console.log('Added logo file to request');
      } else {
        console.log('Logo file not found at:', logoPath);
      }
    } catch (err) {
      console.error('Error checking logo file:', err);
    }
    
    try {
      if (fs.existsSync(faviconPath)) {
        formData.append('site_favicon', fs.createReadStream(faviconPath));
        faviconIncluded = true;
        console.log('Added favicon file to request');
      } else {
        console.log('Favicon file not found at:', faviconPath);
      }
    } catch (err) {
      console.error('Error checking favicon file:', err);
    }
    
    // Make the request
    const response = await axios.put(`${baseURL}/api/settings`, formData, {
      headers: {
        ...formData.getHeaders(),
        'auth_key': authKey
      }
    });
    
    console.log('Settings updated successfully:', response.data);
    console.log('Logo included in request:', logoIncluded);
    console.log('Favicon included in request:', faviconIncluded);
    
    return response.data;
  } catch (error) {
    console.error('Error updating settings:', error.response?.data || error.message);
    throw error;
  }
}

// Function to create test image if it doesn't exist
function createTestImage(filePath, type) {
  // Skip if file already exists
  if (fs.existsSync(filePath)) {
    console.log(`Test ${type} already exists at:`, filePath);
    return;
  }
  
  console.log(`Creating test ${type} at:`, filePath);
  
  // For this test, we'll copy a sample image if available or create a minimal one
  let sampleImagePath;
  
  // Try to find a sample image in public/uploads
  try {
    const uploadsDir = path.join(__dirname, 'public', 'uploads');
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif|ico)$/i.test(file));
      
      if (imageFiles.length > 0) {
        sampleImagePath = path.join(uploadsDir, imageFiles[0]);
        console.log(`Using sample image: ${sampleImagePath}`);
        
        // Copy the sample image to our test file
        fs.copyFileSync(sampleImagePath, filePath);
        return;
      }
    }
  } catch (err) {
    console.error('Error finding sample image:', err);
  }
  
  // If no sample image was found, create a simple colored square
  try {
    // This is a simple 1x1 pixel PNG - in reality you'd want a proper image
    if (type === 'logo' && filePath.endsWith('.png')) {
      const minimalPNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
      fs.writeFileSync(filePath, minimalPNG);
    } else if (type === 'favicon' && filePath.endsWith('.ico')) {
      // Very simple ICO format - not ideal but works for testing
      const minimalICO = Buffer.from('AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAABILAAASCwAAAAAAAAAAAAD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wA=', 'base64');
      fs.writeFileSync(filePath, minimalICO);
    }
  } catch (err) {
    console.error(`Error creating minimal ${type}:`, err);
  }
}

// Main function to run the test
async function runTest() {
  try {
    console.log('--- Testing Settings Upload Functionality ---');
    
    // Create test images if they don't exist
    createTestImage(logoPath, 'logo');
    createTestImage(faviconPath, 'favicon');
    
    // Step 1: Get current settings
    console.log('\n1. Getting current settings...');
    const currentSettings = await getSettings();
    
    // Step 2: Login as admin
    console.log('\n2. Logging in as admin...');
    const authKey = await login();
    console.log('Auth key received');
    
    // Step 3: Update settings with logo and favicon
    console.log('\n3. Updating settings with logo and favicon...');
    const updatedSettings = await updateSettings(authKey);
    
    // Step 4: Get updated settings to verify
    console.log('\n4. Getting updated settings to verify changes...');
    const verifySettings = await getSettings();
    
    // Step 5: Check if the logo and favicon paths were updated
    console.log('\n5. Checking if logo and favicon were updated:');
    
    if (verifySettings.site_logo !== currentSettings.site_logo) {
      console.log('✅ Logo was updated successfully!');
      console.log(`   Previous: ${currentSettings.site_logo || 'Not set'}`);
      console.log(`   Current: ${verifySettings.site_logo}`);
    } else {
      console.log('❌ Logo was NOT updated or remained the same');
    }
    
    if (verifySettings.site_favicon !== currentSettings.site_favicon) {
      console.log('✅ Favicon was updated successfully!');
      console.log(`   Previous: ${currentSettings.site_favicon || 'Not set'}`);
      console.log(`   Current: ${verifySettings.site_favicon}`);
    } else {
      console.log('❌ Favicon was NOT updated or remained the same');
    }
    
    console.log('\n--- Test completed ---');
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run the test
runTest(); 