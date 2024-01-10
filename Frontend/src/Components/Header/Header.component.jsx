import React from 'react';

import './Header.styles.css';
import gikiLogo from '../../Assets/Giki.png';
import hblLogo from '../../Assets/HBL logo.png';

const Header = () => {
    return (
        <header className="header">
            <div className="left">
                <img src= { gikiLogo } alt="Giki Logo" className="image-left" />
            </div>
            <div className="header-text">
                <h1>GIKIBLOCK: Blockchain Performance Evaluation Tool</h1>
            </div>
            <div className="right">
                <img src={ hblLogo } alt="HBL Logo" className="image-right" />
            </div>
        </header>
    );
};

export default Header;
