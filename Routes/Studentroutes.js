// routes/studentRoutes.js
const express = require("express");
const router = express.Router();

module.exports = (pool, authenticateToken) => {
  // Get all students (protected)
  router.get('/getStudents', authenticateToken, (req, res) => {
    pool.query('SELECT * FROM Student', (err, results) => {
      if (err) return res.status(500).json({ Status: "N", Message: "Query failed", Error: err });
      res.json({ Status: "Y", Data: results });
    });
  });

  // Get student by ID (protected)
  router.get('/getStudent/:S_RECID', authenticateToken, (req, res) => {
    const studentId = req.params.S_RECID;
    pool.query('SELECT * FROM Student WHERE S_RECID = ?', [studentId], (err, results) => {
      if (err) return res.status(500).json({ Status: "N", Message: "Query failed", Error: err });
      res.json({ Status: "Y", Data: results });
    });
  });

  // Add a new student (protected)
  router.post('/postStudents', authenticateToken, (req, res) => {
    const { name, address, education } = req.body;
    const sql = 'INSERT INTO Student (S_NAME, S_ADDRESS, S_EDUCATION) VALUES (?, ?, ?)';
    pool.query(sql, [name, address, education], (error, result) => {
      if (error) return res.status(500).json({ status: 'error', message: 'Database insert failed.' });
      res.status(200).json({ status: 'success', message: 'Student added successfully', insertId: result.insertId });
    });
  });

  // Update student (protected)
  router.put('/updateStudent/:S_RECID', authenticateToken, (req, res) => {
    const studentId = req.params.S_RECID;
    const { name, address, education } = req.body;
    const sql = 'UPDATE Student SET S_NAME = ?, S_ADDRESS = ?, S_EDUCATION = ? WHERE S_RECID = ?';
    pool.query(sql, [name, address, education, studentId], (error, result) => {
      if (error) return res.status(500).json({ status: 'error', message: 'Database update failed.' });
      if (result.affectedRows === 0) return res.status(404).json({ status: 'error', message: 'Student not found.' });
      res.status(200).json({ status: 'success', message: 'Student updated successfully' });
    });
  });

  // Delete student (protected)
  router.delete('/deleteStudent/:S_RECID', authenticateToken, (req, res) => {
    const studentId = req.params.S_RECID;
    pool.query('DELETE FROM Student WHERE S_RECID = ?', [studentId], (err) => {
      if (err) return res.status(500).json({ Status: "N", Message: "Query failed", Error: err });
      res.json({ Status: "Y", Data: "Student Deleted Successfully" });
    });
  });

  return router;
};
