const Banner = require('../../models/banner');

// Public: Get only active banners for homepage
const getActiveBanners = async (req, res) => {
  try {
    const banners = await Banner.findAll({
      where: { status: 'Active' },
      order: [['sort_order', 'ASC']],
      attributes: ['id', 'title', 'description', 'image_url', 'link'],
    });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch banners.' });
  }
};

module.exports = { getActiveBanners };
