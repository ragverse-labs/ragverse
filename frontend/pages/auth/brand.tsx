import { FC } from 'react';
import Link from 'next/link';

interface BrandProps {
  theme?: 'dark' | 'light'; // Existing theme prop
  size?: 'small' | 'large'; // New size prop to control image size
}

const Brand: FC<BrandProps> = ({ theme = 'dark', size = 'large' }) => {
  // Define image dimensions based on the size prop
  const dimensions = size === 'small' ? { width: 100, height: 100 } : { width: 200, height: 200 };

  return (
    <Link
      className="flex cursor-pointer flex-col items-center hover:opacity-50"
      href="https://ourvedas.in/landing/index.html"
      target="_blank"
      rel="noopener noreferrer"
    >
      <img
        src="/images/ragverse-logo-white.png"
        width={dimensions.width}
        height={dimensions.height}
        alt="RAGVere"
        // className={`rounded-full ${size === 'small' ? 'w-48 h-48' : 'w-48 h-48'}`} // Optional Tailwind size classes for additional control
      />
    </Link>
  );
};

export default Brand;
