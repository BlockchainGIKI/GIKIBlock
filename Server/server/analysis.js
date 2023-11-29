const { Web3, net } = require('web3');
const { performance } = require('perf_hooks');
const fs = require('fs');
const { abi } = require('../Contract')
const { config } = require('../constants');
require('dotenv').config();

// Default Ethereum node URL
let privateKey = '0xd25190a68016a74d836189a3ef41b32b405efa9ec0271f429f99dc84e5a7d18d'; // process.env.PRIVATE_KEY;
let providerUrl = '';
let ContractAddress = '';
let address1 = '0x5719D02a5ebe5cA3AE722c703c24Ae5C845d0538';
const transactionObject = {
    from: address1,
    gas: 70000,
    gasPrice: '700000000000'
}

function setWeb3(network, API, address) {
    if (API.status == true) {
        providerUrl = API.url;
    }
    else {
        providerUrl = config[network]['RPC'];
    }
    ContractAddress = config[network]['ContractAddress'];
    if (address.status == true) {
        address1 = address.address;
    }
    else {
        address1 = '0x5719D02a5ebe5cA3AE722c703c24Ae5C845d0538';
    }
    console.log(address1);
    console.log(ContractAddress);
    console.log(providerUrl);
    const web3 = new Web3(providerUrl);
    web3.eth.transactionBlockTimeout = 1000;
    const benchmark_contract = new web3.eth.Contract(abi, ContractAddress);
    benchmark_contract.handleRevert == true
    return { web3, benchmark_contract };
}

async function measureThroughput(network, API, address, transactions, function_name) {
    const { web3, benchmark_contract } = setWeb3(network, API, address);
    const numTransactions = transactions;
    const selectedFunction = function_name;
    return new Promise(async (resolve, reject) => {
        let nonce = await web3.eth.getTransactionCount(address1);
        const promises = [];
        var data = '';
        switch (function_name) {
            case 'createUser':
                data = benchmark_contract.methods.createUser("John Doe", 100).encodeABI();
                console.log(nonce);
                console.log('At createUser');
                break;
            case 'issueMoney':
                data = benchmark_contract.methods.issueMoney(100, 1).encodeABI();
                console.log(nonce);
                console.log('At issueMoney');
                break;
            case 'transferMoney':
                data = benchmark_contract.methods.transferMoney(1, 1, 2).encodeABI();
                console.log(nonce);
                console.log('At transferMoney');
                break;
            default:
                console.log('CUM');
                for (let i = 0; i < numTransactions; i++) {
                    promises.push(new Promise(async (resolve, reject) => {
                        try {
                            const user = await benchmark_contract.methods.getUser(4).call();
                            resolve(user);
                        } catch (error) {
                            reject(error);
                        }
                    }));
                }
        }
        if (selectedFunction != 'getUser') {
            let count = 0;
            for (let i = 0; i < numTransactions; i++) {
                // nonce = await web3.eth.getTransactionCount(address1);
                // console.log(Number(nonce) + i);
                if (network == 'Linea-Goerli' && i == 25) {
                    address1 = '0x1D5359780ee3B0a70C535f1afCc4548F3955A6dA'
                    privateKey = '0xeec1e9e11b8265b7963d26f9eb27e6c4a470ea035e388e8ae7e98003a1925362'
                    nonce = await web3.eth.getTransactionCount(address1);
                    count = 0;
                }
                const signedTx = await web3.eth.accounts.signTransaction({
                    to: ContractAddress,
                    data: data,
                    gas: 130000,
                    gasPrice: '70000000000',
                    from: address1,
                    nonce: Number(nonce) + count
                }, privateKey);
                count += 1;
                // console.log(address1);
                // console.log(privateKey);
                // console.log(Number(nonce) + i);
                promises.push(new Promise(async (resolve, reject) => {
                    try {
                        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
                        // console.log(receipt);
                        resolve(receipt);
                    } catch (error) {
                        reject(error);
                    }
                }));

            }
        }
        console.log('pormi', promises);
        const startTime = performance.now();
        Promise.all(promises)
            .then((receipts) => {
                const endTime = performance.now();
                const duration = ((endTime - startTime) / 1000);
                const throughput = numTransactions / duration;
                console.log(`Transactions Per Second (TPS): ${throughput}`);
                // console.log(receipts);
                resolve({ throughput, receipts });
            })
            .catch((error) => {
                console.error('Error:', error);
                reject(error);
            });
    });
}

