const { query } = require('../../config/database');

/**
 * Get all active current affairs (for users)
 * 
 * @description Retrieves all current affairs with is_active = true, ordered by date (newest first)
 * @route GET /api/current-affairs
 * @access Public
 * @returns {Array} Array of active current affairs objects ordered by date DESC
 * @returns {Object} Error object with error message on failure
 */
const getAllCurrentAffairs = async (req, res) => {
  try {
    // Fetch all active current affairs ordered by date (newest first)
    const result = await query(
      'SELECT * FROM current_affairs WHERE is_active = true ORDER BY date DESC'
    );
    
    // Return current affairs array directly (matches your current API response format)
    res.json(result.rows);
    
  } catch (err) {
    console.error('Error fetching current affairs:', err);
    
    // Return error in your current format
    res.status(500).json({ 
      error: 'Failed to fetch current affairs' 
    });
  }
};

/**
 * Get single current affair by ID (for users)
 * 
 * @description Retrieves a specific current affair by ID if it exists and is active
 * @route GET /api/current-affairs/:id
 * @access Public
 * @param {string} req.params.id - Current affair ID from URL parameter
 * @returns {Object} Single current affair object if found and active
 * @returns {Object} Error object with error message on failure or not found
 */
const getCurrentAffairById = async (req, res) => {
  try {
    // Fetch specific current affair by ID, only if active
    const result = await query(
      'SELECT * FROM current_affairs WHERE id = $1 AND is_active = true',
      [req.params.id]
    );
    
    // Check if current affair exists and is active
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Current affair not found' 
      });
    }
    
    // Return single current affair object (first row)
    res.json(result.rows[0]);
    
  } catch (err) {
    console.error('Error fetching current affair by ID:', err);
    
    // Return error in your current format
    res.status(500).json({ 
      error: 'Failed to fetch current affair' 
    });
  }
};

module.exports = {
  getAllCurrentAffairs,
  getCurrentAffairById,
};