import React from 'react';

function Header({title}) {
    return (
        <header>
            <h1 className=" mb-4 text-3xl font-light pl-2 leading-none md:text-start border-amber-200 text-center tracking-tight text-gray-900 md:text-4xl border-b-2 pb-4 ">
                {title}
            </h1>
        </header>
    );
}

export default Header;