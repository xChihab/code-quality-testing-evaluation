import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center h-full w-full">
      <div className="w-[50px] h-[50px] border-[5px] border-solid border-[#f3f3f3] border-t-[#3498db] rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingSpinner;
