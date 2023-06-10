import { Asset, TimePointSec } from '@greymass/eosio'
import { contractState } from 'src/stores/ContractStore'
import { Avatars } from 'src/types/avatarContractTypes'

interface AvatarMintPrice {
  next_base_price: Asset;
  price: {
    mint_price: Asset;
    contract: string;
  };
}

export function calculateMintPrice(avatar: Avatars, avatar_floor_mint_price: Asset): AvatarMintPrice {
  const result: AvatarMintPrice = {} as AvatarMintPrice

  const sec_passed = Math.floor((Date.now() / 1000) - (avatar.modified.toMilliseconds() / 1000))
  const day_sec = 24 * 60 * 60
  // const day_sec = 60
  const days_passed = Math.floor(sec_passed / day_sec)
  console.log('daysPassed:', days_passed)
  const conf = contractState().currentConfig
  const nextBasePrice = avatar.base_price.value * conf.avatar_mint_pct_increase.value
  console.log('nextBasePrice', nextBasePrice)
  result.next_base_price = Asset.from(avatar.base_price.value + nextBasePrice, conf.payment_token.sym)

  // Calculate mint price based on current base price
  const pv = avatar.base_price.value
  console.log('pv', pv)
  console.log('rarity', avatar.rarity.toNumber())

  const r = 0.01 * (5 / avatar.rarity.toNumber())
  console.log('r', r)
  const decay_step = days_passed
  const p = parseFloat((pv * Math.pow(1 - r, decay_step)).toFixed(4))
  console.log('p:', p)
  const mint_price: Asset = Asset.from(p, conf.payment_token.sym)
  console.log('mint_price', mint_price.toString())
  const finalMintQuantity = Math.max(avatar_floor_mint_price.value, mint_price.value)
  console.log('finalMint', finalMintQuantity)

  result.price = {
    mint_price: Asset.from(finalMintQuantity, conf.payment_token.sym),
    contract: conf.payment_token.contract.toString()
  }

  return result
}
