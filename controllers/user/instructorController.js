const { query } = require('../../config/database');

// Get public instructor list (active) with board_member field
const getPublicInstructors = async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        id, 
        faculty_id, 
        name, 
        department, 
        designation, 
        avatar, 
        experience, 
        bio,                  
        board_member
       FROM faculties
       WHERE status = 'active'
       ORDER BY board_member DESC, id DESC`,
    );
    
    console.log(`Fetched ${result.rows.length} active instructors`);
    // Debug: Check if bio is included
    if (result.rows.length > 0) {
      const sampleWithBio = result.rows.find(r => r.bio);
      if (sampleWithBio) {
        console.log('Sample instructor with bio:', {
          name: sampleWithBio.name,
          bio_length: sampleWithBio.bio ? sampleWithBio.bio.length : 0,
          board_member: sampleWithBio.board_member
        });
      }
    }
    
    return res.json(result.rows);
  } catch (err) {
    console.error('Error fetching instructors:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to fetch instructors' });
    }
  }
};

module.exports = { 
  getPublicInstructors 
};