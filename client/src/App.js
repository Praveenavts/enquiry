// src/App.js
import React, { useState } from 'react';
import './App.css';

import axios from 'axios';

function App() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const enquiry = { name, email, message };

    try {
      await axios.post('http://localhost:5000/api/enquiry', enquiry);
      alert('Enquiry submitted and confirmation email sent');
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      console.error('There was an error submitting the enquiry!', error);
    }
  };

  return (
    <div className="App">
      <h1>Enquiry Form</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Message:</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} required />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default App;
