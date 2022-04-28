const { createAlchemyWeb3 } = require('@alch/alchemy-web3')
const { MerkleTree } = require('merkletreejs')
const keccak256 = require('keccak256')
const whitelist = require('../scripts/whitelist.js')

const web3 = createAlchemyWeb3(process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL)
import { config } from '../dapp.config'

const contract = require('../artifacts/contracts/BoredApe.sol/BoredApe.json')
const nftContract = new web3.eth.Contract(contract.abi, config.contractAddress)

// Calculate merkle root from the whitelist array

const leafNodes = whitelist.map((address) => keccak256(address))
const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true })
const root = merkleTree.getRoot()

export const getTotalMinted = async () => {
  const totalMinted = await nftContract.methods.totalSupply().call()
  return totalMinted
}

export const getMaxSupply = async () => {
  const maxSupply = await nftContract.methods.maxSupply().call()
  return maxSupply
}

export const isPausedState = async () => {
  const paused = await nftContract.methods.paused().call()
  return paused
}

export const isPublicSaleState = async () => {
  const publicSale = await nftContract.methods.publicM().call()
  return publicSale
}

export const isPreSaleState = async () => {
  const preSale = await nftContract.methods.presaleM().call()
  return preSale
}

export const getNftPrice = async () => {
  const nftPrice = await nftContract.methods._price().call()
  return nftPrice
}

export const preSaleMint = async (mintAmount) => {
  const account = window.ethereum.selectedAddress
  if (!account) {
    return { success: false, status: 'To be able to mint, you need to connect your wallet!' }
  }
  const leaf = keccak256(account)
  const proof = merkleTree.getHexProof(leaf)

  // Verift Merkle Proof
  const isValid = merkleTree.verify(proof, leaf, root)

  if (!isValid) {
    return { success: false, status: 'Invalid Merkle Proof - You are not on the whitelist' }
  }

  const nonce = await web3.eth.getTransactionCount(account, 'latest')

  // Set up our Ethereum transaction
  const tx = {
    to: config.contractAddress,
    from: account,
    value: parseInt(web3.utils.toWei(String(config.price * mintAmount), 'ether')).toString(16), // hex
    gas: String(300000 * mintAmount),
    data: nftContract.methods.presaleMint(account, mintAmount, proof).encodeABI(),
    nonce: nonce.toString(16)
  }

  try {
    const txHash = await window.ethereum.request({ method: 'eth_sendTransaction', params: [tx] })
    return {
      success: true,
      status: (
        <a href={`https://rinkeby.etherscan.io/tx/${txHash}`} target="_blank" rel="noreferrer">
          <p>✅ Check out your transaction on Etherscan:</p>
          <p>{`https://rinkeby.etherscan.io/tx/${txHash}`}</p>
        </a>
      )
    }
  } catch (e) {
    return { success: false, status: `😞 Something went wrong: ${e}` }
  }
}

export const publicMint = async (mintAmount) => {
  const account = window.ethereum.selectedAddress
  if (!account) {
    return { success: false, status: 'To be able to mint, you need to connect your wallet!' }
  }

  const nonce = await web3.eth.getTransactionCount(account, 'latest')

  // Set up our Ethereum transaction
  const tx = {
    to: config.contractAddress,
    from: account,
    value: parseInt(web3.utils.toWei(String(config.price * mintAmount), 'ether')).toString(16), // hex
    gas: String(300000 * mintAmount),
    data: nftContract.methods.publicSaleMint(mintAmount).encodeABI(),
    nonce: nonce.toString(16)
  }

  try {
    const txHash = await window.ethereum.request({ method: 'eth_sendTransaction', params: [tx] })
    return {
      success: true,
      status: (
        <a href={`https://rinkeby.etherscan.io/tx/${txHash}`} target="_blank" rel="noreferrer">
          <p>✅ Check out your transaction on Etherscan:</p>
          <p>{`https://rinkeby.etherscan.io/tx/${txHash}`}</p>
        </a>
      )
    }
  } catch (e) {
    return { success: false, status: `😞 Something went wrong: ${e}` }
  }
}
