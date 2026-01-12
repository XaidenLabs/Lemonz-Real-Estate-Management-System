const emailService = require("../services/email.service");

const sendMessage = async (req, res) => {
  const { name, email, subject, message } = req.body;

  try {
    const emailBody = `
            <h1>${name}</h1>
            <p>${email}</p>
            <p>${message}</p>
        `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: "oludefiyinfoluwa06@gmail.com",
      subject: subject || `Message from ${name}`,
      html: emailBody,
    };

    await emailService.sendMail(mailOptions);
    return res.json({ message: "Email sent successfully" });
  } catch (error) {
    return res.json({ error: error.message });
  }
};

module.exports = {
  sendMessage,
};
