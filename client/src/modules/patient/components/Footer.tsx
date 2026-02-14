import React, { useState } from 'react';
import { Phone, MapPin, Mail, Send, Linkedin, Facebook, Twitter } from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubscribe = () => {
    if (!email.trim()) {
      alert('Please enter your email');
      return;
    }
    
    // Here you would normally send the email to your backend/API
    alert(`Thank you for subscribing with: ${email}`);
    setEmail(''); // clear input after submit
  };

  return (
    <footer className="bg-indigo-950 text-white py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            <h2 className="text-2xl font-bold mb-4">MEDDICAL</h2>
            <p className="text-indigo-300 text-sm leading-relaxed">
              Leading the Way in Medical Excellence, Trusted Care.
            </p>
          </div>

          {/* Important Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Important Links</h3>
            <ul className="space-y-2 text-indigo-300 text-sm">
              <li className="hover:text-white cursor-pointer transition-colors">Appointment</li>
              <li className="hover:text-white cursor-pointer transition-colors">Doctors</li>
              <li className="hover:text-white cursor-pointer transition-colors">Services</li>
              <li className="hover:text-white cursor-pointer transition-colors">About Us</li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-indigo-300 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>(237) 681-812-255</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>fildineesoe@gmail.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1" />
                <span>0123 Some place<br />Some country</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
            <div className="relative">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={handleEmailChange}
                className="w-full px-4 py-2.5 rounded-full bg-indigo-900 text-white 
                         placeholder-indigo-400 focus:outline-none focus:ring-2 
                         focus:ring-blue-400 transition-all"
              />
              <button
                onClick={handleSubscribe}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 
                         hover:bg-blue-600 rounded-full p-2 transition-colors"
                aria-label="Subscribe"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-indigo-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-indigo-300 text-sm">
            © {new Date().getFullYear()} MEDDICAL. All Rights Reserved.
          </p>

          <div className="flex gap-4">
            <button 
              className="w-8 h-8 bg-indigo-800 hover:bg-indigo-700 rounded-full 
                       flex items-center justify-center transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </button>
            <button 
              className="w-8 h-8 bg-indigo-800 hover:bg-indigo-700 rounded-full 
                       flex items-center justify-center transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-4 h-4" />
            </button>
            <button 
              className="w-8 h-8 bg-indigo-800 hover:bg-indigo-700 rounded-full 
                       flex items-center justify-center transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;