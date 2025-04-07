import { apiAuth } from '@/lib/api';
// import { recoverPassword } from '@/lib/slices/authSlice';
import React, { useState } from 'react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleForgotPassword = async () => {
    try {
      // alert("inside" + email);
      const response = await apiAuth.recoverPassword(email);
      // const response = await fetch('/api/auth/forgot-password', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ email }),
      // });
      console.log(response);
      // const result = await response;
      // console.log(result);
      if (true) {
        setMessage('If that email exists, a recovery link has been sent.');
      } else {
        setMessage('Failed to send recovery email.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="w-full px-3 py-2 border rounded-md"
      />
      <button
        onClick={handleForgotPassword}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-700 hover:bg-teal-800"
      >
        Send Reset Link
      </button>
      {message && <p className="text-sm mt-2">{message}</p>}
    </div>
  );
}