async function measureLatency(network, API, address, function_name) {
    const { web3, benchmark_contract } = setWeb3(network, API, address);
    // console.log(web3, benchmark_contract);
    const selectedFunction = function_name;
    return new Promise(async (resolve, reject) => {
        var data = '';
        switch (function_name) {
            case 'createUser':
                console.log('At create user');
                // console.log(config[network]['RPC'])
                data = benchmark_contract.methods.createUser("John Doe", 100).encodeABI();
                break;
            case 'issueMoney':
                console.log('At issue money');
                data = benchmark_contract.methods.issueMoney(100, 1).encodeABI();
                break;
            case 'transferMoney':
                console.log('At transfer money');
                data = benchmark_contract.methods.transferMoney(1, 1, 2).encodeABI();
                break;
            default:
                console.log('At default');
                const startTime = performance.now();
                const user = await benchmark_contract.methods.getUser(1).call(transactionObject);
                const endTime = performance.now();
                const latency = (endTime - startTime) / 1000;
                console.log(`Latency (in seconds): ${latency}`)
                const transactionFee = 0;
                resolve({ latency, transactionFee });
        }
        console.log('Before if')
        if (selectedFunction == 'getUser') {
            return;
        }
        console.log('After switch statement');
        web3.eth.accounts.signTransaction({
            to: ContractAddress,
            data: data,
            gas: 130000,
            gasPrice: '80000000000',
            nonce: await web3.eth.getTransactionCount(address1),
        }, privateKey)
            .then((signedTx) => {
                const startTime = performance.now();
                web3.eth.sendSignedTransaction(signedTx.rawTransaction)
                    .on('receipt', (receipt) => {
                        const endTime = performance.now();
                        const latency = (endTime - startTime) / 1000;
                        console.log(`Latency (in seconds): ${latency}`)
                        // console.log('Transaction receipt:', receipt);
                        const transactionFee = web3.utils.fromWei(receipt.effectiveGasPrice * receipt.gasUsed, "ether");
                        // console.log(transactionFee);
                        resolve({ latency, transactionFee });
                    })
                    .on('error', (error) => {
                        console.error('Transaction error:', error);
                        resolve(error);
                    });
            })
            .catch((error) => {
                console.error('Error signing the transaction:', error);
                resolve(error);
            });
    });
}

async function deployContract(network, API, ABI, ByteCode, inputValues) {
    if (API.status == true) {
        providerUrl = API.url;
    }
    else {
        providerUrl = config[network]['RPC'];
    }
    const web3 = new Web3(providerUrl);
    const contract = new web3.eth.Contract(ABI);
    return new Promise(async (resolve, reject) => {
        try {
            // if (!inputValues) {
            //     inputValues = [];
            // }
            console.log('Input Vlaues: ', inputValues);
            const gas = await contract.deploy({
                data: '0x' + ByteCode,
                arguments: inputValues
            }).estimateGas();
            console.log('Belwo');
            const gasPrice = await web3.eth.getGasPrice();
            console.log(gas, gasPrice);
            const rawTransaction = {
                from: address1,
                gas,
                gasPrice,
                data: contract.deploy({
                    data: '0x' + ByteCode,
                    arguments: inputValues
                }).encodeABI()
            };
            const signedTransaction = await web3.eth.accounts.signTransaction(rawTransaction, privateKey);
            const receipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
            console.log('Contract deployed at:', receipt.contractAddress);
            const deployed = `Contract deployed at: ${receipt.contractAddress}`;
            const address = receipt.contractAddress;
            resolve({ deployed, address });
        } catch (error) {
            console.error('Error deploying smart contract:', error);
            resolve(error);
        }
    });
}


