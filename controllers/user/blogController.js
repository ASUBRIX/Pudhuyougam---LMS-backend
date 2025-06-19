const { query } = require('../../config/database');

/**
 * Get all published blogs (for students)
 * 
 * @description Retrieves all blogs with is_published = true, ordered by newest first
 * @route GET /api/blogs
 * @access Public
 * @returns {Array} Array of published blog objects
 * @returns {Object} Error object with error message on failure
 */
const getAllPublishedBlogs = async (req, res) => {
  try {
    // Fetch all published blogs ordered by creation date (newest first)
    const result = await query(
      'SELECT * FROM blogs WHERE is_published = true ORDER BY created_at DESC'
    );
    
    // Return blogs array directly (matches your current API response format)
    res.json(result.rows);
    
  } catch (err) {
    console.error('Error fetching published blogs:', err);
    
    // Return error in your current format
    res.status(500).json({ 
      error: 'Failed to fetch blogs' 
    });
  }
};

/**
 * Get a single published blog by id
 * 
 * @description Retrieves a specific blog by ID if it exists and is published
 * @route GET /api/blogs/:id
 * @access Public
 * @param {string} req.params.id - Blog ID from URL parameter
 * @returns {Object} Single blog object if found and published
 * @returns {Object} Error object with error message on failure or not found
 */
const getPublishedBlogById = async (req, res) => {
  try {
    // Fetch specific blog by ID, only if published
    const result = await query(
      'SELECT * FROM blogs WHERE id = $1 AND is_published = true',
      [req.params.id]
    );
    
    // Check if blog exists and is published
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Blog not found' 
      });
    }
    
    // Return single blog object (first row)
    res.json(result.rows[0]);
    
  } catch (err) {
    console.error('Error fetching blog by ID:', err);
    
    // Return error in your current format
    res.status(500).json({ 
      error: 'Failed to fetch blog' 
    });
  }
};

module.exports = {
  getAllPublishedBlogs,
  getPublishedBlogById,
};