const Document = require('../models/Document');
const Subscription = require('../models/Subscription');
const ReadingHistory = require('../models/ReadingHistory');
const path = require('path');
const fs = require('fs');
const mammoth = require('mammoth');
const WordExtractor = require('word-extractor');

exports.getAllDocuments = async (req, res, next) => {
  try {
    const isFree = req.query.is_free !== undefined ? req.query.is_free === 'true' : null;
    const docs = await Document.findAll(isFree);
    res.json(docs);
  } catch (error) {
    next(error);
  }
};

exports.getDocument = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.json(doc);
  } catch (error) {
    next(error);
  }
};

const SOFFICE = 'C:\\Program Files\\LibreOffice\\program\\soffice.exe';
const USE_SOFFICE = fs.existsSync(SOFFICE);
const convertedDir = path.join(__dirname, '..', 'uploads', 'converted');
if (USE_SOFFICE && !fs.existsSync(convertedDir)) fs.mkdirSync(convertedDir, { recursive: true });

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

async function checkDocumentAccess(doc, userId) {
  if (doc.is_free) return true;
  const sub = await Subscription.findActiveByUser(userId);
  if (sub) return true;
  const db = require('../config/db');
  const [purchases] = await db.query(
    'SELECT id FROM document_purchases WHERE user_id = ? AND document_id = ? AND status = ?',
    [userId, doc.id, 'completed']
  );
  if (purchases.length > 0) return true;
  const [bookPurchases] = await db.query(
    'SELECT id FROM purchased_books WHERE user_id = ? AND book_id = ?',
    [userId, doc.id]
  );
  return bookPurchases.length > 0;
}

exports.readDocument = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (!await checkDocumentAccess(doc, req.user.id)) {
      return res.status(403).json({ message: 'Please purchase this document to read' });
    }

    const filePath = path.join(__dirname, '..', doc.file_url.replace(/^\//, ''));

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    const ext = path.extname(doc.file_url).toLowerCase();

    if (ext === '.pdf') {
      return res.json({ type: 'pdf' });
    }

    if (ext === '.doc' || ext === '.docx') {
      try {
        const result = await mammoth.convertToHtml({ path: filePath }, {
          convertImage: mammoth.images.imgElement(function (image) {
            return image.read('base64').then(function (imageBuffer) {
              return { src: 'data:' + image.contentType + ';base64,' + imageBuffer };
            });
          })
        });
        return res.json({ type: 'html', content: result.value });
      } catch (_) { }

      if (USE_SOFFICE) {
        if (!fs.existsSync(convertedDir)) fs.mkdirSync(convertedDir, { recursive: true });
        const srcExt = ext;
        const pdfFilename = path.basename(doc.file_url, srcExt) + '.pdf';
        const pdfPath = path.join(convertedDir, pdfFilename);
        if (!fs.existsSync(pdfPath)) {
          const { execSync } = require('child_process');
          execSync(`"${SOFFICE}" --headless --convert-to pdf --outdir "${convertedDir}" "${filePath}"`, { timeout: 120000 });
        }
        return res.json({ type: 'pdf' });
      }

      if (ext === '.doc') {
        const extractor = new WordExtractor();
        const extracted = await extractor.extract(filePath);
        const text = extracted.getBody();
        return res.json({ type: 'text', content: escapeHtml(text) });
      }

      return res.json({ type: 'unsupported', message: 'Could not read this document format' });
    }

    if (ext === '.txt') {
      const content = fs.readFileSync(filePath, 'utf-8');
      return res.json({ type: 'text', content: escapeHtml(content) });
    }

    return res.json({ type: 'unsupported', message: 'File format not supported for inline reading' });
  } catch (error) {
    next(error);
  }
};

