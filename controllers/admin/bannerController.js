const path = require('path');
const fs = require('fs');
const Banner = require('../../models/banner');

// Get all banners with optional sorting/search
const getAllBanners = async (req, res) => {
  try {
    const { sort = 'newest', search } = req.query;
    let banners = search
      ? await Banner.search(search, sort)
      : await Banner.findAll(sort);

    // Format image URLs
    banners = banners.map(banner => ({
      ...banner,
      image_url: banner.image_url.startsWith('http')
        ? banner.image_url
        : `${req.protocol}://${req.get('host')}${banner.image_url}`,
    }));
    res.status(200).json(banners);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch banners' });
  }
};

// Get single banner by ID
const getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ error: 'Banner not found' });
    banner.image_url = banner.image_url.startsWith('http')
      ? banner.image_url
      : `${req.protocol}://${req.get('host')}${banner.image_url}`;
    res.status(200).json(banner);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch banner' });
  }
};

// Create new banner
const createBanner = async (req, res) => {
  try {
    const { title, link, description } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    if (!req.file) return res.status(400).json({ error: 'Image is required' });

    const image_url = `/uploads/banners/${req.file.filename}`;
    const banner = await Banner.create({
      title,
      image_url,
      link: link || null,
      description: description || null
    });
    banner.image_url = `${req.protocol}://${req.get('host')}${banner.image_url}`;
    res.status(201).json(banner);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create banner' });
  }
};

// Update banner
const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, link, description } = req.body;
    const existingBanner = await Banner.findById(id);
    if (!existingBanner) return res.status(404).json({ error: 'Banner not found' });

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (link !== undefined) updateData.link = link;
    if (description !== undefined) updateData.description = description;

    if (req.file) {
      if (existingBanner.image_url && !existingBanner.image_url.startsWith('http')) {
        const oldImagePath = path.join(__dirname, '../../public', existingBanner.image_url);
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }
      updateData.image_url = `/uploads/banners/${req.file.filename}`;
    }

    const updatedBanner = await Banner.update(id, updateData);
    if (updatedBanner) {
      updatedBanner.image_url = updatedBanner.image_url.startsWith('http')
        ? updatedBanner.image_url
        : `${req.protocol}://${req.get('host')}${updatedBanner.image_url}`;
    }
    res.status(200).json(updatedBanner);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update banner' });
  }
};

// Delete banner
const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const existingBanner = await Banner.findById(id);
    if (!existingBanner) return res.status(404).json({ error: 'Banner not found' });

    await Banner.delete(id);

    if (existingBanner.image_url && !existingBanner.image_url.startsWith('http')) {
      const imagePath = path.join(__dirname, '../../public', existingBanner.image_url);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }
    res.status(200).json({ message: 'Banner deleted successfully', banner: existingBanner });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete banner' });
  }
};

module.exports = {
  getAllBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner
};
