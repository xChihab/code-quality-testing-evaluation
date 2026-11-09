import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex size-full items-center justify-center">
      <div className="h-[50px] w-[50px] animate-spin rounded-full border-[5px] border-solid border-[#f3f3f3] border-t-[#3498db]"></div>
    </div>
  );
};

export default LoadingSpinner;
