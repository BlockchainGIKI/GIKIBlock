import React from 'react';
import { Link } from "react-router-dom";
import './Navbar.styles.css'
import CustomButton from '../Custom-Button/Custom-button.component';

const Navbar = () => {
    // return (
    //     <div className='Navbar'>
    //         <div className='navItem'>
    //             <Link to="/">Home</Link>
    //         </div>
    //         <div className='navItem'>
    //             <Link to="/instructions">Instructions</Link>
    //         </div>
    //     </div>
    // );
    return (
        <nav className='Navbar'>
            <Link to="/" className='navItem'>Home</Link>
            <Link to="/instructions" className='navItem'>Instructions</Link>
            {/* <CustomButton>Connect wallet (Metamask)</CustomButton> */}
        </nav>
    );
}
export default Navbar;