const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { query } = require('../config/database');

// Setup storage for gallery uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../public/uploads/gallery');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = 'gallery_' + Date.now() + ext;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// 📸 GET all gallery items
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM gallery_items ORDER BY created_at DESC');

    // Prepend full host path to image_url
    const host = `${req.protocol}://${req.get('host')}`;
    const formatted = result.rows.map(img => ({
      ...img,
      image_url: img.image_url.startsWith('http') ? img.image_url : `${host}${img.image_url}`
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching gallery:', error);
    res.status(500).json({ error: 'Failed to fetch gallery items' });
  }
});

// 📤 POST upload one or more images
router.post('/upload', upload.array('images', 10), async (req, res) => {
  try {
    const items = req.files.map(file => ({
      name: file.originalname,
      image_url: `/uploads/gallery/${file.filename}`
    }));

    const values = items.map(({ name, image_url }) => `('${name}', '${image_url}')`).join(',');
    const insertSQL = `INSERT INTO gallery_items (name, image_url) VALUES ${values} RETURNING *`;

    const result = await query(insertSQL);

    // Prepend host for each image
    const host = `${req.protocol}://${req.get('host')}`;
    const formatted = result.rows.map(img => ({
      ...img,
      image_url: `${host}${img.image_url}`
    }));

    res.status(201).json(formatted);
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

// 🗑️ DELETE image by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const check = await query('SELECT * FROM gallery_items WHERE id = $1', [id]);
    if (check.rows.length === 0) return res.status(404).json({ error: 'Image not found' });

    const imagePath = path.join(__dirname, '../public', check.rows[0].image_url);
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);

    await query('DELETE FROM gallery_items WHERE id = $1', [id]);
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

module.exports = router;