exports.serveReadFile = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    if (!await checkDocumentAccess(doc, req.user.id)) {
      return res.status(403).json({ message: 'Please purchase this document to read' });
    }

    const ext = path.extname(doc.file_url).toLowerCase();
    let filePath = path.join(__dirname, '..', doc.file_url.replace(/^\//, ''));

    if (ext === '.doc' || ext === '.docx') {
      const pdfFilename = path.basename(doc.file_url, ext) + '.pdf';
      const pdfPath = path.join(convertedDir, pdfFilename);
      if (fs.existsSync(pdfPath)) {
        filePath = pdfPath;
      }
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    const finalExt = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain'
    };

    res.setHeader('Content-Type', mimeTypes[finalExt] || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${path.basename(filePath)}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'public, max-age=3600');

    const stream = fs.createReadStream(filePath);
    stream.on('error', (err) => {
      console.error('[Library] Read stream error:', err.message);
      if (!res.headersSent) res.status(500).end();
    });
    stream.pipe(res);
  } catch (error) {
    next(error);
  }
};

exports.saveReadingProgress = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Book not found' });

    const { current_page, total_pages } = req.body;
    const progress = total_pages > 0 ? Math.round((current_page / total_pages) * 10000) / 100 : 0;

    await ReadingHistory.upsert({
      user_id: req.user.id,
      book_id: parseInt(req.params.id),
      current_page: current_page || 1,
      total_pages: total_pages || 1,
      progress
    });

    res.json({ message: 'Progress saved', current_page, total_pages, progress });
  } catch (error) {
    next(error);
  }
};

exports.getReadingProgress = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Book not found' });

    const history = await ReadingHistory.findByUserAndBook(req.user.id, req.params.id);
    if (!history) {
      return res.json({ current_page: 1, total_pages: 1, progress: 0 });
    }

    res.json({
      current_page: history.current_page,
      total_pages: history.total_pages,
      progress: history.progress,
      last_read_at: history.last_read_at
    });
  } catch (error) {
    next(error);
  }
};

exports.checkAccess = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    if (doc.is_free) {
      return res.json({ hasAccess: true, isFree: true });
    }

    const sub = await Subscription.findActiveByUser(req.user.id);
    if (sub) {
      return res.json({ hasAccess: true, isFree: false, subscription: true });
    }

    const db = require('../config/db');
    const [purchases] = await db.query(
      'SELECT id FROM document_purchases WHERE user_id = ? AND document_id = ? AND status = ?',
      [req.user.id, req.params.id, 'completed']
    );
    if (purchases.length > 0) {
      return res.json({ hasAccess: true, isFree: false, purchased: true });
    }

    const [bookPurchases] = await db.query(
      'SELECT id FROM purchased_books WHERE user_id = ? AND book_id = ?',
      [req.user.id, req.params.id]
    );
    if (bookPurchases.length > 0) {
      return res.json({ hasAccess: true, isFree: false, purchased: true, viaBookPayment: true });
    }

    res.json({ hasAccess: false, isFree: false, price: 3000, currency: 'RWF' });
  } catch (error) {
    next(error);
  }
};

exports.purchaseDocument = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    if (doc.is_free) {
      return res.status(400).json({ message: 'This document is free' });
    }

    const sub = await Subscription.findActiveByUser(req.user.id);
    if (sub) {
      return res.json({ message: 'You already have access via subscription', access: true });
    }

    const db = require('../config/db');
    const [existing] = await db.query(
      'SELECT id FROM document_purchases WHERE user_id = ? AND document_id = ? AND status = ?',
      [req.user.id, req.params.id, 'completed']
    );
    if (existing.length > 0) {
      return res.json({ message: 'You already own this document', access: true });
    }

    const { phone_number, country_code, payment_method, transaction_reference } = req.body;

    if (!phone_number || !payment_method || !transaction_reference) {
      return res.status(400).json({ message: 'Phone number, payment method, and transaction reference are required' });
    }

    const fullPhone = `${country_code || '+250'}${phone_number}`;

    await db.query(
      'INSERT INTO document_purchases (user_id, phone_number, document_id, amount, currency, transaction_id, payment_method, status) VALUES (?, ?, ?, 3000, ?, ?, ?, ?)',
      [req.user.id, fullPhone, req.params.id, 'RWF', transaction_reference, payment_method, 'completed']
    );

    res.json({ message: 'Download unlocked! Thank you for your payment.', access: true, transactionId: transaction_reference });
  } catch (error) {
    next(error);
  }
};

