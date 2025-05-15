import React from 'react';

function InfoBlock({ title, content }) {
    return (
        <div className="flex flex-wrap gap-4 mt-3">
            <h2 className="text-2xl font-extrabold text-nowrap text-[#333]">{title} :</h2>
            <p className="text-2xl font-normal text-[#333]">{content}</p>
        </div>
    );
}

export default InfoBlock;