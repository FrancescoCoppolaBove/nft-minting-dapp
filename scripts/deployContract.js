const hre = require('hardhat')
const { MerkleTree } = require('merkletreejs')
const keccak256 = require('keccak256')
const whitelist = require('./whitelist.js')

const BASE_URI = 'ipfs//QmSKxutXLM9J1DEkLixHwBhQwGBEa5JzW12ndt6nCApyRw/'
const proxyRegistryAddressRinkeby = '0xf57b2c51ded3a29e6891aba85459d600256cf317'
const proxyRegistrtAddressMainnet = '0xa5409ec958c83c3f309868babaca7c86dcb077c1'

async function main() {
  // Calculate merkle root from the whitelist array
  const leafNodes = whitelist.map((address) => keccak256(address))
  const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true })
  const root = merkleTree.getRoot()

  // Deploy the contract
  const BoredApes = await hre.ethers.getContractFactory('BoredApe')
  const boredApes = await BoredApes.deploy(BASE_URI, root, proxyRegistryAddressRinkeby)

  await boredApes.deployed()

  console.log('BoredApe deployed to:', boredApes.address)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
