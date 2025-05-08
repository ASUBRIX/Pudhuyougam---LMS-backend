// routes/banners.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Banner = require('../models/banner');
const { auth, requireAdmin } = require('../middleware/auth');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../public/uploads/banners');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'banner-' + uniqueSuffix + ext);
  }
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB size limit
});

// Middleware to require admin access for all banner routes
router.use(auth, requireAdmin);

// Get all banners with optional sorting
router.get('/', async (req, res) => {
  try {
    const { sort = 'newest', search } = req.query;
    
    let banners;
    if (search) {
      banners = await Banner.search(search, sort);
    } else {
      banners = await Banner.findAll(sort);
    }
    
    // Format image URLs to be absolute
    const formattedBanners = banners.map(banner => ({
      ...banner,
      image_url: banner.image_url.startsWith('http') 
        ? banner.image_url 
        : `${req.protocol}://${req.get('host')}${banner.image_url}`
    }));
    
    res.status(200).json(formattedBanners);
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({ error: 'Failed to fetch banners' });
  }
});

// Get single banner by ID
router.get('/:id', async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    
    if (!banner) {
      return res.status(404).json({ error: 'Banner not found' });
    }
    
    // Format image URL to be absolute
    banner.image_url = banner.image_url.startsWith('http') 
      ? banner.image_url 
      : `${req.protocol}://${req.get('host')}${banner.image_url}`;
    
    res.status(200).json(banner);
  } catch (error) {
    console.error(`Error fetching banner ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch banner' });
  }
});

// Create new banner
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, link, description } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'Image is required' });
    }
    
    // Get relative path for storage in DB
    const image_url = `/uploads/banners/${req.file.filename}`;
    
    const banner = await Banner.create({
      title,
      image_url,
      link: link || null,
      description: description || null
    });
    
    // Format image URL to be absolute in response
    banner.image_url = `${req.protocol}://${req.get('host')}${banner.image_url}`;
    
    res.status(201).json(banner);
  } catch (error) {
    console.error('Error creating banner:', error);
    res.status(500).json({ error: 'Failed to create banner' });
  }
});

// Update banner
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, link, description } = req.body;
    
    // Check if banner exists
    const existingBanner = await Banner.findById(id);
    if (!existingBanner) {
      return res.status(404).json({ error: 'Banner not found' });
    }
    
    // Prepare update data
    const updateData = {};
    
    if (title !== undefined) updateData.title = title;
    if (link !== undefined) updateData.link = link;
    if (description !== undefined) updateData.description = description;
    
    // Handle image update
    if (req.file) {
      // Delete old image if it exists and is not an external URL
      if (existingBanner.image_url && !existingBanner.image_url.startsWith('http')) {
        const oldImagePath = path.join(__dirname, '../public', existingBanner.image_url);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      // Add new image path
      updateData.image_url = `/uploads/banners/${req.file.filename}`;
    }
    
    // Update banner in database
    const updatedBanner = await Banner.update(id, updateData);
    
    // Format image URL to be absolute in response
    if (updatedBanner) {
      updatedBanner.image_url = updatedBanner.image_url.startsWith('http')
        ? updatedBanner.image_url
        : `${req.protocol}://${req.get('host')}${updatedBanner.image_url}`;
    }
    
    res.status(200).json(updatedBanner);
  } catch (error) {
    console.error(`Error updating banner ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update banner' });
  }
});

// Delete banner
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if banner exists and get its data
    const existingBanner = await Banner.findById(id);
    if (!existingBanner) {
      return res.status(404).json({ error: 'Banner not found' });
    }
    
    // Delete the banner from database
    const deletedBanner = await Banner.delete(id);
    
    // Delete image file if it's not an external URL
    if (existingBanner.image_url && !existingBanner.image_url.startsWith('http')) {
      const imagePath = path.join(__dirname, '../public', existingBanner.image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    res.status(200).json({ message: 'Banner deleted successfully', banner: deletedBanner });
  } catch (error) {
    console.error(`Error deleting banner ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete banner' });
  }
});

module.exports = router; 