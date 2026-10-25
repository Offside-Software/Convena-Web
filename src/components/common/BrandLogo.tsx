import React from 'react';

export const BrandLogo: React.FC = () => {
    return (
        <>
            <div className="w-[42px] h-[42px] bg-[#FF4B91] border-2 border-[#121215] rounded-lg shadow-[3px_3px_0px_0px_#121215] flex items-center justify-center relative -rotate-3">
                <span className="font-['Space_Grotesk',sans-serif] font-black text-2xl text-white">
                    C
                </span>
                <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#FFE600] border-2 border-[#121215] rounded-full" />
            </div>
            <div className="mr-4">
                <span className="font-['Space_Grotesk',sans-serif] font-black text-2xl tracking-tight text-[#121215] block leading-none">
                    CONVENA
                </span>
            </div>
        </>
    );
}