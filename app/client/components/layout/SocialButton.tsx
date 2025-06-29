'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function SocialButton({ settings }) {
  const [isOpen, setIsOpen] = useState(false)
  const socialLinks = settings?.socialLinks || {}

  const toggleOpen = () => setIsOpen(!isOpen)

  const formatLink = (base, value) => {
    if (!value) return null;
    if (value.startsWith('http')) return value;
    const username = value.split('/').pop();
    return `${base}${username}`;
  };

  const formatWhatsAppLink = (phone) => {
    if (!phone) return null;
    const digitsOnly = phone.replace(/\D/g, '');
    return `https://wa.me/${digitsOnly}`;
  };

  const mainButtonStyle = isOpen
    ? 'w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-500 overflow-hidden bg-white'
    : 'w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-500 overflow-hidden animate-pulse bg-pink-500'

  const socialButtons = [
    {
      name: 'Telegram',
      icon: '/icons/telegram.svg',
      href: formatLink('https://t.me/', socialLinks.telegram),
      style: 'bg-blue-400',
    },
    {
      name: 'VK',
      icon: '/icons/VK.svg',
      href: formatLink('https://vk.com/', socialLinks.vk),
      style: 'bg-blue-600',
    },
    {
      name: 'Instagram',
      icon: '/icons/instagram.svg',
      href: formatLink('https://instagram.com/', socialLinks.instagram),
      style: 'bg-pink-500',
    },
    {
      name: 'WhatsApp',
      icon: '/icons/whatsapp.svg',
      href: formatWhatsAppLink(socialLinks.whatsapp),
      style: 'bg-green-500',
    },
  ]

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <div
        className={`flex flex-col items-end transition-all duration-500 ease-in-out ${
          isOpen ? 'mb-4 space-y-3' : 'h-0 opacity-0'
        }`}
        style={{ visibility: isOpen ? 'visible' : 'hidden' }}
      >
        {socialButtons
          .filter(button => button.href) // Only show buttons with a link
          .map((button, index) => (
            <Link
              key={index}
              href={button.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transform transition-all duration-300 hover:scale-110 ${
                button.style
              } ${
                isOpen
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 -translate-y-4'
              }`}
              style={{ transitionDelay: isOpen ? `${index * 100}ms` : '0ms' }}
            >
              <Image src={button.icon} alt={button.name} width={28} height={28} />
            </Link>
          ))}
      </div>

      <button
        onClick={toggleOpen}
        className={mainButtonStyle}
        aria-label="Toggle Social Links"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" height="28px" viewBox="0 -960 960 960" width="28px" fill="#ffffff">
            <path d="M478-240q21 0 35.5-14.5T528-290q0-21-14.5-35.5T478-340q-21 0-35.5 14.5T428-290q0 21 14.5 35.5T478-240Zm-36-154h74q0-33 7.5-52t42.5-52q26-26 41-49.5t15-56.5q0-56-41-86t-97-30q-57 0-92.5 30T342-618l66 26q5-18 22.5-39t53.5-21q32 0 48 17.5t16 38.5q0 20-12 37.5T506-526q-44 39-54 59t-10 73Zm38 314q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
          </svg>
        )}
      </button>
    </div>
  )
} 