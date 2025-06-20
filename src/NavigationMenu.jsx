import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const NavigationMenu = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-gray-800 text-white p-4">
            <div className="flex justify-between items-center">
                <span className="text-xl font-bold">🎬 Menu</span>
                <button onClick={() => setIsOpen(!isOpen)} className="md:hidden">
                    ☰
                </button>
            </div>
            <div className={`mt-4 ${isOpen ? 'block' : 'hidden'} md:block`}>
                <ul className="space-y-2 md:flex md:space-y-0 md:space-x-4">
                    <li><Link to="/" className="hover:text-gray-300">🎥 Films à voir</Link></li>
                    <li><Link to="/films-vus" className="hover:text-gray-300">✅ Films vus</Link></li>
                </ul>
            </div>
        </nav>
    );
};

export default NavigationMenu;
