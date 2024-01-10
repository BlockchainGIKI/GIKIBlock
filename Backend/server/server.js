const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { measureThroughput, measureLatency, writeToFile, measureMetrics, deployContract } = require('./analysis');
const { compileAndDeploy, writeToContractCSV, writeToUserMetricsCSV } = require('./compile_deploy');

const app = express();
app.use(express.json());
app.use(cors());

async function requestHandler(metric, network, API, address, transactions, function_name) {
    console.log("akjfa");
    let txFee = 0;
    let perf = 0;
    return new Promise(async (resolve, reject) => {
        switch (metric) {
            case 'Throughput':
                const { throughput, receipts } = await measureThroughput(network, API, address, transactions, function_name);
                if (function_name != 'getUser') {
                    console.log('in IF');
                    for (let i = 0; i < transactions; i++) {
                        txFee += Number(receipts[i].effectiveGasPrice) * Number(receipts[i].gasUsed);
                    }
                    txFee = (txFee / transactions) / 1e18;
                }
                console.log(`Transactions Per Second (TPS): ${throughput}`);
                console.log(`Average transaction fee (ether): ${txFee}`);
                writeToFile(throughput, txFee, network, function_name, transactions, metric);
                perf = throughput;
                resolve({ perf, txFee });
                break;
            case 'Latency':
                const { latency, transactionFee } = await measureLatency(network, API, address, function_name);
                console.log(latency);
                writeToFile(latency, transactionFee, network, function_name, transactions, metric);
                txFee = transactionFee;
                perf = latency;
                resolve({ perf, txFee });
        }
    });
}

// function getLatestData() {
//     let filePath = "/home/user/Documents/Kachra/React/Lesson 1/latency.csv";
//     fs.access(filePath, fs.constants.F_OK, (err) => {
//         if (err) {
//             console.log(`File at path '${filePath}' does not exist.`);
//         } else {
//             console.log(`File at path '${filePath}' exists.`);
//             fs.readFile(filePath, 'utf-8', (readErr, data) => {
//                 if (readErr) {
//                     console.error('Error reading the file', readErr);
//                 } else {
//                     const lines = data.trim().split('\n');
//                     const lastLine = lines[lines.length - 1];
//                     const fields = lastLine.split(',');
//                     const TransactionHistory = { Sno: fields[0], "Date": fields[1], "Time": fields[2], Blockchain: fields[3], Metric: "Latency", Function: fields[4], Value: fields[5], Fee: "0", "No. of transactions": "0" };
//                     // console.log(TransactionHistory);
//                     return TransactionHistory;
//                 }
//             });
//         }
//     });
// }
function getLatestData(address, callback) {
    console.log(address);
    address = address.toLowerCase();
    let filePath = `/home/user/Documents/Kachra/React/Lesson 1/server/user_metrics/${address}.csv`;
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.log(`File at path '${filePath}' does not exist.`);
            callback(null);  // Notify that there's no data
        } else {
            console.log(`File at path '${filePath}' exists.`);
            fs.readFile(filePath, 'utf-8', (readErr, data) => {
                if (readErr) {
                    console.error('Error reading the file', readErr);
                    callback(null);  // Notify that there's no data
                } else {
                    const lines = data.trim().split('\n');
                    const headers = lines[0].split(',');
                    // Skip the first row (headers) and process the rest
                    const TransactionHistory = lines.slice(1).map((line) => {
                        const fields = line.split(',');
                        const entry = {};
                        // Map each field to its corresponding header
                        headers.forEach((header, index) => {
                            entry[header] = fields[index];
                        });
                        return entry;
                    });
                    callback(TransactionHistory);  // Notify that data is ready
                }
            });
        }
    });
}

