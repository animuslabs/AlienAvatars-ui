import { Name, NameType } from 'anchor-link'
export const appname = 'boidavatars'
export interface NetworkConfig {
  name:string
  chainId:string
  nodeUrl: string
  logo: string
  contracts:Record<string, Name>,
  atomicMarket:string,
  atomicMarketApi:string
}
export const networks:NetworkConfig[] = [
  // default network should be first!!!
  // {
  //   name: 'eos',
  //   chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
  //   nodeUrl: 'https://eos.greymass.com',
  //   logo: 'https://bloks.io/img/chains/eos.png',
  //   contracts: { avatarmk: Name.from('avatar.boid') },
  //   atomicMarket: 'https://eos.atomichub.io',
  //   atomicMarketApi: 'https://eos.api.atomicassets.io'
  // }
  // {
  //   name: "jungle",
  //   chainId: "2a02a0053e5a8cf73a56ba0fda11e4d92e0238a4a2aa74fccf46d5a910746840",
  //   nodeUrl: "https://jungle3.cryptolions.io",
  //   logo: "https://bloks.io/img/chains/jungle.png",
  // },
  // {
  //   name: 'waxtestnet',
  //   chainId: 'f16b1833c747c43682f4386fca9cbb327929334a762755ebec17f6f23c9b8a12',
  //   nodeUrl: 'https://waxtestnet.greymass.com',
  //   logo: 'https://bloks.io/img/chains/wax.png',
  //   contracts: { avatarmk: Name.from('alienavatars') },
  //   atomicMarket: 'https://wax-test.atomichub.io',
  //   atomicMarketApi: 'https://test.wax.api.atomicassets.io'
  // }
  {
    name: 'wax',
    chainId: '1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4',
    nodeUrl: 'https://wax.greymass.com',
    logo: 'https://bloks.io/img/chains/wax.png',
    contracts: { avatarmk: Name.from('alienavatars') },
    atomicMarket: 'https://wax.atomichub.io',
    atomicMarketApi: 'https://wax.api.atomicassets.io'
  }
]

export function getNetworkByChainId(chainId):NetworkConfig {
  return networks.find((n) => n.chainId === chainId) || networks[0] as NetworkConfig
}
export function activeNetwork():NetworkConfig {
  return networks[0] as NetworkConfig
}
