const { abi } = require('../Contract')
const fs = require("fs");//.promises;
// const { storage } = require('./Demo')
const { Web3, net } = require('web3');
require('dotenv').config();

// Get the number of functions
// const { abi } = JSON.parse(fs.readFileSync("contracts/contract_2.json"));
const numberOfFunctions = abi.filter(item => item.type === 'function').length;
console.log('Number of functions:', numberOfFunctions);

const functions = abi
    .filter(item => item.type === 'function')
    .map(func => {
        return {
            name: func.name,
            type: func.type,
            // params: func.inputs.length,
            inputs: func.inputs.map(param => ({
                name: param.name,
                type: param.type,
            })),
        };
    });

// Find the constructor in the ABI
const constructor = abi.find(item => item.type === 'constructor');

if (constructor) {
    // Access constructor parameters and their types
    const constructorInputs = constructor.inputs || [];

    console.log('Constructor Parameters:');
    constructorInputs.forEach(param => {
        console.log(`Name: ${param.name}, Type: ${param.type}`);
    });
} else {
    console.log('No constructor found in the ABI.');
}
// Print the first function's name
console.log(functions);
// console.log(constructor);

let address1 = '0x5719D02a5ebe5cA3AE722c703c24Ae5C845d0538';
const ContractAddress = '0x4E568ECf607ebFd1C5dfa702802EfD8fDd4b92A6';
const privateKey = '0xd25190a68016a74d836189a3ef41b32b405efa9ec0271f429f99dc84e5a7d18d';
const transactionObject = {
    from: address1,
    gas: 50000,
    gasPrice: '700000000000'
};
const web3 = new Web3('https://polygon-mumbai.infura.io/v3/312d34ea2d0b473b902a7ad34d993070');
web3.eth.transactionBlockTimeout = 1000;
const benchmark_contract = new web3.eth.Contract(abi, ContractAddress);
benchmark_contract.handleRevert == true

async function main() {
    // const nonce = await web3.eth.getTransactionCount(address1);
    const name = functions[2].name;
    console.log(name);
    const params = [69];
    // const data = benchmark_contract.methods[name](100, 1).encodeABI();
    // const data = web3.eth.abi.encodeFunctionCall(functions[1], params);
    // const signedTx = await web3.eth.accounts.signTransaction({
    //     to: ContractAddress,
    //     data: data,
    //     gas: 130000,
    //     gasPrice: '70000000000',
    //     from: address1,
    //     nonce: Number(nonce)
    // }, privateKey);
    // const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    // console.log(receipt);
    // const tuple = (100);
    const tuple = [1];
    console.log('Hkfek')
    const user = await benchmark_contract.methods[name](...tuple).call();
    console.log(user);
}

main();