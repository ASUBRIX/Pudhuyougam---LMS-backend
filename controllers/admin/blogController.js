const { query } = require('../../config/database');

// Get all blogs with enhanced filtering and sorting
const getAllBlogs = async (req, res) => {
  try {
    const { 
      search, 
      status, 
      tag, 
      sortBy = 'created_at', 
      order = 'DESC',
      page = 1,
      limit = 10 
    } = req.query;

    let queryStr = 'SELECT * FROM blogs WHERE 1=1';
    const queryParams = [];
    let paramIndex = 1;

    // Add search filter
    if (search) {
      queryStr += ` AND (title ILIKE $${paramIndex} OR author ILIKE $${paramIndex + 1} OR content ILIKE $${paramIndex + 2})`;
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      paramIndex += 3;
    }

    // Add status filter
    if (status && status !== 'all') {
      const isPublished = status === 'published';
      queryStr += ` AND is_published = $${paramIndex}`;
      queryParams.push(isPublished);
      paramIndex++;
    }

    // Add tag filter
    if (tag) {
      queryStr += ` AND $${paramIndex} = ANY(tags)`;
      queryParams.push(tag);
      paramIndex++;
    }

    // Add sorting
    const validSortFields = ['created_at', 'title', 'author', 'is_published'];
    const validOrder = ['ASC', 'DESC'];
    
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortOrder = validOrder.includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';
    
    queryStr += ` ORDER BY ${sortField} ${sortOrder}`;

    // Add pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    queryStr += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(parseInt(limit), offset);

    // Execute main query
    const result = await query(queryStr, queryParams);

    // Get total count for pagination
    let countQueryStr = 'SELECT COUNT(*) FROM blogs WHERE 1=1';
    const countParams = [];
    let countParamIndex = 1;

    if (search) {
      countQueryStr += ` AND (title ILIKE $${countParamIndex} OR author ILIKE $${countParamIndex + 1} OR content ILIKE $${countParamIndex + 2})`;
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      countParamIndex += 3;
    }

    if (status && status !== 'all') {
      const isPublished = status === 'published';
      countQueryStr += ` AND is_published = $${countParamIndex}`;
      countParams.push(isPublished);
      countParamIndex++;
    }

    if (tag) {
      countQueryStr += ` AND $${countParamIndex} = ANY(tags)`;
      countParams.push(tag);
      countParamIndex++;
    }

    const countResult = await query(countQueryStr, countParams);
    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Error fetching blogs:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch blogs',
      message: err.message 
    });
  }
};

// Create blog with validation
const createBlog = async (req, res) => {
  try {
    const { title, date, author, excerpt, content, imageUrl, tags, isPublished } = req.body;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Title is required' 
      });
    }

    if (!author || !author.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Author is required' 
      });
    }

    if (!excerpt || !excerpt.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Excerpt is required' 
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Content is required' 
      });
    }

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'At least one tag is required' 
      });
    }

    // Sanitize and validate tags
    const sanitizedTags = tags
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .slice(0, 10); // Limit to 10 tags

    if (sanitizedTags.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'At least one valid tag is required' 
      });
    }

    // Set default date if not provided
    const blogDate = date || new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Check if updated_at column exists
    const columnCheck = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'blogs' AND column_name = 'updated_at'
    `);
    
    const hasUpdatedAt = columnCheck.rows.length > 0;

    // Build insert query based on available columns
    let insertQuery;
    let queryParams;

    if (hasUpdatedAt) {
      insertQuery = `INSERT INTO blogs (title, date, author, excerpt, content, image_url, tags, is_published, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *`;
    } else {
      insertQuery = `INSERT INTO blogs (title, date, author, excerpt, content, image_url, tags, is_published, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP) RETURNING *`;
    }

    queryParams = [
      title.trim(), 
      blogDate, 
      author.trim(), 
      excerpt.trim(), 
      content.trim(), 
      imageUrl || null, 
      sanitizedTags, 
      isPublished !== undefined ? isPublished : true
    ];

    const result = await query(insertQuery, queryParams);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Blog created successfully'
    });
  } catch (err) {
    console.error('Error creating blog:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create blog',
      message: err.message 
    });
  }
};

// Update blog with validation
const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, author, excerpt, content, imageUrl, tags, isPublished } = req.body;

    // Check if blog exists
    const existingBlog = await query('SELECT * FROM blogs WHERE id = $1', [id]);
    if (existingBlog.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Blog not found' 
      });
    }

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Title is required' 
      });
    }

    if (!author || !author.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Author is required' 
      });
    }

    if (!excerpt || !excerpt.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Excerpt is required' 
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Content is required' 
      });
    }

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'At least one tag is required' 
      });
    }

    // Sanitize and validate tags
    const sanitizedTags = tags
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .slice(0, 10); // Limit to 10 tags

    if (sanitizedTags.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'At least one valid tag is required' 
      });
    }

    // Check if updated_at column exists
    const columnCheck = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'blogs' AND column_name = 'updated_at'
    `);
    
    const hasUpdatedAt = columnCheck.rows.length > 0;

    // Build update query based on available columns
    let updateQuery;
    let queryParams;

    if (hasUpdatedAt) {
      updateQuery = `UPDATE blogs SET 
        title = $1, 
        date = $2, 
        author = $3, 
        excerpt = $4, 
        content = $5,
        image_url = $6, 
        tags = $7, 
        is_published = $8, 
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $9 RETURNING *`;
    } else {
      updateQuery = `UPDATE blogs SET 
        title = $1, 
        date = $2, 
        author = $3, 
        excerpt = $4, 
        content = $5,
        image_url = $6, 
        tags = $7, 
        is_published = $8
       WHERE id = $9 RETURNING *`;
    }

    queryParams = [
      title.trim(), 
      date || existingBlog.rows[0].date, 
      author.trim(), 
      excerpt.trim(), 
      content.trim(), 
      imageUrl, 
      sanitizedTags, 
      isPublished !== undefined ? isPublished : existingBlog.rows[0].is_published, 
      id
    ];

    const result = await query(updateQuery, queryParams);

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Blog updated successfully'
    });
  } catch (err) {
    console.error('Error updating blog:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update blog',
      message: err.message 
    });
  }
};

