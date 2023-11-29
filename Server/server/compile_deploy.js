const fs = require("fs").promises;
const solc = require("solc");
const { Web3 } = require('web3');
const { config } = require('../constants');
require('dotenv').config();

// const address = '0x5719D02a5ebe5cA3AE722c703c24Ae5C845d0538';
const privateKey = process.env.PRIVATE_KEY;
const filePath = '/home/user/Documents/Kachra/React/Lesson 1/user_contracts.csv'

async function readFromContractCSV(filePath) {
    try {
        await fs.access(filePath, fs.constants.F_OK);
        console.log(`File at path '${filePath}' exists.`);

        const fileData = await fs.readFile(filePath, 'utf-8');
        const lines = fileData.trim().split('\n');
        const lastLine = lines[lines.length - 1];
        const fields = lastLine.split(',');
        const index = Number(fields[0]) + 1;
        return index;
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.log(`File at path '${filePath}' does not exist.`);
            return 1;
        } else {
            console.error('Error:', err);
            return 1;
        }
    }
}

async function writeToContractCSV(name, network, deployer, address) {
    try {
        await fs.access(filePath, fs.constants.F_OK);
        console.log(`File at path '${filePath}' exists.`);

        const fileData = await fs.readFile(filePath, 'utf-8');
        const lines = fileData.trim().split('\n');
        const lastLine = lines[lines.length - 1];
        const fields = lastLine.split(',');
        const index = Number(fields[0]) + 1;
        const data = [index, name, network, deployer, address, '\n'];
        const csvString = data.join(',');
        await fs.appendFile(filePath, csvString + '\n', 'utf8');
        console.log('CSV data has been written to', filePath);
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.log(`File at path '${filePath}' does not exist.`);
            const headers = ['Sr No.', 'Contract Name', 'Network', 'Deployer Address', 'Contract Address'];
            const data = [1, name, network, deployer, address];
            const csvHeaderData = [headers, data].map(row => row.join(','));
            const csvString = csvHeaderData.join('\n');
            await fs.writeFile(filePath, csvString, 'utf8');
            console.log('CSV data has been written to', filePath);
        } else {
            console.error('Error:', err);
        }
    }
}

async function writeToUserMetricsCSV(address, date, time, network, contract, metric, ftn, value, fee, tx) {
    address = address.toLowerCase();
    const userFilePath = `/home/user/Documents/Kachra/React/Lesson 1/server/user_metrics/${address}.csv`;
    try {
        await fs.access(userFilePath, fs.constants.F_OK);
        console.log(`File at path '${userFilePath}' exists.`);
        const fileData = await fs.readFile(userFilePath, 'utf-8');
        const lines = fileData.trim().split('\n');
        const lastLine = lines[lines.length - 1];
        const fields = lastLine.split(',');
        const index = Number(fields[0]) + 1;
        const data = [index, date, time, network, contract, metric, ftn, value, fee, tx];
        const csvString = data.join(',');
        await fs.appendFile(userFilePath, csvString + '\n', 'utf8');
        console.log('CSV data has been written to', userFilePath);
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.log(`File at path '${userFilePath}' does not exist.`);
            const headers = ['Sr No.', 'Date', 'Time', 'Network', 'Contract Name', 'Metric', 'Function', 'Value', 'Fee', 'Transactions'];
            const data = [1, date, time, network, contract, metric, ftn, value, fee, tx];
            const csvHeaderData = [headers, data].map(row => row.join(','));
            const csvString = csvHeaderData.join('\n');
            await fs.writeFile(userFilePath, csvString, 'utf8');
            console.log('CSV data has been written to', userFilePath);
        } else {
            console.error('Error:', err);
        }
    }
}

function compile(sourceCode, contractName) {
    try {
        // Create the Solidity Compiler Standard Input and Output JSON
        const input = {
            language: "Solidity",
            sources: { main: { content: sourceCode } },
            settings: { outputSelection: { "*": { "*": ["abi", "evm.bytecode"] } } },
        };
        // Parse the compiler output to retrieve the ABI and Bytecode
        const output = solc.compile(JSON.stringify(input));
        if (output.errors) {
            throw new Error(`Compilation error: ${output.errors[0].formattedMessage}`);
        }
        // console.log(output);
        const artifact = JSON.parse(output).contracts.main[contractName];
        return {
            abi: artifact.abi,
            bytecode: artifact.evm.bytecode.object,
        };
    }
    catch (error) {
        console.error("Error during compilation:", error.message);
        // You can choose to throw the error again or return a specific value indicating failure
        return null;
    }
}

async function compileAndDeploy(contractName, sourceCode, network) {
    // Load the contract source code
    // const sourceCode = await fs.readFile('contract_{index}.sol', "utf8");
    // Compile the source code and retrieve the ABI and Bytecode
    const result = compile(sourceCode, contractName);
    if (result) {
        const abi = result.abi;
        const bytecode = result.bytecode;
        // Store the ABI and Bytecode into a JSON file
        const artifact = JSON.stringify({ abi, bytecode }, null, 2);
        const index = await readFromContractCSV(filePath);
        const fileName = `contracts/contract_${index}.json`;
        await fs.writeFile(fileName, artifact);

        // const web3 = new Web3(config[network]['RPC']);
        // web3.eth.accounts.wallet.add(signer);
        // const contract = new web3.eth.Contract(abi);
        // contract.options.data = bytecode;
        return { abi, bytecode };

        // Find the constructor in the ABI
        // let arguments = [];
        // const constructor = abi.find(item => item.type === 'constructor');
        // if (constructor) {
        //     // Access constructor parameters and their types
        //     const constructorInputs = constructor.inputs || [];
        //     console.log('Constructor Parameters:');
        //     constructorInputs.forEach(param => {
        //         console.log(`Name: ${param.name}, Type: ${param.type}`);
        //     });
        // } else {
        //     console.log('No constructor found in the ABI.');
        // }

        // const deployTx = contract.deploy({
        //     data: bytecode,
        //     arguments: arguments
        // });
        // const deployedContract = await deployTx
        //     .send({
        //         from: signer.address,
        //         gas: await deployTx.estimateGas(),
        //     })
        //     .once("transactionHash", (txhash) => {
        //         console.log(`Mining deployment transaction ...`);
        //         console.log(`Transaction Hash: ${txhash}`);
        //     });
        // console.log(`Contract deployed at ${deployedContract.options.address}`);
        // return 'Contract compiled successfully!'
    }
    else {
        console.error("Compilation failed.");
        return 'Compilation failed. Please submit correct Solidity code.';
    }

}

module.exports = { compileAndDeploy, writeToContractCSV, writeToUserMetricsCSV };
