/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// const bloks_tokens = require('./tokens.json')
import bloks_tokens from './tokens.json'
// add EOS
bloks_tokens.unshift({
  name: 'EOS',
  logo: 'https://cdn.iconscout.com/icon/free/png-512/eos-8-646026.png',
  logo_lg: '',
  symbol: 'EOS',
  account: 'eosio.token',
  chain: 'eos'
})

bloks_tokens.unshift({
  name: 'KASDAC',
  logo: 'https://raw.githubusercontent.com/eoscafe/eos-airdrops/master/logos/eosdac.jpg',
  logo_lg: '',
  symbol: 'KASDAC',
  account: 'kasdactokens',
  chain: 'eos'
})

bloks_tokens.unshift({
  name: 'JUNGLE',
  logo: 'https://bloks.io/img/chains/jungle.png',
  logo_lg: '',
  symbol: 'JUNGLE',
  account: 'eosio.token',
  chain: 'eos'
})

export function getLogoForToken(contract, symbol) {
  const token = bloks_tokens.find(
    bt => contract === bt.account && symbol === bt.symbol
  )
  if (token) {
    return token.logo
  } else {
    return 'defaulttokenlogo'
  }
}