// Delete blog with validation
const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if blog exists
    const existingBlog = await query('SELECT * FROM blogs WHERE id = $1', [id]);
    if (existingBlog.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Blog not found' 
      });
    }

    await query('DELETE FROM blogs WHERE id = $1', [id]);
    
    res.json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting blog:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete blog',
      message: err.message 
    });
  }
};

// Get single blog by ID
const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM blogs WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Blog not found' 
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Error fetching blog:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch blog',
      message: err.message 
    });
  }
};

// Get blog statistics
const getBlogStats = async (req, res) => {
  try {
    const totalBlogs = await query('SELECT COUNT(*) FROM blogs');
    const publishedBlogs = await query('SELECT COUNT(*) FROM blogs WHERE is_published = true');
    const draftBlogs = await query('SELECT COUNT(*) FROM blogs WHERE is_published = false');
    
    // Get popular tags
    const tagsResult = await query(`
      SELECT unnest(tags) as tag, COUNT(*) as count 
      FROM blogs 
      GROUP BY tag 
      ORDER BY count DESC 
      LIMIT 10
    `);

    // Get recent activity
    const recentBlogs = await query(`
      SELECT id, title, created_at, is_published 
      FROM blogs 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    res.json({
      success: true,
      data: {
        total: parseInt(totalBlogs.rows[0].count),
        published: parseInt(publishedBlogs.rows[0].count),
        drafts: parseInt(draftBlogs.rows[0].count),
        popularTags: tagsResult.rows,
        recentActivity: recentBlogs.rows
      }
    });
  } catch (err) {
    console.error('Error fetching blog statistics:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch blog statistics',
      message: err.message 
    });
  }
};

// Bulk operations
const bulkUpdateBlogs = async (req, res) => {
  try {
    const { blogIds, action, value } = req.body;

    if (!Array.isArray(blogIds) || blogIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Blog IDs array is required' 
      });
    }

    let result;
    switch (action) {
      case 'publish':
        result = await query(
          `UPDATE blogs SET is_published = true, updated_at = CURRENT_TIMESTAMP 
           WHERE id = ANY($1) RETURNING id, title, is_published`,
          [blogIds]
        );
        break;
      case 'unpublish':
        result = await query(
          `UPDATE blogs SET is_published = false, updated_at = CURRENT_TIMESTAMP 
           WHERE id = ANY($1) RETURNING id, title, is_published`,
          [blogIds]
        );
        break;
      case 'delete':
        result = await query(
          `DELETE FROM blogs WHERE id = ANY($1) RETURNING id, title`,
          [blogIds]
        );
        break;
      default:
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid action' 
        });
    }

    res.json({
      success: true,
      data: result.rows,
      message: `Successfully ${action}ed ${result.rows.length} blog(s)`
    });
  } catch (err) {
    console.error('Error in bulk operation:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to perform bulk operation',
      message: err.message 
    });
  }
};

module.exports = {
  getAllBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  getBlogById,
  getBlogStats,
  bulkUpdateBlogs
};