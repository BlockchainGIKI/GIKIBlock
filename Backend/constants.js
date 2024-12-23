config = {
    'Ganache':
    {
        'ContractAddress': '0x6EE511c17634ae82E6fb4DfFFf48f9aaECc42cDf',
        'RPC': 'http://127.0.0.1:7545'
    },
    'Sepolia':
    {
        'ContractAddress': '0x4E568ECf607ebFd1C5dfa702802EfD8fDd4b92A6',
        'RPC': 'https://sepolia.infura.io/v3/312d34ea2d0b473b902a7ad34d993070'
    },
    'Polygon-Mumbai':
    {
        'ContractAddress': '0x4E568ECf607ebFd1C5dfa702802EfD8fDd4b92A6',
        'RPC': 'https://polygon-mumbai.infura.io/v3/312d34ea2d0b473b902a7ad34d993070'
    },
    'Polygon-Amoy':
    {
        'ContractAddress': '0x4E568ECf607ebFd1C5dfa702802EfD8fDd4b92A6',
        'RPC': 'https://polygon-amoy.infura.io/v3/312d34ea2d0b473b902a7ad34d993070'
    },
    'Arbitrum-Goerli':
    {
        'ContractAddress': '0x4E568ECf607ebFd1C5dfa702802EfD8fDd4b92A6',
        'RPC': 'https://arbitrum-goerli.infura.io/v3/312d34ea2d0b473b902a7ad34d993070'
    },
    'Arbitrum-Sepolia':
    {
        'ContractAddress': '0x4e568ecf607ebfd1c5dfa702802efd8fdd4b92a6',
        'RPC': 'https://arbitrum-sepolia.infura.io/v3/312d34ea2d0b473b902a7ad34d993070'
    },
    'Optimism-Goerli':
    {
        'ContractAddress': '0x4E568ECf607ebFd1C5dfa702802EfD8fDd4b92A6',
        'RPC': 'https://optimism-goerli.infura.io/v3/312d34ea2d0b473b902a7ad34d993070'
    },
    'Optimism-Sepolia':
    {
        'ContractAddress': '0x4E568ECf607ebFd1C5dfa702802EfD8fDd4b92A6',
        'RPC': 'https://optimism-sepolia.infura.io/v3/312d34ea2d0b473b902a7ad34d993070'
    },
    'Linea-Goerli':
    {
        'ContractAddress': '0x4E568ECf607ebFd1C5dfa702802EfD8fDd4b92A6',
        'RPC': 'https://linea-goerli.blockpi.network/v1/rpc/public'
    },
    'Local-Eth':
    {
        'ContractAddress': '0x4E568ECf607ebFd1C5dfa702802EfD8fDd4b92A6',
        'RPC': 'http://127.0.0.1:6001'
    },
    'Alfajores':
    {
        'ContractAddress': '0x4E568ECf607ebFd1C5dfa702802EfD8fDd4b92A6',
        'RPC': 'https://celo-alfajores.infura.io/v3/312d34ea2d0b473b902a7ad34d993070'
    },
    'Fuji':
    {
        'ContractAddress': '0x6da203ec5e67d3be693fcbdd53bd40a48abc1932',
        'RPC': 'https://api.avax-test.network/ext/bc/C/rpc'
    }

}

const defaultAddress = '0xcfC7B78cFC88b3817a23C6b9B6f4eCDD497836B4';

module.exports = { config, defaultAddress };