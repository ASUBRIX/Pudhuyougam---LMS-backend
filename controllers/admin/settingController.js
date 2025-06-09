const Setting = require('../../models/setting');

// Get all website settings
const getWebsiteSettings = async (req, res) => {
    try {
        const settings = await Setting.getWebsiteSettings();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
};

// Update website settings
const updateWebsiteSettings = async (req, res) => {
    try {
        const settings = { ...req.body };
        if (req.files) {
            if (req.files.site_logo && req.files.site_logo.length > 0) {
                settings.site_logo = '/uploads/' + req.files.site_logo[0].filename;
            }
            if (req.files.site_favicon && req.files.site_favicon.length > 0) {
                settings.site_favicon = '/uploads/' + req.files.site_favicon[0].filename;
            }
        }

        const updatedSettings = await Setting.updateWebsiteSettings(settings);
        res.json({
            message: 'Website settings updated successfully',
            settings: updatedSettings
        });
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
};

module.exports = {
    getWebsiteSettings,
    updateWebsiteSettings
};
