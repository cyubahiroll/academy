const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateCertificatePDF = (userData, examData, certificateNumber) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      layout: 'landscape',
      size: 'A4',
      info: {
        Title: `Road Rules Certificate - ${userData.full_name}`,
        Author: 'Road Rules Academy'
      }
    });

    const fileName = `certificate_${certificateNumber}.pdf`;
    const filePath = path.join(__dirname, '../uploads/certificates', fileName);
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    const width = doc.page.width;
    const height = doc.page.height;

    doc.rect(0, 0, width, height).fill('#f4f4f4');

    doc.rect(20, 20, width - 40, height - 40).lineWidth(3).stroke('#1a365d');

    doc.rect(30, 30, width - 60, height - 60).lineWidth(1).stroke('#2d3748');

    doc.fontSize(36).font('Helvetica-Bold').fillColor('#1a365d')
       .text('CERTIFICATE OF COMPLETION', 0, 80, { align: 'center' });

    doc.moveTo(200, 130).lineTo(width - 200, 130).lineWidth(2).stroke('#c53030');

    doc.fontSize(14).font('Helvetica').fillColor('#4a5568')
       .text('This is to certify that', 0, 160, { align: 'center' });

    doc.fontSize(32).font('Helvetica-Bold').fillColor('#2d3748')
       .text(userData.full_name, 0, 190, { align: 'center' });

    doc.fontSize(14).font('Helvetica').fillColor('#4a5568')
       .text('has successfully completed the', 0, 240, { align: 'center' });

    doc.fontSize(20).font('Helvetica-Bold').fillColor('#1a365d')
       .text(examData.title, 0, 270, { align: 'center' });

    doc.fontSize(12).font('Helvetica').fillColor('#4a5568')
       .text(`Score: ${examData.score}% | ${examData.total_questions} Questions`, 0, 310, { align: 'center' });

    doc.fontSize(10).font('Helvetica').fillColor('#718096')
       .text(`Certificate Number: ${certificateNumber}`, 0, 370, { align: 'center' })
       .text(`Issue Date: ${new Date().toLocaleDateString()}`, 0, 390, { align: 'center' })
       .text(`Expiry Date: ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()}`, 0, 410, { align: 'center' });

    doc.fontSize(8).font('Helvetica').fillColor('#a0aec0')
       .text('Road Rules Academy', 0, height - 60, { align: 'center' })
       .text('This certificate verifies the holder has demonstrated knowledge of road traffic rules.', 0, height - 45, { align: 'center' });

    doc.end();

    stream.on('finish', () => resolve({ filePath, fileName }));
    stream.on('error', reject);
  });
};

module.exports = { generateCertificatePDF };
