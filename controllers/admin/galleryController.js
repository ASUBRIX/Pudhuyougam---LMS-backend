const path = require('path');
const fs = require('fs');
const { query } = require('../../config/database');

// Get all gallery items
const getGallery = async (req, res) => {
  try {
    const result = await query('SELECT * FROM gallery_items ORDER BY created_at DESC');
    const host = `${req.protocol}://${req.get('host')}`;
    const formatted = result.rows.map(img => ({
      ...img,
      image_url: img.image_url.startsWith('http') ? img.image_url : `${host}${img.image_url}`
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch gallery items' });
  }
};

// Upload images (multiple)
const uploadImages = async (req, res) => {
  try {
    const items = req.files.map(file => ({
      name: file.originalname,
      image_url: `/uploads/gallery/${file.filename}`
    }));

    const values = items.map(({ name, image_url }) => `('${name}', '${image_url}')`).join(',');
    const insertSQL = `INSERT INTO gallery_items (name, image_url) VALUES ${values} RETURNING *`;

    const result = await query(insertSQL);
    const host = `${req.protocol}://${req.get('host')}`;
    const formatted = result.rows.map(img => ({
      ...img,
      image_url: `${host}${img.image_url}`
    }));
    res.status(201).json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload images' });
  }
};

// Delete image by ID
const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;

    const check = await query('SELECT * FROM gallery_items WHERE id = $1', [id]);
    if (check.rows.length === 0) return res.status(404).json({ error: 'Image not found' });

    const imagePath = path.join(__dirname, '../../public', check.rows[0].image_url);
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);

    await query('DELETE FROM gallery_items WHERE id = $1', [id]);
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete image' });
  }
};

module.exports = {
  getGallery,
  uploadImages,
  deleteImage,
};
