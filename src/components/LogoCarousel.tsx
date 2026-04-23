import { motion } from 'motion/react';

// Array of logo paths from the public directory
const logos = [
  "Logo1.png", "Logo2.png", "Logo3.png", "logo4.png", "Logo5.png",
  "Logo6.svg", "Logo7.png", "logo8.svg", "Logo9.png", "Logo10.png",
  "Logo11.png", "logo12.png", "Logo13.png", "Logo14.png", "Logo15.png",
  "Logo16.png", "logo17.png", "logo18.png", "Logo19.png", "logo20.png",
  "Logo21.png", "Logo22.png", "logo23.svg", "Logo24.svg", "Logo25.png",
  "Logo26.png", "logo27.svg", "Logo28.png", "Logo29.png", "Logo30.png",
  "logo31.png", "Logo32.svg", "Logo33.jpg", "Logo34.svg", "Logo35.png",
  "Logo36.png", "logo37.png", "logo38.png", "logo39.svg", "Logo40.png",
  "logo41.png", "logo42.png", "logo43.png", "logo44.png", "logo45.png"
].map(filename => `/${filename}`);

export default function LogoCarousel() {
  return (
    <div className="overflow-hidden py-10">
      <motion.div
        className="flex w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, duration: 200, ease: "linear" }}
      >
        {/* Set 1 */}
        {logos.map((logo, i) => (
          <div key={`set1-${i}`} className="px-5 shrink-0 flex items-center justify-center">
            <img 
              src={logo} 
              alt={`Scientific Dental Society Logo ${i + 1}`} 
              className="h-16 w-auto object-contain" 
              width="100" 
              height="64"
              loading="lazy"
              decoding="async"
            />
          </div>
        ))}
        {/* Set 2 */}
        {logos.map((logo, i) => (
          <div key={`set2-${i}`} className="px-5 shrink-0 flex items-center justify-center">
            <img 
              src={logo} 
              alt={`Scientific Dental Society Logo ${i + 1}`} 
              className="h-16 w-auto object-contain" 
              width="100" 
              height="64"
              loading="lazy"
              decoding="async"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
