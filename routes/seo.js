const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// GET all SEO settings
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM seo_settings');
    const data = {};
    result.rows.forEach(row => {
      data[row.page] = {
        metaTitle: row.meta_title,
        metaDescription: row.meta_description,
        metaKeywords: row.meta_keywords,
      };
    });
    res.json(data);
  } catch (err) {
    console.error('Failed to fetch SEO settings:', err);
    res.status(500).json({ error: 'Failed to fetch SEO settings' });
  }
});

// POST update one or many SEO settings
router.post('/', async (req, res) => {
  const updates = req.body;

  try {
    for (const page in updates) {
      const { metaTitle, metaDescription, metaKeywords } = updates[page];

      await query(`
        INSERT INTO seo_settings (page, meta_title, meta_description, meta_keywords)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (page) DO UPDATE
        SET meta_title = EXCLUDED.meta_title,
            meta_description = EXCLUDED.meta_description,
            meta_keywords = EXCLUDED.meta_keywords,
            updated_at = CURRENT_TIMESTAMP
      `, [page, metaTitle, metaDescription, metaKeywords]);
    }

    res.json({ message: 'SEO settings saved successfully' });
  } catch (err) {
    console.error('Failed to save SEO settings:', err);
    res.status(500).json({ error: 'Failed to save SEO settings' });
  }
});

module.exports = router;