exports.verifyBookPayment = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    const db = require('../config/db');
    const [payments] = await db.query(
      'SELECT id, status FROM document_purchases WHERE user_id = ? AND document_id = ? AND transaction_id = ?',
      [req.user.id, req.params.id, req.body.transaction_reference]
    );

    if (payments.length === 0) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    const payment = payments[0];

    if (payment.status === 'completed') {
      return res.json({ verified: true, message: 'Payment already verified', access: true });
    }

    await db.query(
      'UPDATE document_purchases SET status = ? WHERE id = ?',
      ['completed', payment.id]
    );

    res.json({ verified: true, message: 'Payment verified successfully', access: true });
  } catch (error) {
    next(error);
  }
};

exports.serveDocumentFile = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    if (!doc.is_free) {
      const sub = await Subscription.findActiveByUser(req.user.id);
      const db = require('../config/db');
      const [purchases] = await db.query(
        'SELECT id FROM document_purchases WHERE user_id = ? AND document_id = ? AND status = ?',
        [req.user.id, req.params.id, 'completed']
      );
      const [bookPurchases] = await db.query(
        'SELECT id FROM purchased_books WHERE user_id = ? AND book_id = ?',
        [req.user.id, req.params.id]
      );
      if (!sub && purchases.length === 0 && bookPurchases.length === 0) {
        return res.status(403).json({ message: 'Please purchase this document to read' });
      }
    }

    const filePath = path.join(__dirname, '..', doc.file_url.replace(/^\//, ''));
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    const ext = path.extname(doc.file_url).toLowerCase();
    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain'
    };

    res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${path.basename(doc.file_url)}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');

    const stream = fs.createReadStream(filePath);
    stream.on('error', (err) => {
      console.error('[Library] Document stream error:', err.message);
      if (!res.headersSent) res.status(500).end();
    });
    stream.pipe(res);
  } catch (error) {
    next(error);
  }
};

exports.downloadDocument = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    if (!doc.is_free) {
      const sub = await Subscription.findActiveByUser(req.user.id);
      const db = require('../config/db');
      const [purchases] = await db.query(
        'SELECT id FROM document_purchases WHERE user_id = ? AND document_id = ? AND status = ?',
        [req.user.id, req.params.id, 'completed']
      );
      const [bookPurchases] = await db.query(
        'SELECT id FROM purchased_books WHERE user_id = ? AND book_id = ?',
        [req.user.id, req.params.id]
      );
      if (!sub && purchases.length === 0 && bookPurchases.length === 0) {
        return res.status(403).json({ message: 'Please purchase this document to download' });
      }
    }

    const filePath = path.join(__dirname, '..', doc.file_url.replace(/^\//, ''));
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    await Document.incrementDownloads(req.params.id);

    const filename = path.basename(doc.file_url);
    res.download(filePath, filename);
  } catch (error) {
    next(error);
  }
};

exports.createDocument = async (req, res, next) => {
  try {
    const data = {
      title: req.body.title,
      description: req.body.description,
      file_url: req.file ? '/uploads/documents/' + req.file.filename : req.body.file_url,
      file_type: req.file ? req.file.mimetype : req.body.file_type,
      category_id: req.body.category_id || null,
      is_free: req.body.is_free === 'true' || req.body.is_free === true
    };
    const id = await Document.create(data);
    const doc = await Document.findById(id);
    res.status(201).json(doc);
  } catch (error) {
    next(error);
  }
};

exports.updateDocument = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.file_url = '/uploads/documents/' + req.file.filename;
      data.file_type = req.file.mimetype;
    }
    const affected = await Document.update(req.params.id, data);
    if (affected === 0) {
      return res.status(404).json({ message: 'Document not found' });
    }
    const doc = await Document.findById(req.params.id);
    res.json(doc);
  } catch (error) {
    next(error);
  }
};

exports.deleteDocument = async (req, res, next) => {
  try {
    const affected = await Document.delete(req.params.id);
    if (affected === 0) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    next(error);
  }
};
