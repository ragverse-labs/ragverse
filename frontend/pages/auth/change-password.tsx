import { Dialog } from '../../components/Dialog/Dialog';
// import { NextApiRequest, NextApiResponse } from 'next';
// import { getCsrfToken, getSession } from 'next-auth/react';
import React, { FC, useEffect, useRef, useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const ChangePassword: FC<Props> = ({ open, onClose }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleChangePassword = async () => {
    const response = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    });

    const data = await response.json();
    setMessage(data.message);
  };

  return (
    <Dialog open={open} onClose={onClose}>
            <div className="text-lg pb-4 font-bold text-black dark:text-neutral-200">
        {('Change Password')}
      </div>
      
     
        <form onSubmit={(e) => { e.preventDefault(); handleChangePassword(); }}>
          <div>
          <div className="text-mg pb-4  text-black dark:text-neutral-200">
           {('Old Password')}
          </div>

            <input
              id="oldPassword"
              className="ml-2 h-[20px] flex-1 overflow-hidden overflow-ellipsis border-b border-neutral-400 bg-transparent pr-1 text-[12.5px] leading-3 text-left text-white outline-none focus:border-neutral-100"
              type="password"
              placeholder="Old Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>
          <div>
          <div className="text-mg pb-4  text-black dark:text-neutral-200">
           {('New Password')}
          </div>
            <input
            className="ml-2 h-[20px] flex-1 overflow-hidden overflow-ellipsis border-b border-neutral-400 bg-transparent pr-1 text-[12.5px] leading-3 text-left text-white outline-none focus:border-neutral-100"
              id="newPassword"
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <button className="w-full px-4 py-2 mt-6 border rounded-lg shadow border-neutral-500 text-neutral-900 hover:bg-neutral-100 focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-300" type="submit">Change Password</button>
        </form>
        {message && <p>{message}</p>}

    </Dialog>
  );
};

export default ChangePassword;

