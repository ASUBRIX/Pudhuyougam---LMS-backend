const { pool } = require('./config/database');

async function createStudent() {
    try {
        // Create a student directly in the database
        const id = `STU${Math.floor(Math.random() * 900000) + 100000}`;
        
        const query = `
            INSERT INTO students (
                id, user_id, first_name, last_name, email, phone, 
                enrollment_date, program, status, about, 
                education, profile_picture
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *`;

        const values = [
            id,           // id
            2,            // user_id - assuming user id 2 is the student user
            'John',       // first_name
            'Doe',        // last_name
            'student@lms.com', // email
            '9876543210', // phone
            '2023-05-15', // enrollment_date
            'Computer Science', // program
            'active',     // status
            'A dedicated student', // about
            JSON.stringify([{ level: 'High School', institution: 'ABC High School', year: '2020' }]), // education
            'default.jpg' // profile_picture
        ];

        console.log('Executing query:', query);
        console.log('With values:', values);

        const result = await pool.query(query, values);
        console.log('Student created successfully:', result.rows[0]);
    } catch (error) {
        console.error('Error creating student:', error);
    } finally {
        // Close the connection pool
        await pool.end();
    }
}

// Run the function
createStudent(); 