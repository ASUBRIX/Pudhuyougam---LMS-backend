const Setting = require('../../models/setting');

// Public: Get all website settings
const getWebsiteSettings = async (req, res) => {
  
  try {
    const settings = await Setting.getWebsiteSettings();
    
    if (!settings) {
      return res.status(404).json({ error: 'Settings not found' });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
};

module.exports = {
  getWebsiteSettings
};
