import { FaInstagram, FaFacebook, FaWhatsapp, FaLinkedin, FaEnvelope } from 'react-icons/fa';

const socialLinks = {
  instagram: "https://instagram.com/cyubahiroll",
  facebook: "https://facebook.com/ceehiro",
  gmail: "mailto:cyubahirotech7@gmail.com",
  whatsapp: "https://wa.me/250738988885",
  linkedin: "https://linkedin.com/in/cyubahiroll"
};

const iconMap = {
  instagram: FaInstagram,
  facebook: FaFacebook,
  gmail: FaEnvelope,
  whatsapp: FaWhatsapp,
  linkedin: FaLinkedin
};

const labelMap = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  gmail: 'Email',
  whatsapp: 'WhatsApp',
  linkedin: 'LinkedIn'
};

const brandHoverColors = {
  instagram: 'hover:text-pink-500',
  facebook: 'hover:text-blue-600',
  gmail: 'hover:text-red-500',
  whatsapp: 'hover:text-green-500',
  linkedin: 'hover:text-blue-500'
};

const order = ['instagram', 'facebook', 'gmail', 'whatsapp', 'linkedin'];

function SocialLinks({ className = '', iconSize = 22, spacing = 'gap-4' }) {
  return (
    <div className={`flex flex-wrap items-center ${spacing} ${className}`}>
      {order.map((key) => {
        const Icon = iconMap[key];
        const isMailto = socialLinks[key].startsWith('mailto:');
        return (
          <a
            key={key}
            href={socialLinks[key]}
            {...(!isMailto && { target: '_blank', rel: 'noopener noreferrer' })}
            aria-label={labelMap[key]}
            title={labelMap[key]}
            className={`text-gray-400 dark:text-gray-500 ${brandHoverColors[key]} hover:scale-110 transition-all duration-300`}
          >
            <Icon size={iconSize} />
          </a>
        );
      })}
    </div>
  );
}

export default SocialLinks;
