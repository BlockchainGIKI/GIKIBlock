import React, { useState, useEffect } from 'react';
import './Main-dashboard.styles.css';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { selectAccount } from "../../accountSlice";
import { setChange } from "../../changeSlice";
import abi from './Contract';
import config from './constants';
import Web3 from "web3";

const MainDashboard = () => {
    const dispatch = useDispatch();
    const [selectedBlockchain, setSelectedBlockchain] = useState('');
    const [endPoint, setEndPoint] = useState('');
    const [selectedSmartContract, setSelectedSmartContract] = useState('');
    const [metric, setSelectedMetric] = useState('');
    const [transactions, setTransactions] = useState('');
    const account = useSelector(selectAccount);

    const handleBlockchainChange = (e) => {
        setSelectedBlockchain(e.target.value);
    };

    const handleMetricChange = (e) => {
        setSelectedMetric(e.target.value);
    };

    const handleContractChange = (e) => {
        setSelectedSmartContract(e.target.value);
    };

    const handleChange = (e) => {
        setEndPoint(e.target.value)
    };

    const handleTransactionsChange = (e) => {
        setTransactions(e.target.value);
    };
    const [web3, setWeb3] = useState(null);
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

    async function measureMetrics() {
        const selectedAccount = account;
        const ContractAddress = config[selectedBlockchain]['ContractAddress'];
        // const web3 = new Web3(config[selectedBlockchain]['RPC']);
        const contract = new web3.eth.Contract(abi, ContractAddress);
        var gas = 0;
        var transactionObject = {};
        console.log('At mM', metric);
        return new Promise(async (resolve, reject) => {
            if (metric === 'Latency') {
                console.log('At mM', metric);
                switch (selectedSmartContract) {
                    case 'createUser':
                        gas = await contract.methods.createUser("John Doe", 100).estimateGas();
                        transactionObject = {
                            from: selectedAccount,
                            gas,
                            gasPrice: '70000000000',
                        };
                        try {
                            const startTime = performance.now();
                            const receipt = await contract.methods.createUser("John Doe", 100).send(transactionObject);
                            const transactionFee = web3.utils.fromWei(receipt.effectiveGasPrice * receipt.gasUsed, "ether");
                            const endTime = performance.now();
                            const perf_metric = (endTime - startTime) / 1000;
                            console.log(receipt);
                            console.log('Latency: ', perf_metric);
                            console.log('Transaction Fee: ', transactionFee);
                            resolve({ perf_metric, transactionFee });
                        }
                        catch (error) {
                            console.log("Error: ", error);
                        }
                        break;
                    case 'issueMoney':
                        gas = await contract.methods.issueMoney(100, 1).estimateGas()
                        transactionObject = {
                            from: selectedAccount,
                            gas,
                            gasPrice: '70000000000',
                        };
                        try {
                            const startTime = performance.now();
                            const receipt = await contract.methods.issueMoney(100, 1).send(transactionObject);
                            const transactionFee = web3.utils.fromWei(receipt.effectiveGasPrice * receipt.gasUsed, "ether");
                            const endTime = performance.now();
                            const perf_metric = (endTime - startTime) / 1000;
                            console.log(receipt);
                            console.log('Latency: ', perf_metric);
                            console.log('Transaction Fee: ', transactionFee);
                            resolve({ perf_metric, transactionFee });
                        }
                        catch (error) {
                            console.log("Error: ", error);
                        }
                        break;
                    case 'transferMoney':
                        gas = await contract.methods.transferMoney(1, 1, 2).estimateGas()
                        transactionObject = {
                            from: selectedAccount,
                            gas,
                            gasPrice: '70000000000',
                        };
                        try {
                            const startTime = performance.now();
                            const receipt = await contract.methods.issueMoney(100, 1).send(transactionObject);
                            const transactionFee = web3.utils.fromWei(receipt.effectiveGasPrice * receipt.gasUsed, "ether");
                            const endTime = performance.now();
                            const perf_metric = (endTime - startTime) / 1000;
                            console.log(receipt);
                            console.log('Latency: ', perf_metric);
                            console.log('Transaction Fee: ', transactionFee);
                            resolve({ perf_metric, transactionFee });
                        }
                        catch (error) {
                            console.log("Error: ", error);
                        }
                        break;
                    default:
                        const startTime = performance.now();
                        console.log('At deafult', selectedSmartContract);
                        const response = await contract.methods[selectedSmartContract](1).call();
                        const endTime = performance.now();
                        const perf_metric = (endTime - startTime) / 1000;
                        console.log(response);
                        const transactionFee = 0;
                        console.log('Latency: ', perf_metric, transactionFee);
                        resolve({ perf_metric, transactionFee });
                }
            }
            else if (metric === 'Throughput') {
                console.log('At mM', metric);
                const promises = [];
                // const nonce = await web3.eth.getTransactionCount(defaultAccount);
                for (let i = 0; i < Number(transactions); i++) {
                    if (selectedSmartContract === 'getUser') {
                        console.log('AT if TPS');
                        promises.push(new Promise(async (resolve, reject) => {
                            try {
                                const response = await contract.methods[selectedSmartContract](1).call()
                                // const fee = 0;
                                // console.log('TPS response: ', response);
                                resolve(response);
                            } catch (error) {
                                reject(error);
                            }
                        }));
                    }
                    else {
                        switch (selectedSmartContract) {
                            case 'createUser':
                                gas = await contract.methods.createUser("John Doe", 100).estimateGas();
                                transactionObject = {
                                    from: selectedAccount,
                                    gas,
                                    gasPrice: '70000000000',
                                };
                                promises.push(new Promise(async (resolve, reject) => {
                                    try {
                                        const receipt = await contract.methods.createUser('John Doe', 100).send(transactionObject);
                                        // console.log('TPS response: ', response);
                                        resolve(receipt);
                                    } catch (error) {
                                        reject(error);
                                    }
                                }));
                                break;
                            case 'issueMoney':
                                gas = await contract.methods.issueMoney(100, 1).estimateGas()
                                transactionObject = {
                                    from: selectedAccount,
                                    gas,
                                    gasPrice: '70000000000',
                                };
                                promises.push(new Promise(async (resolve, reject) => {
                                    try {
                                        const receipt = await contract.methods.issueMoney(100, 1).send(transactionObject);
                                        // console.log('TPS response: ', response);
                                        resolve(receipt);
                                    } catch (error) {
                                        reject(error);
                                    }
                                }));
                                break;
                            case 'transferMoney':
                                gas = await contract.methods.transferMoney(1, 1, 2).estimateGas()
                                transactionObject = {
                                    from: selectedAccount,
                                    gas,
                                    gasPrice: '70000000000',
                                };
                                promises.push(new Promise(async (resolve, reject) => {
                                    try {
                                        const receipt = await contract.methods.transferMoney(1, 1, 2).send(transactionObject);
                                        // console.log('TPS response: ', response);
                                        resolve(receipt);
                                    } catch (error) {
                                        reject(error);
                                    }
                                }));
                                break;
                            default:
                        }
                    }
                }
                const startTime = performance.now();
                Promise.all(promises)
                    .then((receipts) => {
                        const endTime = performance.now();
                        const duration = (endTime - startTime) / 1000;
                        const perf_metric = Number(transactions) / duration;
                        console.log(`Transactions Per Second (TPS): ${perf_metric}`);
                        console.log(receipts);
                        const transactionFee = receipts;
                        resolve({ perf_metric, transactionFee });
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                        // reject(error);
                    });
            }
        });
    }


    async function requestAccount() {
        console.log("At standard button: ", selectedSmartContract);
        if (account) {
            if (selectedBlockchain === 'All') {
                window.alert('Please manually change the blockcain networks to one of the supported 6 networks in your wallet provider');
                return;
            }
            var { perf_metric, transactionFee } = await measureMetrics();
            console.log('Perf: ', perf_metric, transactionFee);
            let txFee = 0;
            if (metric === 'Throughput') {
                if (selectedSmartContract !== 'getUser') {
                    for (let i = 0; i < transactions; i++) {
                        txFee += Number(transactionFee[i].effectiveGasPrice) * Number(transactionFee[i].gasUsed);
                    }
                    txFee = (txFee / transactions) / 1e18;
                }
                transactionFee = txFee;
            }
            try {
                var params = {
                    _perfMetric: perf_metric,
                    _fee: transactionFee,
                    network: selectedBlockchain,
                    selectedFunction: selectedSmartContract,
                    numTransactions: transactions,
                    metric: metric
                };
                console.log(params);
                const response = await axios.get('http://10.1.33.124:8000/write-to-metrics-csv', { params });
                console.log(response.data);
                const date = new Date();
                params = {
                    address: account,
                    date: date.toLocaleDateString(),
                    time: date.toTimeString(),
                    network: selectedBlockchain,
                    contract: 'Benchmark',
                    metric: metric,
                    ftn: selectedSmartContract,
                    value: perf_metric,
                    fee: transactionFee,
                    tx: metric === 'Latency' ? 0 : transactions
                }
                console.log(params);
                const resp = await axios.get('http://10.1.33.124:8000/write-to-user-metric-csv', { params });
                console.log(resp.data);
                dispatch(setChange(true));
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
        else {
            const api = {
                status: endPoint ? true : false,
                url: endPoint,
            }
            const address = {
                status: false,
                address: '0x'
            }
            const networks = ['Sepolia', 'Polygon-Mumbai', 'Arbitrum-Goerli', 'Optimism-Goerli', 'Linea-Goerli', 'Celo'];
            const count = selectedBlockchain === 'All' ? 6 : 1;
            console.log('BC', selectedBlockchain);
            for (let i = 0; i < count; i++) {
                console.log('Count: ', count);
                var params = {
                    metric: metric,
                    network: selectedBlockchain !== 'All' ? selectedBlockchain : networks[i],
                    API: api,
                    address: address,
                    transactions: transactions,
                    function_name: selectedSmartContract,
                };
                console.log('Params: ', params);
                try {
                    const response = await axios.get('http://10.1.33.124:8000/run-node-script', { params });
                    console.log(response.data);
                    const date = new Date();
                    params = {
                        address: '0x5719D02a5ebe5cA3AE722c703c24Ae5C845d0538',
                        date: date.toLocaleDateString(),
                        time: date.toTimeString(),
                        network: selectedBlockchain !== 'All' ? selectedBlockchain : networks[i],
                        contract: 'Benchmark',
                        metric: metric,
                        ftn: selectedSmartContract,
                        value: response.data.result.perf,
                        fee: response.data.result.txFee,
                        tx: metric === 'Latency' ? 0 : transactions
                    }
                    console.log(params);
                    const resp = await axios.get('http://10.1.33.124:8000/write-to-user-metric-csv', { params });
                    console.log(resp.data);
                    dispatch(setChange(true));
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            }
        }
    }

    return (
        <div className="card-main">
            <label>Select a Blockchain: </label>
            <select value={selectedBlockchain} onChange={handleBlockchainChange}>
                <option value="">Select blockchain</option>
                <option value="Arbitum-Goerli">Arbitum</option>
                <option value="Celo">Alfajores</option>
                <option value="Linea-Goerli">Linea</option>
                <option value="Optimism-Goerli">Optimism</option>
                <option value="Polygon-Mumbai">Mumbai</option>
                <option value="Sepolia">Sepolia</option>
                <option value="All">All</option>
            </select><br></br><br></br>
            <div className="row">
                <div className="col-25">
                    <label>Enter end point API key</label>
                </div>
                <div className="col-75">
                    <input
                        type="text"
                        name="endPoint"
                        value={endPoint}
                        onChange={handleChange}
                        placeholder="Type Endpoint API key (optional)"
                        required
                    />
                </div>
            </div><br></br><br></br>
            <label>Select a Performance metric: </label>
            <select value={metric} onChange={handleMetricChange}>
                <option value="">Select metric</option>
                <option value="Latency">Latency</option>
                <option value="Throughput">Throughput</option>
                {/* <option value="default">All</option> */}
            </select><br></br><br></br>
            {(metric === "Throughput" || metric === "both") && (
                <div>
                    <label>No. of transactions: </label>
                    <select value={transactions} onChange={handleTransactionsChange}>
                        <option value="">Select transactions</option>
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                    </select><br></br><br></br>
                </div>
            )}
            <label>Default smart contracts: </label>
            <select value={selectedSmartContract} onChange={handleContractChange}>
                <option value="">Select function</option>
                <option value="createUser">Create User</option>
                <option value="issueMoney">Issue money</option>
                <option value="transferMoney">Transfer Money</option>
                <option value="getUser">Get User</option>
            </select><br></br><br></br>
            <button className="compute-button" onClick={requestAccount}> Compute </button>
        </div>
    )
}

export default MainDashboard;
