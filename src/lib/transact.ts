import { Action, Asset, ExtendedAsset, Name, PermissionLevel, UInt64 } from 'anchor-link'
import * as config from 'src/lib/config'
import { link } from 'src/lib/linkManager'
import { globalState } from 'src/stores/GlobaleStore'
import { useUser } from 'src/stores/UserStore'
import { AtomicTransfer } from 'src/types/atomicAssetsTypes'
import { Buypack, Claimpack, Deposits, Mintavatar, Open, Packs, Withdraw } from 'src/types/avatarContractTypes'
import { Transfer } from 'src/types/eosioTokenTypes'

export async function ndxSwap(eosQuantity:number) {
  const user = useUser()
  const authorization = [user.loggedIn.auth as PermissionLevel]
  // const memo = ''//
  const data = Transfer.from({
    from: authorization[0].actor,
    to: 'agg.newdex',
    memo: '{"type":"buy-market","symbol":"boidcomtoken-boid-eos","price":"0.0000000","channel":"web"}',
    quantity: Asset.from(`${eosQuantity.toFixed(4)} EOS`)
  })
  const action = Action.from({ data, authorization, name: 'transfer', account: 'eosio.token' })
  const result = await link.transact({ action })
  if (result) console.log(result.transaction.id)
}

async function depositAction(quantity: Asset): Promise<Action[]> {
  // return []
  if (typeof quantity === 'string') quantity = Asset.from(quantity)
  const user = useUser()
  const global = globalState()
  const actions:Action[] = []
  const avatarContract = config.activeNetwork().contracts.avatarmk
  const userAccount = user.loggedIn.auth?.actor
  const paymentToken = global.paymentToken
  if (!userAccount) throw (new Error('user not logged in'))
  const authorization = [user.loggedIn.auth as PermissionLevel]
  const existingBalance = (await link.rpc.get_table_rows({ scope: userAccount.toString(), code: avatarContract, table: 'deposits', type: Deposits })).rows.filter(el => {
    console.log(el.balance.quantity.symbol.toString())
    console.log(typeof quantity)
    console.log(el.balance.quantity.symbol.equals(quantity.symbol))
    return el.balance.quantity.symbol.equals(quantity.symbol)
  })
  console.log('existingBalance:', existingBalance)
  if (existingBalance.length === 0) {
    const openAction = Action.from({
      data: Open.from({
        owner: userAccount,
        ram_payer: userAccount,
        token: { contract: paymentToken.contract, sym: Asset.Symbol.from(paymentToken.symbol) }
      }),
      account: avatarContract,
      authorization,
      name: 'open'
    })
    actions.push(openAction)
  }
  const depositData = Transfer.from({
    from: authorization[0].actor,
    to: avatarContract,
    memo: 'deposit',
    quantity
  })
  const depositAction = Action.from({ data: depositData, authorization, name: 'transfer', account: paymentToken.contract })
  actions.push(depositAction)
  return actions
}

export async function purchasePacks(pack:Packs, quantity = 1) {
  const user = useUser()
  const global = globalState()
  if (!user.loggedIn.auth) throw (new Error('user not logged in'))
  const authorization = [user.loggedIn.auth as PermissionLevel]
  const avatarContract = config.activeNetwork().contracts.avatarmk
  const userAccount = user.loggedIn.auth?.actor
  let actions:Action[] = []
  const payment = Asset.from(pack.floor_price.toString())
  payment.units.multiply(quantity)
  actions = actions.concat([...(await depositAction(payment))])
  const buyData = Buypack.from({ buyer: userAccount, edition_scope: global.currentEdition, template_id: pack.template_id })
  const buyAction = Action.from({ data: buyData, account: avatarContract, authorization, name: 'buypack' })
  for (const empty of [...Array(quantity)]) { actions.push(buyAction) }
  const result = await link.transact({ actions })
  if (result) console.log(result.transaction.id)
}

export async function withdraw(owner:Name, value:ExtendedAsset) {
  const user = useUser()
  if (!user.loggedIn.auth) throw (new Error('user not logged in'))
  const avatarContract = config.activeNetwork().contracts.avatarmk
  const authorization = [user.loggedIn.auth as PermissionLevel]
  const action = Action.from({
    data: Withdraw.from({ owner, value }),
    account: avatarContract,
    name: 'withdraw',
    authorization
  })
  const result = await link.transact({ action })
  if (result) console.log(result.transaction.id)
}

