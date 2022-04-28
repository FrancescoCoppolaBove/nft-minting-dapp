const RPC_URL = process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL

const config = {
  title: 'BoredAp Dapp',
  description: 'A showcase dapp which is built for you to create your own',
  contractAddress: '0xe174069705FC091298cbAD631A3eF667C413079F',
  presaleMaxMintAmount: 3,
  maxMintAmount: 10,
  price: 0.01
}

const onboardOptions = {
  dappId: process.env.NEXT_PUBLIC_DAPP_ID,
  networkId: 4, // Rinkeby
  darkMode: true,
  walletSelect: {
    heading: 'Connect your wallet',
    description: 'Is gonna be amazing!',
    agreement: {
      version: '1',
      termsUrl: 'https://example.com/terms',
      privacyUrl: 'https://example.com/privacy'
    },
    wallets: [
      { walletName: 'metamask', preferred: true },
      { walletName: 'coinbase', preferred: true },
      { walletName: 'trust', preferred: true, rpcUrl: RPC_URL },
      { walletName: 'ledger', rpcUrl: RPC_URL }
    ]
  },
  walletCheck: [
    { checkName: 'derivationPath' },
    { checkName: 'accounts' },
    { checkName: 'connect' },
    { checkName: 'network' }
  ]
}

export { config, onboardOptions }
