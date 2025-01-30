const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken, authorizeAdmin } = require('../middlewares/auth');

router.get('/:id/evaluate', authenticateToken, authorizeAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const candidateResult = await pool.query(`
      SELECT users.name AS candidate_name, job_posts.title AS job_title
      FROM applications
      JOIN users ON applications.user_id = users.id
      JOIN job_posts ON applications.job_posting_id = job_posts.id
      WHERE applications.id = $1
    `, [id]);

    if (candidateResult.rows.length === 0) {
      return res.status(404).send('Candidate not found.');
    }

    res.render('evaluateCandidates', { 
      title: 'Evaluate Candidate',
      name: req.user.name,
      candidate: candidateResult.rows[0],
    });
  } catch (err) {
    console.error('Database Error:', err.message);
    res.status(500).send('Server error');
  }
});

router.post('/:id/evaluate', authenticateToken, authorizeAdmin, async (req, res) => {
  const { id } = req.params;
  const { score, comments } = req.body;

  try {
    const query = `
      UPDATE applications
      SET score = $1, comments = $2
      WHERE id = $3;
    `;
    await pool.query(query, [score, comments, id]);

    res.redirect('/admin/evaluate-candidates'); 
  } catch (err) {
    console.error('Database Error:', err.message);
    res.status(500).send('Server error');
  }
});

router.post('/:id/update-score', authenticateToken, authorizeAdmin, async (req, res) => {
  const { id } = req.params;
  const { score, comments } = req.body;

  try {
    const query = `
      UPDATE applications
      SET average_score = $1, comments = $2
      WHERE id = $3;
    `;
    await pool.query(query, [score, comments, id]);

    res.redirect('/admin/ranked-candidates');
  } catch (err) {
    console.error('Database Error:', err.message);
    res.status(500).send('Server error');
  }
});

router.get('/ranked-candidates', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
      const rankedCandidates = await pool.query(`
          SELECT 
              applications.id AS id,
              users.name AS candidate_name,
              job_posts.title AS job_title,
              applications.average_score,
              applications.comments
          FROM applications
          JOIN users ON applications.user_id = users.id
          JOIN job_posts ON applications.job_posting_id = job_posts.id
          WHERE applications.average_score IS NOT NULL
          ORDER BY applications.average_score DESC;
      `);

      res.render('rankedCandidates', {
          title: 'Ranked Candidates',
          name: req.user.name,
          rankedCandidates: rankedCandidates.rows,
      });
  } catch (err) {
      console.error('Database Error:', err.message);
      res.status(500).send('Server error');
  }
});


router.post('/:id/update-score', authenticateToken, authorizeAdmin, async (req, res) => {
  const { id } = req.params;
  const { score, comments } = req.body;

  try {
      const query = `
          UPDATE applications
          SET average_score = $1, comments = $2
          WHERE id = $3;
      `;
      await pool.query(query, [score, comments, id]);

      res.redirect('/admin/ranked-candidates');
  } catch (err) {
      console.error('Database Error:', err.message);
      res.status(500).send('Server error');
  }
});


module.exports = router;
