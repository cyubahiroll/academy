const db = require('../config/db');

const Document = {
  findAll: async (isFree = null) => {
    let query = `SELECT d.*, c.name as category_name FROM documents d 
                 LEFT JOIN categories c ON d.category_id = c.id`;
    const params = [];
    if (isFree !== null) {
      query += ' WHERE d.is_free = ?';
      params.push(isFree);
    }
    query += ' ORDER BY d.created_at DESC';
    const [rows] = await db.query(query, params);
    return rows;
  },

  findById: async (id) => {
    const [rows] = await db.query(
      `SELECT d.*, c.name as category_name FROM documents d 
       LEFT JOIN categories c ON d.category_id = c.id WHERE d.id = ?`, [id]
    );
    return rows[0];
  },

  create: async (data) => {
    const [result] = await db.query(
      'INSERT INTO documents (title, author, description, cover_image, file_url, file_type, category_id, is_free) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [data.title, data.author || 'Road Rules Academy', data.description, data.cover_image || null, data.file_url, data.file_type, data.category_id, data.is_free]
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
    const [result] = await db.query(`UPDATE documents SET ${fields.join(', ')} WHERE id = ?`, values);
    return result.affectedRows;
  },

  delete: async (id) => {
    const [result] = await db.query('DELETE FROM documents WHERE id = ?', [id]);
    return result.affectedRows;
  },

  incrementDownloads: async (id) => {
    const [result] = await db.query('UPDATE documents SET download_count = download_count + 1 WHERE id = ?', [id]);
    return result.affectedRows;
  }
};

module.exports = Document;
