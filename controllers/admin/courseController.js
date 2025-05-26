const { query } = require('../../config/database');

// --- CATEGORY LOGIC ---
const getAllCategories = async (req, res) => {
  try {
    const categories = await query('SELECT * FROM course_categories ORDER BY id');
    const subcategories = await query('SELECT * FROM course_subcategories ORDER BY id');
    const merged = categories.rows.map(cat => ({
      ...cat,
      subcategories: subcategories.rows.filter(sub => sub.category_id === cat.id)
    }));
    res.json(merged);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

const createCategoryWithSubs = async (req, res) => {
  const { title, subcategories } = req.body;
  try {
    const result = await query(
      'INSERT INTO course_categories (title) VALUES ($1) RETURNING id',
      [title]
    );
    const categoryId = result.rows[0].id;
    for (const sub of subcategories) {
      await query(
        'INSERT INTO course_subcategories (category_id, title) VALUES ($1, $2)',
        [categoryId, sub]
      );
    }
    res.status(201).json({ message: 'Category and subcategories created' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create category' });
  }
};

// --- COURSE LOGIC ---
const getAllCourses = async (req, res) => {
  try {
    const result = await query('SELECT * FROM courses ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
};

const getCourseById = async (req, res) => {
  try {
    const result = await query('SELECT * FROM courses WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Course not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch course' });
  }
};

const getCourseStats = async (req, res) => {
  try {
    const total = await query('SELECT COUNT(*) FROM courses');
    const active = await query("SELECT COUNT(*) FROM courses WHERE visibility_status = 'published'");
    const pending = await query("SELECT COUNT(*) FROM courses WHERE review_status = 'pending'");
    res.json({
      total: parseInt(total.rows[0].count),
      active: parseInt(active.rows[0].count),
      pending: parseInt(pending.rows[0].count)
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch course stats' });
  }
};

const createCourse = async (req, res) => {
  const {
    title, short_description, full_description, thumbnail, promo_video_url,
    price, discount, is_discount_enabled, validity_type, expiry_date,
    language, level, is_featured, total_lectures, total_duration, instructor_id,
    tags, message_to_reviewer, review_status, visibility_status
  } = req.body;
  try {
    const result = await query(
      `INSERT INTO courses (
        title, short_description, full_description, thumbnail, promo_video_url,
        price, discount, is_discount_enabled, validity_type, expiry_date,
        language, level, is_featured, total_lectures, total_duration, instructor_id,
        tags, message_to_reviewer, review_status, visibility_status
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20
      ) RETURNING *`,
      [
        title, short_description, full_description, thumbnail, promo_video_url,
        price, discount, is_discount_enabled, validity_type, expiry_date,
        language, level, is_featured, total_lectures, total_duration, instructor_id,
        tags, message_to_reviewer, review_status, visibility_status
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create course' });
  }
};

const updateCourse = async (req, res) => {
  const {
    title, short_description, full_description, thumbnail, promo_video_url,
    price, discount, is_discount_enabled, validity_type, expiry_date,
    language, level, is_featured, total_lectures, total_duration, instructor_id,
    tags, message_to_reviewer, review_status, visibility_status
  } = req.body;
  try {
    const result = await query(
      `UPDATE courses SET
        title=$1, short_description=$2, full_description=$3, thumbnail=$4, promo_video_url=$5,
        price=$6, discount=$7, is_discount_enabled=$8, validity_type=$9, expiry_date=$10,
        language=$11, level=$12, is_featured=$13, total_lectures=$14, total_duration=$15, instructor_id=$16,
        tags=$17, message_to_reviewer=$18, review_status=$19, visibility_status=$20,
        updated_at=NOW()
      WHERE id=$21 RETURNING *`,
      [
        title, short_description, full_description, thumbnail, promo_video_url,
        price, discount, is_discount_enabled, validity_type, expiry_date,
        language, level, is_featured, total_lectures, total_duration, instructor_id,
        tags, message_to_reviewer, review_status, visibility_status, req.params.id
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update course' });
  }
};

const deleteCourse = async (req, res) => {
  try {
    await query('DELETE FROM courses WHERE id = $1', [req.params.id]);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete course' });
  }
};

const getModulesForCourse = async (req, res) => {
  try {
    const result = await query('SELECT * FROM course_content_modules WHERE course_id = $1 ORDER BY sort_order', [req.params.courseId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch modules' });
  }
};

const createModule = async (req, res) => {
  const { course_id, title, sort_order } = req.body;
  try {
    const result = await query(
      'INSERT INTO course_content_modules (course_id, title, sort_order) VALUES ($1, $2, $3) RETURNING *',
      [course_id, title, sort_order || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create module' });
  }
};

// --- MOCK REVIEWS ---
const getCourseReviews = async (req, res) => {
  try {
    res.json([
      { name: 'Tony K', date: new Date(), rating: 4.5, avatar: '/avatar.jpg' },
      { name: 'Ashwin R', date: new Date(), rating: 5, avatar: '/avatar.jpg' }
    ]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch course reviews' });
  }
};

module.exports = {
  getAllCategories,
  createCategoryWithSubs,
  getAllCourses,
  getCourseById,
  getCourseStats,
  createCourse,
  updateCourse,
  deleteCourse,
  getModulesForCourse,
  createModule,
  getCourseReviews
};
