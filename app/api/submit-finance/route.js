import nodemailer from 'nodemailer';

/**
 * POST /api/submit-finance
 * Submits finance application and sends email notification with file attachments
 */
export async function POST(request) {
  try {
    const formDataRaw = await request.formData();
    
    // Extract form fields and files
    const formData = {};
    const attachments = [];
    
    for (const [key, value] of formDataRaw.entries()) {
      if (value instanceof File) {
        // Handle file uploads
        const buffer = await value.arrayBuffer();
        attachments.push({
          filename: value.name,
          content: Buffer.from(buffer),
          contentType: value.type,
        });
      } else {
        // Handle form fields
        formData[key] = value;
      }
    }

    // Validate form data
    if (!formData.email || !formData.firstName || !formData.lastName) {
      return Response.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Create transporter for Gmail
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Format form data for email
    const emailContent = generateEmailContent(formData);

    // Send email to admin with attachments
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject: `New Finance Application - ${formData.firstName} ${formData.lastName}`,
      html: emailContent.admin,
      text: emailContent.adminText,
      attachments: attachments,
    });

    return Response.json(
      {
        success: true,
        message: 'Application submitted successfully. Please check your email for confirmation.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error submitting finance application:', error);
    return Response.json(
      {
        success: false,
        message: 'An error occurred while processing your application. Please try again later.',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

function generateEmailContent(data) {
  const customerEmail = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Be Vietnam Pro', 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f5f5f5;
        }
        .wrapper {
          width: 100%;
          background-color: #f5f5f5;
          padding: 20px 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #fff;
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #002470 0%, #00173f 100%);
          color: #ffffff;
          padding: 40px 20px;
          text-align: center;
          border-bottom: 4px solid #D62828;
        }
        .header h1 {
          margin: 0 0 10px 0;
          font-size: 32px;
          font-weight: 900;
          letter-spacing: 1px;
        }
        .header p {
          margin: 0;
          font-size: 14px;
          font-weight: 500;
          opacity: 0.95;
        }
        .content {
          padding: 40px 20px;
        }
        @media (min-width: 600px) {
          .header {
            padding: 50px 40px;
          }
          .header h1 {
            font-size: 36px;
          }
          .content {
            padding: 40px 40px;
          }
        }
        .section {
          margin-bottom: 30px;
          border-radius: 8px;
          background-color: #f9f9f9;
          padding: 20px;
        }
        .section h2 {
          color: #002470;
          font-size: 16px;
          font-weight: 900;
          border-bottom: 3px solid #002470;
          padding-bottom: 12px;
          margin-bottom: 15px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        @media (min-width: 600px) {
          .section h2 {
            font-size: 18px;
          }
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #e0e0e0;
          font-size: 14px;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          font-weight: 600;
          color: #666;
        }
        .detail-value {
          text-align: right;
          color: #333;
          font-weight: 500;
        }
        @media (min-width: 600px) {
          .detail-row {
            font-size: 15px;
          }
        }
        .footer {
          background: linear-gradient(135deg, #f9f9f9 0%, #f0f0f0 100%);
          padding: 30px 20px;
          border-top: 3px solid #002470;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        .footer p {
          margin: 5px 0;
        }
        .footer-contact {
          color: #002470;
          font-weight: 600;
          margin-top: 15px;
        }
        @media (min-width: 600px) {
          .footer {
            padding: 40px 40px;
            font-size: 13px;
          }
        }
        .button {
          display: inline-block;
          background-color: #D62828;
          color: #fff;
          padding: 14px 32px;
          text-decoration: none;
          border-radius: 6px;
          margin-top: 20px;
          font-weight: bold;
          font-size: 14px;
          transition: background-color 0.3s;
        }
        .button:hover {
          background-color: #b81f1f;
        }
        .alert {
          background-color: #e8f4f8;
          border-left: 4px solid #002470;
          color: #00173f;
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 20px;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <h1>Best Drive Motors</h1>
            <p>Finance Application Confirmation</p>
          </div>
          <div class="content">
            <div class="alert">
              <strong>Thank you!</strong> We have received your finance application. Our team will review it shortly.
            </div>
          <p>Finance Application Confirmation</p>
        </div>

        <div class="content">
          <p>Hi ${data.firstName},</p>

          <p>Thank you for submitting your finance application with Best Drive Motors. We have received your details and will review your application shortly.</p>

          <p>Below is a summary of the information you provided:</p>

          <div class="section">
            <h2>Personal Information</h2>
            <div class="detail-row">
              <span class="detail-label">Full Name:</span>
              <span class="detail-value">${data.firstName} ${data.middleName ? data.middleName + ' ' : ''}${data.lastName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date of Birth:</span>
              <span class="detail-value">${formatDate(data.dateOfBirth)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Driver License:</span>
              <span class="detail-value">${data.driverLicenceNumber}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Email:</span>
              <span class="detail-value">${data.email}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Phone:</span>
              <span class="detail-value">${data.phone}</span>
            </div>
          </div>

          <div class="section">
            <h2>Residential Information</h2>
            <div class="detail-row">
              <span class="detail-label">Address:</span>
              <span class="detail-value">${data.currentAddress}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Suburb:</span>
              <span class="detail-value">${data.suburb}, ${data.postcode}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Residential Status:</span>
              <span class="detail-value">${capitalizeFirstLetter(data.residentialStatus)}</span>
            </div>
          </div>

          <div class="section">
            <h2>Employment Information</h2>
            <div class="detail-row">
              <span class="detail-label">Status:</span>
              <span class="detail-value">${capitalizeFirstLetter(data.employmentStatus)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Employer:</span>
              <span class="detail-value">${data.employerName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Occupation:</span>
              <span class="detail-value">${data.occupation}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Time at Employment:</span>
              <span class="detail-value">${data.yearsAtEmployment} years ${data.monthsAtEmployment} months</span>
            </div>
          </div>

          <div class="section">
            <h2>Financial Information</h2>
            <div class="detail-row">
              <span class="detail-label">Annual Income:</span>
              <span class="detail-value">$${parseFloat(data.income).toFixed(2)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Pay Frequency:</span>
              <span class="detail-value">${capitalizeFirstLetter(data.payFrequency)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Dependents:</span>
              <span class="detail-value">${data.dependents}</span>
            </div>
          </div>

          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            <strong>What happens next?</strong><br>
            Our team will review your application and will contact you within 24 hours to discuss your finance options. If you have any questions in the meantime, please don't hesitate to contact us.
          </p>

          <p style="color: #666; font-size: 14px;">
            <strong>Contact Us:</strong><br>
            Phone: 0800 BEST DRIVE<br>
            Email: sales@bestdrive.co.nz<br>
            Hours: Mon-Fri 8:30am-5:30pm, Sat 9:00am-5:00pm
          </p>
        </div>

        <div class="footer">
          <p>&copy; 2025 Best Drive Motors. All rights reserved.</p>
          <p>This is an automated email. Please do not reply directly to this email.</p>          <div class=\"footer-contact\">0800 BEST DRIVE</div>
        </div>        </div>
      </div>
    </body>
    </html>
  `;

  const customerText = `
Best Drive Motors - Finance Application Confirmation

Hi ${data.firstName},

Thank you for submitting your finance application with Best Drive Motors. We have received your details and will review your application shortly.

Personal Information:
- Full Name: ${data.firstName} ${data.middleName ? data.middleName + ' ' : ''}${data.lastName}
- Email: ${data.email}
- Phone: ${data.phone}

Residential Information:
- Address: ${data.currentAddress}, ${data.suburb} ${data.postcode}
- Status: ${capitalizeFirstLetter(data.residentialStatus)}

Employment Information:
- Status: ${capitalizeFirstLetter(data.employmentStatus)}
- Employer: ${data.employerName}
- Occupation: ${data.occupation}
- Time at Employment: ${data.yearsAtEmployment} years ${data.monthsAtEmployment} months

Financial Information:
- Annual Income: $${parseFloat(data.income).toFixed(2)}

Our team will review your application and will contact you within 24 hours.

Contact: 0800 BEST DRIVE
  `;

  const adminEmail = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: 'Be Vietnam Pro', 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #fff;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #002470 0%, #00173f 100%);
          color: #ffffff;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 900;
        }
        .content {
          padding: 30px;
        }
        .section {
          margin-bottom: 30px;
        }
        .section h2 {
          color: #002470;
          font-size: 18px;
          border-bottom: 2px solid #002470;
          padding-bottom: 10px;
          margin-bottom: 15px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        .detail-label {
          font-weight: bold;
          color: #666;
        }
        .detail-value {
          text-align: right;
          color: #333;
        }
        .footer {
          background-color: #f9f9f9;
          padding: 20px 30px;
          border-top: 1px solid #eee;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        .alert {
          background-color: #fff3cd;
          border: 1px solid #ffc107;
          color: #856404;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Best Drive Motors</h1>
          <p>New Finance Application</p>
        </div>

        <div class="content">
          <div class="alert">
            <strong>New Application Received!</strong> Review and follow up required.
          </div>

          <div class="section">
            <h2>Personal Information</h2>
            <div class="detail-row">
              <span class="detail-label">Full Name:</span>
              <span class="detail-value">${data.firstName} ${data.middleName ? data.middleName + ' ' : ''}${data.lastName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date of Birth:</span>
              <span class="detail-value">${formatDate(data.dateOfBirth)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Marital Status:</span>
              <span class="detail-value">${capitalizeFirstLetter(data.maritalStatus)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Driver License:</span>
              <span class="detail-value">${data.driverLicenceNumber} (v${data.versionNumber})</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Email:</span>
              <span class="detail-value">${data.email}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Phone:</span>
              <span class="detail-value">${data.phone}</span>
            </div>
          </div>

          <div class="section">
            <h2>Residential Information</h2>
            <div class="detail-row">
              <span class="detail-label">Address:</span>
              <span class="detail-value">${data.currentAddress}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Suburb:</span>
              <span class="detail-value">${data.suburb}, ${data.postcode}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Status:</span>
              <span class="detail-value">${capitalizeFirstLetter(data.residentialStatus)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Time at Address:</span>
              <span class="detail-value">${data.yearsAtAddress} years ${data.monthsAtAddress} months</span>
            </div>
          </div>

          <div class="section">
            <h2>Employment Information</h2>
            <div class="detail-row">
              <span class="detail-label">Status:</span>
              <span class="detail-value">${capitalizeFirstLetter(data.employmentStatus)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Employer:</span>
              <span class="detail-value">${data.employerName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Occupation:</span>
              <span class="detail-value">${data.occupation}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Time at Employment:</span>
              <span class="detail-value">${data.yearsAtEmployment} years ${data.monthsAtEmployment} months</span>
            </div>
          </div>

          <div class="section">
            <h2>Financial Information</h2>
            <div class="detail-row">
              <span class="detail-label">Income (After Tax):</span>
              <span class="detail-value">$${parseFloat(data.income).toFixed(2)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Pay Frequency:</span>
              <span class="detail-value">${capitalizeFirstLetter(data.payFrequency)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Dependents:</span>
              <span class="detail-value">${data.dependents}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Rent/Mortgage (Weekly):</span>
              <span class="detail-value">$${parseFloat(data.rentMortgage).toFixed(2)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Other Loans (Weekly):</span>
              <span class="detail-value">$${parseFloat(data.otherLoans).toFixed(2)}</span>
            </div>
          </div>

          <div class="section">
            <h2>Consents</h2>
            <div class="detail-row">
              <span class="detail-label">Terms & Conditions:</span>
              <span class="detail-value">${data.termsConsent ? '✓ Accepted' : '✗ Not Accepted'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Privacy Policy:</span>
              <span class="detail-value">${data.privacyConsent ? '✓ Accepted' : '✗ Not Accepted'}</span>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>&copy; 2025 Best Drive Motors. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const adminText = `
Best Drive Motors - New Finance Application

New application received from: ${data.firstName} ${data.lastName}

PERSONAL INFORMATION:
- Full Name: ${data.firstName} ${data.middleName ? data.middleName + ' ' : ''}${data.lastName}
- Date of Birth: ${formatDate(data.dateOfBirth)}
- Marital Status: ${capitalizeFirstLetter(data.maritalStatus)}
- Driver License: ${data.driverLicenceNumber} (v${data.versionNumber})
- Email: ${data.email}
- Phone: ${data.phone}

RESIDENTIAL INFORMATION:
- Address: ${data.currentAddress}, ${data.suburb} ${data.postcode}
- Status: ${capitalizeFirstLetter(data.residentialStatus)}
- Time at Address: ${data.yearsAtAddress} years ${data.monthsAtAddress} months

EMPLOYMENT INFORMATION:
- Status: ${capitalizeFirstLetter(data.employmentStatus)}
- Employer: ${data.employerName}
- Occupation: ${data.occupation}
- Time at Employment: ${data.yearsAtEmployment} years ${data.monthsAtEmployment} months

FINANCIAL INFORMATION:
- Income (After Tax): $${parseFloat(data.income).toFixed(2)}
- Pay Frequency: ${capitalizeFirstLetter(data.payFrequency)}
- Dependents: ${data.dependents}
- Rent/Mortgage (Weekly): $${parseFloat(data.rentMortgage).toFixed(2)}
- Other Loans (Weekly): $${parseFloat(data.otherLoans).toFixed(2)}

Consents:
- Terms & Conditions: ${data.termsConsent ? 'Accepted' : 'Not Accepted'}
- Privacy Policy: ${data.privacyConsent ? 'Accepted' : 'Not Accepted'}
  `;

  return {
    customer: customerEmail,
    customerText,
    admin: adminEmail,
    adminText,
  };
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-NZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function capitalizeFirstLetter(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/([a-z])([A-Z])/g, '$1 $2');
}