export async function openPacks(packIds:string[]) {
  const user = useUser()

  if (!user.loggedIn.auth) throw (new Error('user not logged in'))
  const authorization = [user.loggedIn.auth as PermissionLevel]
  const avatarContract = config.activeNetwork().contracts.avatarmk
  const userAccount = user.loggedIn.auth?.actor.toString()
  if (!userAccount) throw (new Error('user not logged in'))
  const actions:Action[] = []
  for (const packId of packIds) {
    const transferData:AtomicTransfer = AtomicTransfer.from({
      from: Name.from(userAccount),
      to: Name.from(avatarContract),
      asset_ids: [UInt64.from(packId)],
      memo: 'unpack'
    })
    const transferAction = Action.from({ data: transferData, account: 'atomicassets', authorization, name: 'transfer' })
    actions.push(transferAction)
  }
  const result = await link.transact({ actions })
  if (result) console.log(result.transaction.id)
}
export async function claimPack(packId:UInt64) {
  const user = useUser()

  if (!user.loggedIn || !user.loggedIn.auth) throw (new Error('user not logged in'))
  const authorization = [user.loggedIn.auth as PermissionLevel]
  const avatarContract = config.activeNetwork().contracts.avatarmk
  const userAccount = user.loggedIn.account

  const data:Claimpack = Claimpack.from({
    owner: userAccount,
    pack_asset_id: packId
  })

  const action = Action.from({ data, account: avatarContract, authorization, name: 'claimpack' })
  const result = await link.transact({ action })
  if (result) console.log(result.transaction.id)
}
export async function claimPacks(packIds:UInt64[]) {
  const user = useUser()
  if (!user.loggedIn || !user.loggedIn.auth) throw (new Error('user not logged in'))
  const authorization = [user.loggedIn.auth as PermissionLevel]
  const avatarContract = config.activeNetwork().contracts.avatarmk
  const userAccount = user.loggedIn.account
  const actions:Action[] = []
  for (const packId of packIds) {
    const data:Claimpack = Claimpack.from({
      owner: userAccount,
      pack_asset_id: packId
    })
    const action = Action.from({ data, account: avatarContract, authorization, name: 'claimpack' })
    actions.push(action)
  }
  const result = await link.transact({ actions })
  if (result) console.log(result.transaction.id)
}
export async function createTemplate(templateName:string, partIds:string[], deposit:Asset) {
  const user = useUser()

  if (!user.loggedIn.auth) throw (new Error('user not logged in'))
  const authorization = [user.loggedIn.auth as PermissionLevel]
  const avatarContract = config.activeNetwork().contracts.avatarmk
  const userAccount = user.loggedIn.auth?.actor
  if (!userAccount) throw (new Error('user not logged in'))
  const actions:Action[] = await depositAction(deposit)
  // const actions:Action[] = []
  const transferData:AtomicTransfer = AtomicTransfer.from({
    from: userAccount,
    to: Name.from(avatarContract),
    asset_ids: partIds.map(el => UInt64.from(el)),
    memo: 'assemble:' + templateName
  })
  const transferAction = Action.from({ data: transferData, account: 'atomicassets', authorization, name: 'transfer' })
  actions.push(transferAction)
  const result = await link.transact({ actions })
  if (result) console.log(result.transaction.id.toString())
}

export async function mintAvatar(avatarName:Name, deposit:Asset) {
  const user = useUser()
  const global = globalState()
  if (!user.loggedIn.auth) throw (new Error('user not logged in'))
  const authorization = [user.loggedIn.auth as PermissionLevel]
  const avatarContract = config.activeNetwork().contracts.avatarmk
  const userAccount = user.loggedIn.auth?.actor
  if (!userAccount) throw (new Error('user not logged in'))
  const actions:Action[] = await depositAction(deposit)
  const data = Mintavatar.from({
    minter: userAccount,
    avatar_name: avatarName,
    scope: global.currentEdition
  })
  const mintAvatarAction = Action.from({ data, account: avatarContract, authorization, name: 'mintavatar' })
  actions.push(mintAvatarAction)
  const result = await link.transact({ actions })
  if (result) console.log(result.transaction.id.toString())
}
