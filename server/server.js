// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/VISenquiries', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Enquiry Schema
const enquirySchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
});

const Enquiry = mongoose.model('Enquiry', enquirySchema);

// Enquiry route
app.post('/api/enquiry', async (req, res) => {
  const { name, email, message } = req.body;

  // Validation
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const newEnquiry = new Enquiry({ name, email, message });
  try {
    await newEnquiry.save();

    // Create transporter for nodemailer
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email options for sending to you
    let adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // You can also use an array if you want to send to multiple addresses
      subject: 'New Enquiry Received',
      text: `New enquiry received:\n\nName: ${name}\nEmail: ${email}\nMessage: ${message}`,
    };

    // Email options for sending to the user
    let userMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Enquiry Confirmation',
      text: `Dear ${name},\n\nThank you for your enquiry. We have received your message: "${message}".\n\nBest regards,\nYour Company`,
    };

    // Send email to admin
    transporter.sendMail(adminMailOptions, (error, info) => {
      if (error) {
        console.error('Error sending admin email:', error);
        return res.status(500).json({ error: 'Failed to send email notification' });
      }
      console.log('Admin email sent:', info.response);
    });

    // Send email to user
    transporter.sendMail(userMailOptions, (error, info) => {
      if (error) {
        console.error('Error sending user email:', error);
        return res.status(500).json({ error: 'Failed to send confirmation email' });
      }
      console.log('User email sent:', info.response);
      res.status(201).json({ message: 'Enquiry received and confirmation email sent' });
    });

  } catch (err) {
    console.error('Error processing enquiry:', err);
    res.status(400).json({ error: 'Error processing enquiry' });
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
