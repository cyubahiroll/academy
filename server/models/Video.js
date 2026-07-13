const db = require('../config/db');

const Video = {
  findAll: async (isFree = null) => {
    let query = `SELECT v.*, c.name as category_name FROM videos v 
                 LEFT JOIN categories c ON v.category_id = c.id`;
    const params = [];
    if (isFree !== null) {
      query += ' WHERE v.is_free = ?';
      params.push(isFree);
    }
    query += ' ORDER BY v.created_at DESC';
    const [rows] = await db.query(query, params);
    return rows;
  },

  findById: async (id) => {
    const [rows] = await db.query(
      `SELECT v.*, c.name as category_name FROM videos v 
       LEFT JOIN categories c ON v.category_id = c.id WHERE v.id = ?`, [id]
    );
    return rows[0];
  },

  create: async (data) => {
    const [result] = await db.query(
      'INSERT INTO videos (title, description, video_url, thumbnail, duration, category_id, is_free) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [data.title, data.description, data.video_url, data.thumbnail, data.duration, data.category_id, data.is_free]
    );
    return result.insertId;
  },

  update: async (id, data) => {
    const fields = [];
    const values = [];
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    values.push(id);
    const [result] = await db.query(`UPDATE videos SET ${fields.join(', ')} WHERE id = ?`, values);
    return result.affectedRows;
  },

  delete: async (id) => {
    const [result] = await db.query('DELETE FROM videos WHERE id = ?', [id]);
    return result.affectedRows;
  },

  incrementViews: async (id) => {
    const [result] = await db.query('UPDATE videos SET view_count = view_count + 1 WHERE id = ?', [id]);
    return result.affectedRows;
  }
};

module.exports = Video;
