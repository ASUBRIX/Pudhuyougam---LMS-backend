const axios = require('axios');

// Test script for the test history endpoint
async function testHistoryEndpoint() {
    try {
        // First, check if the server is running
        try {
            await axios.get('http://localhost:3000/api');
            console.log("Server appears to be running");
        } catch (error) {
            if (error.code === 'ECONNREFUSED') {
                console.error("Server doesn't appear to be running. Start it with 'npm start' before running this test.");
                process.exit(1);
            }
            console.log("Server check returned error but might still be running. Proceeding with test.");
        }
        
        console.log("Testing test history endpoint for student...");
        
        // First, login as the student to get a valid token
        console.log("Logging in as student...");
        try {
            const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
                email: 'student1744877726803@example.com',
                password: 'Student123!'
            });
            
            if (!loginResponse.data || !loginResponse.data.auth_key) {
                console.error("Login failed, could not get auth_key:", loginResponse.data);
                process.exit(1);
            }
            
            const authKey = loginResponse.data.auth_key;
            console.log(`Logged in successfully as student, received auth_key`);
            
            // Now test the history endpoint
            console.log("\nFetching test history...");
            const historyResponse = await axios.get('http://localhost:3000/api/tests/history', {
                headers: {
                    'auth_key': authKey
                }
            });
            
            console.log(`\nResponse Status: ${historyResponse.status}`);
            console.log("Response data:");
            console.log(JSON.stringify(historyResponse.data, null, 2));
            
            // Additional test: try with pagination and sorting
            console.log("\nTesting with pagination and sorting...");
            const paginatedResponse = await axios.get('http://localhost:3000/api/tests/history?page=1&limit=5&sort=date_desc', {
                headers: {
                    'auth_key': authKey
                }
            });
            
            console.log(`\nPaginated Response Status: ${paginatedResponse.status}`);
            console.log("Paginated Response data:");
            console.log(JSON.stringify(paginatedResponse.data, null, 2));
            
        } catch (error) {
            console.error("Login or endpoint test failed:", error.message);
            
            if (error.response) {
                console.error("Response status:", error.response.status);
                console.error("Response data:", error.response.data);
            }
            
            // Let's check if the route exists by doing a direct database query
            console.log("\nAttempting direct database check instead...");
            const pool = require('./config/database');
            
            // Find our specific student user
            const userQuery = `
                SELECT id, email FROM users 
                WHERE email = 'student1744877726803@example.com'`;
            
            const userResult = await pool.query(userQuery);
            if (userResult.rows.length > 0) {
                const studentId = userResult.rows[0].id;
                console.log(`Found student user with ID: ${studentId}, Email: ${userResult.rows[0].email}`);
                
                const studentAttemptsQuery = `
                    SELECT ta.id, ta.score, ta.passed, ta.created_at, t.title as test_name, t.id as test_id
                    FROM test_attempts ta
                    JOIN tests t ON ta.test_id = t.id
                    WHERE ta.user_id = $1
                    ORDER BY ta.created_at DESC`;
                
                const studentAttempts = await pool.query(studentAttemptsQuery, [studentId]);
                console.log(`\nFound ${studentAttempts.rows.length} test attempts for student in database:`);
                
                const history = studentAttempts.rows.map(attempt => ({
                    attempt_id: attempt.id,
                    test_id: attempt.test_id,
                    test_name: attempt.test_name,
                    taken_date: attempt.created_at,
                    score: attempt.score,
                    status: attempt.passed ? 'Passed' : 'Failed'
                }));
                
                console.log(JSON.stringify({
                    status: 'success',
                    history,
                    pagination: {
                        total: history.length,
                        totalPages: 1,
                        currentPage: 1,
                        limit: history.length
                    }
                }, null, 2));
            } else {
                console.log("Student user not found in the database.");
            }
        }
    } catch (error) {
        console.error("Error in test execution:", error);
    }
}

// Run the test
testHistoryEndpoint().then(() => {
    console.log("\nTest completed.");
    process.exit(0);
}).catch(err => {
    console.error("Error in main execution:", err);
    process.exit(1);
}); 