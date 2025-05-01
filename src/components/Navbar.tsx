// import React, { useState } from 'react'
// import Link from 'next/link'
// import Image from 'next/image'

// export default function Navbar() {
//   const [isMenuOpen, setIsMenuOpen] = useState(false)

//   return (
//     <nav className="bg-white shadow-md sticky top-0 z-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between h-20">
          // <div className="flex-shrink-0 flex items-center">
          //   <Link href="/" className="flex items-center">
          //     <Image
          //       src="/images/logo.jpg"
          //       alt="Elim Christian Garden Int Logo"
          //       width={60}
          //       height={60}
          //       className="h-12 w-auto"
          //     />
          //     <span className="ml-2 text-xl font-bold text-green-700">Elim Christian Garden Int</span>
          //   </Link>
          // </div>
          
//           {/* Desktop menu */}
//           <div className="hidden md:flex items-center space-x-8">
//             <Link href="/" className="text-blue-600 hover:text-gold-500 font-medium">
//               Home
//             </Link>
//             <Link href="/about" className="text-blue-600 hover:text-gold-500 font-medium">
//               About
//             </Link>
//             <Link href="/sermons" className="text-blue-600 hover:text-gold-500 font-medium">
//               Sermons
//             </Link>
//             <Link href="#contact" className="text-blue-600 hover:text-gold-500 font-medium">
//               Contact
//             </Link>
//           </div>
          
//           {/* Mobile menu button */}
//           <div className="md:hidden flex items-center">
//             <button
//               onClick={() => setIsMenuOpen(!isMenuOpen)}
//               className="inline-flex items-center justify-center p-2 rounded-md text-green-700 hover:text-green-500 focus:outline-none"
//             >
//               <svg
//                 className="h-6 w-6"
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 {isMenuOpen ? (
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 ) : (
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//                 )}
//               </svg>
//             </button>
//           </div>
//         </div>
//       </div>
      
//       {/* Mobile Menu */}
//       {isMenuOpen && (
//         <div className="md:hidden bg-white p-4">
//           <div className="flex flex-col space-y-4">
//             <Link 
//               href="/" 
//               className="text-blue-600 hover:text-gold-500 font-medium py-2"
//               onClick={() => setIsMenuOpen(false)}
//             >
//               Home
//             </Link>
//             <Link 
//               href="/about" 
//               className="text-blue-600 hover:text-gold-500 font-medium py-2"
//               onClick={() => setIsMenuOpen(false)}
//             >
//               About
//             </Link>
//             <Link 
//               href="/sermons" 
//               className="text-blue-600 hover:text-gold-500 font-medium py-2"
//               onClick={() => setIsMenuOpen(false)}
//             >
//               Sermons
//             </Link>
//             <Link 
//               href="#contact" 
//               className="text-blue-600 hover:text-gold-500 font-medium py-2"
//               onClick={() => setIsMenuOpen(false)}
//             >
//               Contact
//             </Link>
//           </div>
//         </div>
//       )}
//     </nav>
//   )
// }

'use client';
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, ChevronDown } from 'lucide-react'

// Define types for the navigation link props
type NavLinkProps = {
  href: string;
  label: string;
}

type MobileNavLinkProps = NavLinkProps & {
  onClick: () => void;
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-black shadow-lg' : 'bg-black/90'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo and brand name */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/logo-removebg-preview.png"
                alt="Elim Christian Garden Int Logo"
                width={60}
                height={60}
                className="h-12 w-auto"
              />
              <div className="ml-3">
                <span className="text-xl font-bold text-green-700">Elim Christian</span>
                <span className="block text-sm text-green-500">Garden International</span>
              </div>
            </Link>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink href="/" label="Home" />
            <NavLink href="/about" label="About" />
            <NavLink href="/sermons" label="Sermons" />
            <NavLink href="#contact" label="Contact" />
            <button className="ml-4 bg-green-600 hover:bg-green-500 text-white py-2 px-5 rounded-full font-medium transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5">
              Donate
            </button>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-green-700 hover:text-green-500 hover:bg-gray-100 focus:outline-none transition-colors duration-300"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div 
        className={`md:hidden absolute w-full bg-white shadow-lg transform transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="px-4 pt-2 pb-6 space-y-2 flex flex-col">
          <MobileNavLink href="/" label="Home" onClick={() => setIsMenuOpen(false)} />
          <MobileNavLink href="/about" label="About" onClick={() => setIsMenuOpen(false)} />
          <MobileNavLink href="/sermons" label="Sermons" onClick={() => setIsMenuOpen(false)} />
          <MobileNavLink href="#contact" label="Contact" onClick={() => setIsMenuOpen(false)} />
          <div className="pt-2">
            <button className="w-full bg-green-600 hover:bg-green-500 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2">
              <span>Donate Now</span>
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

// Desktop navigation link component
function NavLink({ href, label }: NavLinkProps) {
  return (
    <Link href={href} className="relative group px-3 py-2">
      <span className="text-gray-600 font-medium group-hover:text-green-600 transition-colors duration-300">
        {label}
      </span>
      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
    </Link>
  )
}

// Mobile navigation link component
function MobileNavLink({ href, label, onClick }: MobileNavLinkProps) {
  return (
    <Link 
      href={href} 
      className="text-gray-600 hover:text-green-600 hover:bg-gray-50 font-medium py-3 px-4 rounded-md block transition-colors duration-300"
      onClick={onClick}
    >
      {label}
    </Link>
  )
}