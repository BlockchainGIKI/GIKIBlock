import React, { useState, useEffect } from "react";
import axios from 'axios';
import Web3 from "web3";
import FileUpload from "../File/File.component";
import './Text-Area.styles.css';
// import Demo from "./Demo";
import { useSelector, useDispatch } from 'react-redux';
import { selectAccount } from "../../accountSlice";
import { setChange } from "../../changeSlice";
import ServerIP from '../../ServerIP';

function TextArea() {
    const dispatch = useDispatch();
    // Getting and setting Solidity code from text box
    const [text, setText] = useState("");
    const [ABItext, setABIText] = useState("");
    // Getting and setting constructor input arguments from input box(es)
    const [inputValues, setInputValues] = useState([]);
    // Getting and setting constructor input arguments from ABI
    const [constructorInputs, setConstructorInputs] = useState([]);
    // Getting and setting function input arguments from ABI
    const [functionInputs, setFunctionInputs] = useState([]);
    // Setting compiled to true if compile-button is pressed
    const [compiled, setCompiled] = useState(false);
    // Setting deployed to true if deploy-button is pressed
    const [deployed, setDeployed] = useState(false);
    // Getting and setting ABI from compile-button
    const [ABI, setABI] = useState("");
    // Getting and setting Bytecode from compile-button
    const [ByteCode, setByteCode] = useState("");
    // Getting and setting the contract address from deploy-button
    const [ContractAddress, setContractAddress] = useState("");
    // Initializing the web3 object
    const [web3, setWeb3] = useState(null);
    // Getting and setting selected function of the deployed contract
    const [selectedFunction, setSelectedFunction] = useState('');
    // Getting and setting input parameters of selected function of the deployed contract
    const [functionInputValues, setfunctionInputValues] = useState({});
    // Getting and setting the performance metric for analysis of the deployed contract
    const [selectedMetric, setSelectedMetric] = useState('');
    // Getting and setting the input batch transactions for throughput analysis of the deployed contract
    const [selectedBatch, setselectedBatch] = useState('');
    // Getting and setting user account from external Web3 provider
    const account = useSelector(selectAccount);
    // Getting and setting file content from uploaded file
    const [fileContent, setFileContent] = useState(null);
    // Getting and settin the contract name from the user
    const [contractName, setContractName] = useState(null);
    // Getting and setting the network from the user
    const [selectedBlockchain, setSelectedBlockchain] = useState('');
    // 
    const [add, setAdd] = useState(null);
    //
    const [addState, setAddState] = useState(false);

    useEffect(() => {
        // Check if Web3 is available
        if (window.ethereum) {
            // Use MetaMask's provider
            const web3Instance = new Web3(window.ethereum);
            console.log(web3Instance);
            setWeb3(web3Instance);
        } else {
            console.error('MetaMask not detected. Please install MetaMask.');
        }
    }, []);

    // Function to handle changes in input values
    const handleInputChange = (index, value) => {
        const newInputValues = [...inputValues];
        if (constructorInputs[index].type === 'uint256') {
            console.log('Number');
            newInputValues[index] = Number(value);
        }
        else {
            console.log(constructorInputs);
            newInputValues[index] = value;
        }
        setInputValues(newInputValues);
    };

    const handleTextAreaChange = async (e) => {
        setText(e.target.value);
    };

    const handleABIAreaChange = async (e) => {
        setABIText(e.target.value);
        try {
            const ob = JSON.parse(e.target.value);
            console.log(typeof (ob), ob);
            setABI(ob);
            setAddState(true);
            const ftns = ob
                .filter(item => item.type === 'function')
                .map(func => {
                    return {
                        name: func.name,
                        type: func.type,
                        stateMutability: func.stateMutability,
                        // params: func.inputs.length,
                        inputs: func.inputs.map(param => ({
                            name: param.name,
                            type: param.type,
                        })),
                    };
                });
            setFunctionInputs(ftns);
        }
        catch (error) {
            return;
        }
    };

    const handleFunctionChange = (event) => {
        setSelectedFunction(event.target.value);
        setfunctionInputValues([]); // Reset input values when the function changes
    };

    const handlefunctionInputChange = (event, type, name) => {
        // const newInputValues = [...inputValues];
        // newInputValues[index] = event.target.value;
        // setfunctionInputValues(newInputValues);
        setfunctionInputValues((prevValues) => ({
            ...prevValues,
            [`${type}_${name}`]: event.target.value,
        }));
    };

    const handleMetricChange = (event) => {
        setSelectedMetric(event.target.value);
    };

    const handleTransactionsChange = (event) => {
        setselectedBatch(event.target.value);
    }

    const handleFileContent = (content) => {
        setFileContent(content);
    };

    const handleContractNameChange = (e) => {
        setContractName(e.target.value)
    }

    const handleContractAddressChange = (e) => {
        setContractAddress(e.target.value)
    }

    const handleBlockchainChange = (e) => {
        setSelectedBlockchain(e.target.value);
    };

    async function compileContract() {
        if (text || fileContent) {
            const params = {
                contractName: contractName,
                sourceCode: text || fileContent,
                network: selectedBlockchain
            };
            try {
                console.log("At text area");
                console.log(contractName);
                console.log(selectedBlockchain);
                const response = await axios.get('http://' + ServerIP + ':8000/compile-and-deploy', { params });
                console.log(response.data);
                if (response.data.result.abi) {
                    window.alert('Compiled successfully');
                } else {
                    window.alert(response.data.result);
                }
                setByteCode(response.data.result.bytecode);
                setABI(response.data.result.abi)
                // Find the constructor in the ABI
                const constructor = response.data.result.abi.find(item => item.type === 'constructor');
                if (constructor) {
                    // Access constructor parameters and their types
                    const constructorInputs = constructor.inputs || [];
                    console.log('Constructor Parameters:');
                    constructorInputs.forEach(param => {
                        console.log(`Name: ${param.name}, Type: ${param.type}`);
                    });
                    setConstructorInputs(constructorInputs);
                } else {
                    console.log('No constructor found in the ABI.');
                }
                console.log('Constructor Inputs', constructorInputs);
                setCompiled(true);

                // await sleep(5000);
            } catch (error) {
                console.error('Error fetching data:', error);
                // console.log('Metamask', account);
            }
        }
        else {
            window.alert('Please paste or upload the code');
        }
    }

    // async function connectToMetaMask() {
    //     try {
    //         if (window.ethereum) {
    //             const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    //             const selectedAccount = accounts[0];
    //             console.log('Connected to MetaMask. Selected Account:', selectedAccount);
    //             return selectedAccount;
    //         } else {
    //             console.error('MetaMask not detected.');
    //             return null;
    //         }
    //     } catch (error) {
    //         console.error('Error connecting to MetaMask:', error);
    //         return null;
    //     }
    // }

    // Function to deploy the contract
    const deployContract = async () => {
        if (!compiled) {
            window.alert('Please compile the contract first.');
            return;
        }
        else if (!account) {
            try {
                console.log("At deploy contracts elif ");
                const api = {
                    status: false,
                    url: '',
                }
                let params = {
                    network: selectedBlockchain,
                    API: api,
                    ABI: ABI,
                    ByteCode: ByteCode,
                    inputValues: inputValues
                };
                console.log('params: ', params);
                let response = await axios.get('http://' + ServerIP + ':8000/deploy-contract', { params });
                console.log(response.data);
                if (response.data.result.address) {
                    window.alert(response.data.result.deployed)
                    setContractAddress(response.data.result.address);
                    const ftns = ABI
                        .filter(item => item.type === 'function')
                        .map(func => {
                            return {
                                name: func.name,
                                type: func.type,
                                stateMutability: func.stateMutability,
                                // params: func.inputs.length,
                                inputs: func.inputs.map(param => ({
                                    name: param.name,
                                    type: param.type,
                                })),
                            };
                        });
                    setFunctionInputs(ftns);
                    //     setContractAddress(response.data.result.address);
                    setDeployed(true);
                }
                else {
                    window.alert(`Error deploying contract: ${response.data.result.message}`);
                }
                params = {
                    name: contractName,
                    network: selectedBlockchain,
                    deployer: account,
                    address: ContractAddress
                };
                response = await axios.get('http://' + ServerIP + ':8000/write-to-contract-csv', { params });
            } catch (error) {
                console.error('Error fetching data:', error);
                // console.log('Metamask', account);
            }
        }
        else {
            try {
                // Use Web3.js to create a contract instance
                const contract = new web3.eth.Contract(ABI);
                const gas = await contract.deploy({ data: ByteCode, arguments: inputValues }).estimateGas();
                const gasPrice = await web3.eth.getGasPrice();
                // Deploy the contract
                const deployedContract = await contract
                    .deploy({
                        data: ByteCode,
                        arguments: inputValues
                    })
                    .send({
                        from: account,
                        gas: gas,
                        gasPrice: gasPrice
                    });
                console.log('Contract deployed at:', deployedContract.options.address);
                setContractAddress(deployedContract.options.address);
                const params = {
                    name: contractName,
                    network: selectedBlockchain,
                    deployer: account,
                    address: deployedContract.options.address
                };
                const response = await axios.get('http://' + ServerIP + ':8000/write-to-contract-csv', { params });
                console.log(response.data);
                const ftns = ABI
                    .filter(item => item.type === 'function')
                    .map(func => {
                        return {
                            name: func.name,
                            type: func.type,
                            stateMutability: func.stateMutability,
                            // params: func.inputs.length,
                            inputs: func.inputs.map(param => ({
                                name: param.name,
                                type: param.type,
                            })),
                        };
                    });
                setFunctionInputs(ftns);
                setDeployed(true);
            } catch (error) {
                console.error('Error deploying smart contract:', error);
            }
        }
    };

    async function measureMetrics() {
        // setDeployed(true);
        console.log('addState: ', addState);
        if (!(deployed || addState)) {
            window.alert('Deploy the smart contract first')
        }
        else if (!account) {
            try {
                console.log("At measure metrics elif ");
                const ftn = functionInputs.filter(item => item.name === selectedFunction);
                const type = ftn[0].stateMutability;
                const api = {
                    status: false,
                    url: '',
                }
                const params = {
                    network: selectedBlockchain,
                    API: api,
                    ABI: JSON.stringify(ABI) || ABItext,
                    address: ContractAddress,
                    metric: selectedMetric,
                    ftn: selectedFunction,
                    ftnInputs: Object.values(functionInputValues),
                    type: type,
                    transactions: selectedBatch
                };
                const response = await axios.get('http://' + ServerIP + ':8000/measure-function-call-metrics', { params });
                console.log(response.data);
                if (response.data.result.perf) {
                    window.alert('Measured successfully');
                    const date = new Date();
                    const params = {
                        address: '0x5719D02a5ebe5cA3AE722c703c24Ae5C845d0538',
                        date: date.toLocaleDateString(),
                        time: date.toTimeString(),
                        network: selectedBlockchain,
                        contract: contractName,
                        metric: selectedMetric,
                        ftn: selectedFunction,
                        value: response.data.result.perf,
                        fee: response.data.result.fee,
                        tx: selectedMetric === 'Latency' ? 1 : selectedBatch
                    }
                    console.log(params);
                    try {
                        const resp = await axios.get('http://' + ServerIP + ':8000/write-to-user-metric-csv', { params });
                        console.log(resp.data);
                        dispatch(setChange(true));
                    }
                    catch (error) {
                        console.error('Error fetching data:', error);
                    }
                } else {
                    window.alert('Eror during measurments: ', response.data.result.perf);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                // console.log('Metamask', account);
            }
        }
        else {
            console.log(functionInputs);
            console.log(selectedFunction)
            console.log('Function Inputs: ', functionInputValues);
            console.log('Metric: ', selectedMetric);
            // const selectedAccount = await connectToMetaMask();
            const selectedAccount = account;
            const contract = new web3.eth.Contract(ABI, ContractAddress);
            // const contract = new web3.eth.Contract(Demo, '0x59226514FDDD51dA07dbd5adD54798F4236aBDB4');
            const ftn = functionInputs.filter(item => item.name === selectedFunction);
            console.log('ftn', ftn);
            switch (selectedMetric) {
                case 'Latency':
                    if (ftn[0].stateMutability === 'pure' || ftn[0].stateMutability === 'view') {
                        try {
                            const startTime = performance.now();
                            const response = await contract.methods[selectedFunction](...Object.values(functionInputValues)).call();
                            const endTime = performance.now();
                            const latency = (endTime - startTime) / 1000;
                            console.log(response);
                            console.log('Latency: ', latency);
                            const date = new Date();
                            const params = {
                                address: account,
                                date: date.toLocaleDateString(),
                                time: date.toTimeString(),
                                network: selectedBlockchain,
                                contract: contractName,
                                metric: selectedMetric,
                                ftn: selectedFunction,
                                value: latency,
                                fee: 0,
                                tx: 1
                            }
                            console.log(params);
                            const resp = await axios.get('http://10.1.33.124:8000/write-to-user-metric-csv', { params });
                            console.log(resp.data);
                            dispatch(setChange(true));
                        } catch (error) {
                            console.error('Error:', error);
                        }
                    }
                    else {
                        console.log('At latnecy else');
                        // const data = contract.methods[selectedFunction](...functionInputValues).encodeABI();
                        const gas = await contract.methods[selectedFunction](...Object.values(functionInputValues)).estimateGas();
                        console.log('Gas', gas);
                        const transactionObject = {
                            from: selectedAccount,
                            gas,
                            gasPrice: '70000000000',
                        };
                        try {
                            const startTime = performance.now();
                            // console.log(contract);
                            // console.log(selectedAccount);
                            const receipt = await contract.methods[selectedFunction](...Object.values(functionInputValues)).send(transactionObject);
                            const endTime = performance.now();
                            const latency = (endTime - startTime) / 1000;
                            console.log(receipt);
                            const txFee = (Number(receipt.effectiveGasPrice) * Number(receipt.gasUsed)) / 1e18;
                            console.log('Latency: ', latency);
                            const date = new Date();
                            const params = {
                                address: account,
                                date: date.toLocaleDateString(),
                                time: date.toTimeString(),
                                network: selectedBlockchain,
                                contract: contractName,
                                metric: selectedMetric,
                                ftn: selectedFunction,
                                value: latency,
                                fee: txFee,
                                tx: 1
                            }
                            console.log(params);
                            const resp = await axios.get('http://' + ServerIP + ':8000/write-to-user-metric-csv', { params });
                            console.log(resp.data);
                            dispatch(setChange(true));
                        }
                        catch (error) {
                            console.log("Error: ", error);
                        }
                    }
                    break;
                case 'Throughput':
                    console.log('Input Batch: ', selectedBatch);
                    const promises = [];
                    const nonce = await web3.eth.getTransactionCount(selectedAccount);
                    const gas = await contract.methods[selectedFunction](...Object.values(functionInputValues)).estimateGas();
                    for (let i = 0; i < Number(selectedBatch); i++) {
                        if (ftn[0].stateMutability === 'pure' || ftn[0].stateMutability === 'view') {
                            console.log('AT if TPS');
                            promises.push(new Promise(async (resolve, reject) => {
                                try {
                                    const response = await contract.methods[selectedFunction](...Object.values(functionInputValues)).call();
                                    // console.log('TPS response: ', response);
                                    resolve(response);
                                } catch (error) {
                                    reject(error);
                                }
                            }));
                        }
                        else {
                            const transactionObject = {
                                from: selectedAccount,
                                gas,
                                gasPrice: '70000000000',
                                nonce: Number(nonce) + i
                            };
                            promises.push(new Promise(async (resolve, reject) => {
                                try {
                                    const receipt = await contract.methods[selectedFunction](...Object.values(functionInputValues)).send(transactionObject);
                                    // console.log('TPS response: ', response);
                                    resolve(receipt);
                                } catch (error) {
                                    reject(error);
                                }
                            }));
                        }
                    }
                    const startTime = performance.now();
                    Promise.all(promises)
                        .then(async (receipts) => {
                            const endTime = performance.now();
                            const duration = (endTime - startTime) / 1000;
                            const throughput = Number(selectedBatch) / duration;
                            console.log(`Transactions Per Second (TPS): ${throughput}`);
                            console.log(receipts);
                            let txFee = 0;
                            for (let i = 0; i < selectedBatch; i++) {
                                txFee += Number(receipts[i].effectiveGasPrice) * Number(receipts[i].gasUsed);
                            }
                            txFee = (txFee / selectedBatch) / 1e18;
                            const date = new Date();
                            const params = {
                                address: account,
                                date: date.toLocaleDateString(),
                                time: date.toTimeString(),
                                network: selectedBlockchain,
                                contract: contractName,
                                metric: selectedMetric,
                                ftn: selectedFunction,
                                value: throughput,
                                fee: ftn[0].stateMutability === 'pure' || ftn[0].stateMutability === 'view' ? 0 : txFee,
                                tx: selectedBatch
                            }
                            console.log(params);
                            const resp = await axios.get('http://' + ServerIP + ':8000/write-to-user-metric-csv', { params });
                            console.log(resp.data);
                            dispatch(setChange(true));
                            // resolve({ throughput, receipts });
                        })
                        .catch((error) => {
                            console.error('Error:', error);
                            // reject(error);
                        });
                    break
                default:
                    return;
            }
        }
    }

    // Render input boxes based on constructor inputs
    const inputBoxes = constructorInputs.map((param, index) => (
        <div key={index}>
            <label>{param.name}</label>
            <input
                type="text"
                placeholder={param.type}
                value={inputValues[index] || ''}
                onChange={(e) => handleInputChange(index, e.target.value)}
            />
        </div>
    ));

    const jsxContent = (
        <div>
            {(deployed || addState) && (
                <>
                    <h4>Select smart contract function</h4>
                    <select onChange={handleFunctionChange} value={selectedFunction}>
                        <option value="">Select a function</option>
                        {functionInputs.map((item, index) => (
                            <option key={index} value={item.name}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                </>
            )}
            {selectedFunction && (
                <>
                    <h4>Enter input values for the parameters of the selected function</h4>
                    {functionInputs
                        .find((item) => item.name === selectedFunction)
                        .inputs.map((input, index) => (
                            <input
                                key={index}
                                type={input.type}
                                placeholder={input.name}
                                value={functionInputValues[`${input.type}_${input.name}`]}//{functionInputValues[index] || ''}
                                onChange={(event) => handlefunctionInputChange(event, input.type, input.name)}
                            />
                        ))}
                </>
            )}

            {selectedFunction && (
                <>
                    <h4>Select the performance metric </h4>
                    <select onChange={handleMetricChange} value={selectedMetric}>
                        <option value="">Select a metric</option>
                        <option value="Latency">Latency</option>
                        <option value="Throughput">Throughput</option>
                    </select>
                </>)}

            {selectedMetric === 'Throughput' && (
                <>
                    <h4>Select input batch transactions</h4>
                    <select onChange={handleTransactionsChange} value={selectedBatch}>
                        <option value="">Select a number</option>
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                    </select>
                </>
            )}

        </div>
    );

    const addContent = (
        <div>
            {add && (
                <>
                    <label>Enter smart contract address</label>
                    <input
                        type="text"
                        name="address"
                        value={ContractAddress}
                        onChange={handleContractAddressChange}
                        placeholder="Smart contract address"
                        required
                    />
                    <h4>Paste contract ABI below:</h4>
                    <textarea
                        className="inner_ABI"
                        id="large-text-ABI"
                        name="large-text-ABI"
                        rows="25"
                        cols="70"
                        value={ABItext}
                        onChange={handleABIAreaChange}
                    ></textarea>
                    <br />
                </>
            )}

        </div>
    );

    function addContract() {
        setAdd(true);
    }

    return (
        <div className="text-area">
            <label>Enter smart contract name</label>
            <input
                type="text"
                name="endPoint"
                value={contractName}
                onChange={handleContractNameChange}
                placeholder="Smart contract name"
                required
            />
            <br></br><br></br>
            <label>Select a Blockchain: </label>
            <select value={selectedBlockchain} onChange={handleBlockchainChange}>
                <option value="">Select blockchain</option>
                <option value="Arbitrum-Sepolia">Arbitrum (Sepolia)</option>
                <option value="Alfajores">Alfajores</option>
                <option value="Linea-Goerli">Linea (Goerli)</option>
                <option value="Optimism-Goerli">Optimism (Goerli)</option>
                <option value="Optimism-Sepolia">Optimism (Sepolia)</option>
                <option value="Polygon-Mumbai">Mumbai</option>
                <option value="Sepolia">Sepolia</option>
                <option value="All">All</option>
            </select>
            <h4>Paste your code below:</h4>
            <textarea
                className="inner"
                id="large-text"
                name="large-text"
                rows="25"
                cols="70"
                value={text}
                onChange={handleTextAreaChange}
            ></textarea>
            <br />
            <h4>Or upload the code file here:</h4>
            <FileUpload onFileContent={handleFileContent} />
            <button className="compile-button" onClick={compileContract}> Compile Contract </button>
            {inputBoxes}
            <button onClick={deployContract}>Deploy Contract</button>
            <button onClick={addContract}>Add Contract</button>
            {addContent}
            {jsxContent}
            <button onClick={measureMetrics}>Measure</button>
        </div>
    );
}
export default TextArea;
