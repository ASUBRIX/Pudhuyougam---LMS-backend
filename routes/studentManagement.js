const express = require("express");
const router = express.Router();
const { query } = require("../config/database");

// Get all students
router.get("/", async (req, res) => {
  try {
    const result = await query("SELECT * FROM students ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

// Add new student
router.post("/", async (req, res) => {
  console.log("hit student management api");
  
  try {
    const {name,email,phone,enrollmentDate,program,semester,year,status,courses} = req.body;

    const result = await query(
      `INSERT INTO students 
      (name, email, phone, enrollment_date, program, semester, year, status, courses, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *`,
      [name, email, phone, enrollmentDate, program, semester, year, status, courses]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding student:", error);
    res.status(500).json({ error: "Failed to add student" });
  }
});


// Update student
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {name,email,phone,enrollment_date,program,semester,year,status,courses} = req.body;

  try {
    const result = await query(
      `UPDATE students 
       SET name = $1, email = $2, phone = $3, enrollment_date = $4, 
           program = $5, semester = $6, year = $7, status = $8, 
           courses = $9, updated_at = NOW()
       WHERE id = $10 RETURNING *`,
      [name, email, phone, enrollment_date, program, semester, year, status, courses, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({ error: "Failed to update student" });
  }
});

// Delete student
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query("DELETE FROM students WHERE id = $1 RETURNING *", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({ error: "Failed to delete student" });
  }
});

module.exports = router;
