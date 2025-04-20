import { IconBrandWhatsapp } from '@tabler/icons-react';

interface WhatsAppShareProps {
  shareText?: string;
  shareUrl: string;
}

const WhatsAppShare: React.FC<WhatsAppShareProps> = ({ shareText = "Check out this conversation:", shareUrl }) => {
  const isDesktop = typeof window !== "undefined" && window.innerWidth > 768;
  const whatsappBaseUrl = isDesktop ? "https://web.whatsapp.com/send" : "https://wa.me";
  const whatsappLink = `${whatsappBaseUrl}?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;

  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center text-blue-100 hover:text-blue-200 transition-colors duration-200"
    >
      <IconBrandWhatsapp size={20} className="mr-2" />
      Share Conversations
    </a>
  );
};

export default WhatsAppShare;
