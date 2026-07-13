const Certificate = require('../models/Certificate');
const { generateCertificatePDF } = require('../utils/generateCertificate');
const { sendCertificateEmail } = require('../utils/sendEmail');
const crypto = require('crypto');

exports.getMyCertificates = async (req, res, next) => {
  try {
    const certificates = await Certificate.findByUser(req.user.id);
    res.json(certificates);
  } catch (error) {
    next(error);
  }
};

exports.getAllCertificates = async (req, res, next) => {
  try {
    const certificates = await Certificate.findAll();
    res.json(certificates);
  } catch (error) {
    next(error);
  }
};

exports.issueCertificate = async (req, res, next) => {
  try {
    const { user_id, exam_id, title } = req.body;
    const certificateNumber = 'RRC-' + crypto.randomBytes(4).toString('hex').toUpperCase();

    const certificateData = {
      user_id,
      exam_id: exam_id || null,
      certificate_number: certificateNumber,
      title: title || 'Road Rules Certificate',
      issue_date: new Date().toISOString().split('T')[0],
      expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    const id = await Certificate.create(certificateData);

    try {
      const { user } = req.body;
      const { filePath, fileName } = await generateCertificatePDF(
        { full_name: req.body.full_name || 'Student' },
        { title: certificateData.title, score: req.body.score || 0, total_questions: req.body.total_questions || 0 },
        certificateNumber
      );
      await Certificate.update(id, { file_url: `/uploads/certificates/${fileName}` });
    } catch (pdfError) {
      console.error('PDF generation failed:', pdfError.message);
    }

    const certificate = await Certificate.findById(id);
    res.status(201).json(certificate);
  } catch (error) {
    next(error);
  }
};

exports.verifyCertificate = async (req, res, next) => {
  try {
    const certificate = await Certificate.findByCertificateNumber(req.params.number);
    if (!certificate) {
      return res.status(404).json({ valid: false, message: 'Certificate not found' });
    }
    res.json({
      valid: true,
      certificate: {
        certificate_number: certificate.certificate_number,
        title: certificate.title,
        issue_date: certificate.issue_date,
        expiry_date: certificate.expiry_date
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteCertificate = async (req, res, next) => {
  try {
    const affected = await Certificate.delete(req.params.id);
    if (affected === 0) {
      return res.status(404).json({ message: 'Certificate not found' });
    }
    res.json({ message: 'Certificate deleted' });
  } catch (error) {
    next(error);
  }
};
