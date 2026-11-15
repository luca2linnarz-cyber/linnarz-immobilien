import Image from 'next/image';

export default function Portrait({ contact = false }: { contact?: boolean }) {
  return <div className={`portrait-frame portrait-original${contact ? ' contact-portrait-original' : ''}`}>
    <Image src={contact ? "/images/luca-contact.webp" : "/images/luca-portrait.webp"} alt="Luca Linnarz" width={1400} height={contact ? 2067 : 1233} sizes={contact ? '(max-width: 800px) 90vw, 440px' : '(max-width: 600px) 38vw, (max-width: 900px) 320px, 22vw'} priority />
  </div>;
}