// main().catch(err => console.log(err));
// Call the main function and handle any errors that occur
// app.get('/get-latency-data', (req, res) => {
//     // Execute your Node.js script here
//     const result = getLatestData();
//     console.log(result);
//     res.json(result);
// }); deployContract(network, API, ABI, ByteCode, inputValues) 
app.get('/send-user-metric-csv', async (req, res) => {
    try {
        const defaultAccount = '0x5719D02a5ebe5cA3AE722c703c24Ae5C845d0538';
        const { account } = req.query;
        const address = (account ? account : defaultAccount).toLowerCase();
        const filePath = `/home/user/Documents/Kachra/React/Lesson 1/server/user_metrics/${address}.csv`
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=downloaded-file.csv');
        res.send(fileContent);
    } catch (error) {
        console.error('Error reading CSV file:', error);
        res.status(500).send('Internal Server Error');
    }
});
app.get('/write-to-user-metric-csv', async (req, res) => {
    // Execute your Node.js script here
    console.log('At Write to user metric CSV');
    const { address, date, time, network, contract, metric, ftn, value, fee, tx } = req.query;
    console.log(address, date, time, network, contract, metric, ftn, value, fee, tx);
    await writeToUserMetricsCSV(address, date, time, network, contract, metric, ftn, value, fee, tx)
    const result = 'Wrote data to user metric CSV file';
    console.log(result);
    res.json({ result });
});
app.get('/deploy-contract', async (req, res) => {
    // Execute your Node.js script here
    console.log('At Write to Metric CSV');
    const { network, API, ABI, ByteCode, inputValues } = req.query;
    console.log(network, API, ABI, ByteCode, inputValues);
    const result = await deployContract(network, API, ABI, ByteCode, inputValues);
    console.log(result);
    // const result = { address: address, status: true };
    res.json({ result });
});
app.get('/measure-function-call-metrics', async (req, res) => {
    // Execute your Node.js script here
    console.log('At Measure Function Call Metrics');
    const { network, API, ABI, address, metric, ftn, ftnInputs, type, transactions } = req.query;
    // console.log(network, API, ABI, address, metric, ftn, ftnInputs, type, transactions);
    const result = await measureMetrics(network, API, ABI, address, metric, ftn, ftnInputs, type, transactions);
    let txFee = 0;
    if ((type != 'pure' && type != 'view') && metric == 'Throughput') {
        console.log('At IF');
        for (let i = 0; i < transactions; i++) {
            txFee += Number(result.fee[i].effectiveGasPrice) * Number(result.fee[i].gasUsed);
        }
        txFee = (txFee / transactions) / 1e18;
    }
    result.fee = txFee;
    console.log(result);
    res.json({ result });
});
app.get('/write-to-metrics-csv', async (req, res) => {
    // Execute your Node.js script here
    console.log('At Write to Metric CSV');
    const { _perfMetric, _fee, network, selectedFunction, numTransactions, metric } = req.query;
    console.log('Perf: ', _perfMetric, _fee, network, selectedFunction, numTransactions, "Metric: ", metric);
    writeToFile(_perfMetric, _fee, network, selectedFunction, numTransactions, metric);
    const result = 'Wrote data to Metric CSV file';
    console.log(result);
    res.json({ result });
});
app.get('/write-to-contract-csv', async (req, res) => {
    // Execute your Node.js script here
    console.log('At Write to Contract CSV');
    const { name, network, deployer, address } = req.query;
    await writeToContractCSV(name, network, deployer, address)
    const result = 'Wrote data to Contract CSV file';
    console.log(result);
    res.json({ result });
});
app.get('/compile-and-deploy', async (req, res) => {
    // Execute your Node.js script here
    console.log('At Compile and deploy');
    const { contractName, sourceCode, network } = req.query;
    const result = await compileAndDeploy(contractName, sourceCode, network)
    // console.log(result);
    res.json({ result });
});
app.get('/get-latency-data', (req, res) => {
    // Execute your Node.js script here
    const defaultAccount = '0x5719D02a5ebe5cA3AE722c703c24Ae5C845d0538';
    const { account } = req.query;
    getLatestData(account ? account : defaultAccount, result => {
        // console.log(result);
        res.json(result);
    });
});
app.get('/run-node-script', async (req, res) => {
    // Execute your Node.js script here
    const { metric, network, API, address, transactions, function_name } = req.query;
    // console.log(metric, network, API, address, transactions, function_name);
    console.log(metric, network, API, address, transactions, function_name);
    const result = await requestHandler(metric, network, API, address, transactions, function_name).catch(err => console.log(err));
    // const result = require('./your-node-script.js');
    console.log('Result', result);
    res.json({ result });
});

const port = 8000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
