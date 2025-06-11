const { query } = require('../config/database');

const generateEnrollmentId = async () => {
  const result = await query(`SELECT nextval('enrollment_id_seq') AS next_id`);
  const nextId = result.rows[0]?.next_id || 1;
  return `STU${String(nextId).padStart(3, '0')}`;
};

module.exports = generateEnrollmentId;

