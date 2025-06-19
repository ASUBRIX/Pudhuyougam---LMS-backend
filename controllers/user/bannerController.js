const Banner = require('../../models/banner');

/**
 * Public: Get only active banners for homepage
 * 
 * @description Retrieves all banners with status 'Active' ordered by sort_order
 * @route GET /api/banners
 * @access Public
 * @returns {Array} Array of banner objects with id, title, description, image_url, link
 * @returns {Object} Error object with error message on failure
 */
const getActiveBanners = async (req, res) => {
  try {
    // Fetch active banners sorted by display order
    const banners = await Banner.findAll({
      where: { 
        status: 'Active' 
      },
      order: [
        ['sort_order', 'ASC']  // Display banners in specified order
      ],
      attributes: [
        'id', 
        'title', 
        'description', 
        'image_url', 
        'link'
      ], // Only return necessary fields for frontend
    });
   
    // Return banners array directly (matches your current API response format)
    res.json(banners);
    
  } catch (err) {
    console.error('Error fetching active banners:', err);
    
    // Return error in your current format
    res.status(500).json({ 
      error: 'Failed to fetch banners.' 
    });
  }
};

module.exports = { 
  getActiveBanners 
};