async function measureMetrics(network, API, ABI, address, metric, ftn, ftnInputs, type, transactions) {
    if (API.status == true) {
        providerUrl = API.url;
    }
    else {
        providerUrl = config[network]['RPC'];
    }
    const web3 = new Web3(providerUrl);
    console.log('Before contract builder');
    console.log(address);
    console.log('ABI', ABI);
    const abi = JSON.parse(ABI);
    console.log(abi);
    const contract = new web3.eth.Contract(abi, address);
    console.log('After contract builder');
    return new Promise(async (resolve, reject) => {
        switch (metric) {
            case 'Latency':
                if (type == 'pure' || type == 'view') {
                    try {
                        var response = null;
                        let startTime = 0;
                        if (ftnInputs) {
                            startTime = performance.now();
                            response = await contract.methods[ftn](...ftnInputs).call();
                        }
                        else {
                            startTime = performance.now();
                            response = await contract.methods[ftn]().call();
                        }
                        const endTime = performance.now();
                        const perf = (endTime - startTime) / 1000;
                        console.log(response);
                        console.log('Latency: ', perf);
                        const fee = 0;
                        resolve({ perf, fee });
                    }
                    catch (error) {
                        console.log("Error: ", error);
                        resolve(error);
                    }
                }
                else {
                    console.log('At latnecy else');
                    let data = null;
                    let gas = 0;
                    if (ftnInputs) {
                        data = contract.methods[ftn](...ftnInputs).encodeABI();
                        gas = await contract.methods[ftn](...ftnInputs).estimateGas();
                    }
                    else {
                        data = contract.methods[ftn]().encodeABI();
                        gas = await contract.methods[ftn]().estimateGas();
                    }
                    const signedTx = await web3.eth.accounts.signTransaction({
                        to: address,
                        data: data,
                        gas: gas,
                        gasPrice: '70000000000',
                        from: address1,
                    }, privateKey);
                    try {
                        const startTime = performance.now();
                        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
                        const fee = web3.utils.fromWei(receipt.effectiveGasPrice * receipt.gasUsed, "ether");
                        const endTime = performance.now();
                        const perf = (endTime - startTime) / 1000;
                        console.log(receipt);
                        console.log('Latency: ', perf);
                        console.log('Transaction Fee: ', fee);
                        resolve({ perf, fee });
                    }
                    catch (error) {
                        console.log("Error: ", error);
                        resolve(error);
                    }
                }
                break;
            case 'Throughput':
                const promises = [];
                const nonce = await web3.eth.getTransactionCount(address1);
                let data = null;
                let gas = 0;
                if (ftnInputs) {
                    data = contract.methods[ftn](...ftnInputs).encodeABI();
                    gas = await contract.methods[ftn](...ftnInputs).estimateGas();
                }
                else {
                    data = contract.methods[ftn]().encodeABI();
                    gas = await contract.methods[ftn]().estimateGas();
                }
                for (let i = 0; i < Number(transactions); i++) {
                    if (type == 'pure' || type == 'view') {
                        console.log('AT if TPS');
                        promises.push(new Promise(async (resolve, reject) => {
                            try {
                                var response = null;
                                if (ftnInputs) {
                                    response = await contract.methods[ftn](...ftnInputs).call();
                                }
                                else {
                                    response = await contract.methods[ftn]().call();
                                }
                                // console.log('TPS response: ', response);
                                resolve(response);
                            } catch (error) {
                                reject(error);
                            }
                        }));
                    }
                    else {
                        const signedTx = await web3.eth.accounts.signTransaction({
                            to: address,
                            data: data,
                            gas: gas,
                            gasPrice: '70000000000',
                            from: address1,
                            nonce: Number(nonce) + i
                        }, privateKey);
                        promises.push(new Promise(async (resolve, reject) => {
                            try {
                                const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
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
                    .then((receipts) => {
                        const endTime = performance.now();
                        const duration = (endTime - startTime) / 1000;
                        const perf = Number(transactions) / duration;
                        console.log(`Transactions Per Second (TPS): ${perf}`);
                        console.log(receipts);
                        let fee = 0;
                        if (type == 'pure' || type == 'view') {
                            fee = 0;
                        }
                        else {
                            fee = receipts;
                        }
                        resolve({ perf, fee });
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                        resolve(error);
                    });
        }
    });
}

function writeToFile(_perfMetric, _fee, network, selectedFunction, numTransactions, metric) {
    var filePath = '';
    var headers_latency = [];
    var csvData = [];
    const date = new Date();
    switch (metric) {
        case 'Latency':
            filePath = "/home/user/Documents/Kachra/React/Lesson 1/latency.csv";
            headers_latency = ['Sr No.', 'Date', 'Time', 'Blockchain', 'Function', 'Latency', 'Transaction Fee'];
            csvData = ['1', date.toLocaleDateString(), date.toTimeString(), network, selectedFunction, _perfMetric, _fee, '\n'];
            break;
        case 'Throughput':
            filePath = "/home/user/Documents/Kachra/React/Lesson 1/throughput.csv";
            headers_latency = ['Sr No.', 'Date', 'Time', 'Blockchain', 'Function', 'Number of Transactions', 'Throughput', 'Transaction Fee'];
            csvData = ['1', date.toLocaleDateString(), date.toTimeString(), network, selectedFunction, numTransactions, _perfMetric, _fee, '\n'];
            break;
    }
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.log(`File at path '${filePath}' does not exist.`);
            const csvHeaderData = [headers_latency, csvData].map(row => row.join(','));
            const csvString = csvHeaderData.join('\n');
            fs.writeFile(filePath, csvString, 'utf8', (err) => {
                if (err) {
                    console.error('Error writing to file:', err);
                } else {
                    console.log('CSV data has been written to', filePath);
                }
            });
        } else {
            console.log(`File at path '${filePath}' exists.`);
            fs.readFile(filePath, 'utf-8', (readErr, data) => {
                if (readErr) {
                    console.error('Error reading the file', readErr);
                } else {
                    const lines = data.trim().split('\n');
                    const lastLine = lines[lines.length - 1];
                    const fields = lastLine.split(',');
                    const index = Number(fields[0]) + 1;
                    // const date = new Date();
                    // if (selectedFunction == 'default') {
                    //     _fee = 0;
                    // }
                    // const appendData = [index, date.toLocaleDateString(), date.toTimeString(), options['network'], selectedFunction, _perfMetric, _fee, "\n"];
                    csvData[0] = index;
                    const csvString = csvData.join(',');
                    // const csvString = appendData.join('\n');
                    console.log(csvString);
                    fs.appendFile(filePath, csvString, 'utf8', (err) => {
                        if (err) {
                            console.error('Error writing to file:', err);
                        } else {
                            console.log('CSV data has been written to', filePath);
                        }
                    });

                }
            });
        }
    });
}


module.exports = { setWeb3, measureThroughput, measureLatency, writeToFile, measureMetrics, deployContract };