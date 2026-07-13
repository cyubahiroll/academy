const db = require('../config/db');

const TeamMember = {
  findAll: async (activeOnly = false) => {
    let query = 'SELECT * FROM team_members';
    const params = [];
    if (activeOnly) {
      query += ' WHERE is_active = TRUE';
    }
    query += ' ORDER BY display_order ASC, created_at ASC';
    const [rows] = await db.query(query, params);
    return rows;
  },

  findById: async (id) => {
    const [rows] = await db.query('SELECT * FROM team_members WHERE id = ?', [id]);
    return rows[0];
  },

  create: async (data) => {
    const [result] = await db.query(
      'INSERT INTO team_members (name, role, description, image_url, display_order, is_active) VALUES (?, ?, ?, ?, ?, ?)',
      [data.name, data.role, data.description, data.image_url || null, data.display_order || 0, data.is_active !== undefined ? data.is_active : true]
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
    const [result] = await db.query(`UPDATE team_members SET ${fields.join(', ')} WHERE id = ?`, values);
    return result.affectedRows;
  },

  delete: async (id) => {
    const [result] = await db.query('DELETE FROM team_members WHERE id = ?', [id]);
    return result.affectedRows;
  }
};

module.exports = TeamMember;
