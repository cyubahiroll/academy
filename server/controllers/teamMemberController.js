const TeamMember = require('../models/TeamMember');

exports.getAll = async (req, res, next) => {
  try {
    const activeOnly = req.query.active === 'true';
    const members = await TeamMember.findAll(activeOnly);
    res.json(members);
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const member = await TeamMember.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Team member not found' });
    }
    res.json(member);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const data = {
      name: req.body.name,
      role: req.body.role,
      description: req.body.description,
      image_url: req.file ? '/uploads/profile/' + req.file.filename : req.body.image_url,
      display_order: req.body.display_order || 0,
      is_active: req.body.is_active !== 'false' && req.body.is_active !== false
    };
    const id = await TeamMember.create(data);
    const member = await TeamMember.findById(id);
    res.status(201).json(member);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.image_url = '/uploads/profile/' + req.file.filename;
    }
    data.is_active = req.body.is_active !== 'false' && req.body.is_active !== false;
    const affected = await TeamMember.update(req.params.id, data);
    if (affected === 0) {
      return res.status(404).json({ message: 'Team member not found' });
    }
    const member = await TeamMember.findById(req.params.id);
    res.json(member);
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const affected = await TeamMember.delete(req.params.id);
    if (affected === 0) {
      return res.status(404).json({ message: 'Team member not found' });
    }
    res.json({ message: 'Team member deleted successfully' });
  } catch (error) {
    next(error);
  }
};
