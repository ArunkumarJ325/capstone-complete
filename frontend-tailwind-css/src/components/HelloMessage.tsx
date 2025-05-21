import React, { useEffect, useState } from 'react';

const HelloMessage: React.FC = () => {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="text-center">
      <h1 
        className={`text-5xl md:text-7xl lg:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 mb-6 transition-opacity duration-1000 ${visible ? 'opacity-100' : 'opacity-0'}`}
      >
        Hello World
      </h1>
      
    </div>
  );
};

export default HelloMessage;