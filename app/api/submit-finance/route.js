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

  const adminText = `
Best Drive Motors - New Finance Application

New application received from: ${data.firstName} ${data.lastName}

PERSONAL INFORMATION:
- Full Name: ${data.firstName} ${data.middleName ? data.middleName + ' ' : ''}${data.lastName}
- Date of Birth: ${formatDate(data.dateOfBirth)}
- Marital Status: ${capitalizeFirstLetter(data.maritalStatus)}
- Driver License Type: ${capitalizeFirstLetter(data.driverLicenceType)}
- Driver License: ${data.driverLicenceNumber} (v${data.versionNumber})
- License Expiry: ${formatDate(data.licenceExpiry)}
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
