import React, { useState } from "react";
import { useDispatch } from 'react-redux';
import Ethereum from "../../Assets/Ethereum.png";
import { setAccount } from "../../accountSlice";
import './Custom-button.styles.css';

const CustomButton = ({ children }) => {

    const [walletAddress, setWalletAddress] = useState('');
    const dispatch = useDispatch();

    async function requestAccount() {
        if (window.ethereum) {
            try {
                if (walletAddress) {
                    setWalletAddress('');
                    dispatch(setAccount(''));
                }
                else {


                    // Request access to accounts
                    await window.ethereum.request({ method: 'eth_requestAccounts' });
                    // Listen for changes to accounts
                    window.ethereum.on('accountsChanged', (newAccounts) => {
                        if (newAccounts.length > 0) {
                            // Use the first account in the array as the active account
                            setWalletAddress(newAccounts[0]);
                        } else {
                            // Handle the case where no accounts are found
                            alert('No Ethereum accounts found in MetaMask.');
                            setWalletAddress('');
                        }
                    });
                    // Get initial accounts
                    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                    if (accounts.length > 0) {
                        setWalletAddress(accounts[0]);
                        dispatch(setAccount(accounts[0]));
                    } else {
                        alert('No Ethereum accounts found in MetaMask.');
                    }
                }
            } catch (error) {
                console.log('Error connecting to MetaMask:', error);
            }
        } else {
            alert('MetaMask not detected');
        }
    }

    return (
        <div className="card">
            <img src={Ethereum} alt="Ethereum" className="image" /> <br></br><br></br>
            <button className="custom-button" onClick={requestAccount}> {children} </button>
            <p>Connected account: {walletAddress}</p>
        </div>
    )
}

export default CustomButton;
