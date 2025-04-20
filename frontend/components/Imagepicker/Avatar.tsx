import React from 'react';

interface AvatarProps {
  username: string;
  imageUrl?: string; // Optional image URL
  size?: number; // Optional size to standardize avatar dimensions
}

const Avatar: React.FC<AvatarProps> = ({ username, imageUrl, size = 50 }) => {

  const getInitials = (name: string) => {
    // name = "OV"; //to do
    if (!name)
      name = 'OV';

    return name.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const avatarStyle = {
    width: `${size}px`,
    height: `${size}px`,
    lineHeight: `${size}px`,
    borderRadius: '25%',
    fontSize: `${size / 2}px`, // Adjust font size based on the size of the avatar
    color: 'white',
    textAlign: 'center' as 'center' ,
    backgroundColor: '#008080', // A blue background color
    display: 'inline-block',
    verticalAlign: 'middle',
    // horizontalAlign: 'center'
  };

  return (
    <div style={avatarStyle}>
      {imageUrl ? (
        <img src={imageUrl} alt={`Avatar of ${username}`} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
      ) : (
        <span>{getInitials(username)}</span>
      )}
    </div>
  );
};
export default Avatar;
