// generated by @greymass/abi2core

import {
  Asset,
  Checksum256,
  Float32,
  Name,
  Struct,
  TimePointSec,
  TypeAlias,
  UInt32,
  UInt64,
  UInt8,
  ExtendedAsset
} from '@greymass/eosio'

@TypeAlias('vector<uint32>')
class VectorUint32_ extends UInt32 {}

@Struct.type('packadd')
export class Packadd extends Struct {
    @Struct.field(Name) edition_scope!: Name
    @Struct.field(UInt64) template_id!: UInt64
    @Struct.field(Asset) base_price!: Asset
    @Struct.field(Asset) floor_price!: Asset
    @Struct.field('string') pack_name!: string
    @Struct.field(UInt8, { array: true }) rarity_distribution!: UInt8[]
}

@Struct.type('packdel')
export class Packdel extends Struct {
    @Struct.field(Name) edition_scope!: Name
    @Struct.field(UInt64) template_id!: UInt64
}

@Struct.type('avatardel')
export class Avatardel extends Struct {
    @Struct.field(Name) edition_scope!: Name
    @Struct.field(Name) avatar_template_name!: Name
}

@Struct.type('buypack')
export class Buypack extends Struct {
    @Struct.field(Name) buyer!: Name
    @Struct.field(Name) edition_scope!: Name
    @Struct.field(UInt64) template_id!: UInt64
}

@Struct.type('claimpack')
export class Claimpack extends Struct {
    @Struct.field(Name) owner!: Name
    @Struct.field(UInt64) pack_asset_id!: UInt64
}

@Struct.type('editionset')
export class Editionset extends Struct {
    @Struct.field(Name) edition_scope!: Name
    @Struct.field(Asset) avatar_floor_mint_price!: Asset
    @Struct.field(Asset) avatar_template_price!: Asset
}

@Struct.type('editiondel')
export class Editiondel extends Struct {
    @Struct.field(Name) edition_scope!: Name
}

@Struct.type('setparts')
export class Setparts extends Struct {
    @Struct.field(Name) edition_scope!: Name
    @Struct.field(UInt32, { array: true }) template_ids!: UInt32[]
    @Struct.field(UInt8, { array: true }) rarity_scores!: UInt8[]
}

@Struct.type('extended_symbol')
export class ExtendedSymbol extends Struct {
    @Struct.field(Asset.Symbol) sym!: Asset.Symbol
    @Struct.field(Name) contract!: Name
}

@Struct.type('config')
export class Config extends Struct {
    @Struct.field('bool') freeze!: boolean
    @Struct.field(Name) moderator!: Name
    @Struct.field('bool') auto_claim_packs!: boolean
    @Struct.field('bool') whitelist_enabled!: boolean
    @Struct.field(ExtendedSymbol) payment_token!: ExtendedSymbol
    @Struct.field(Name) rng!: Name
    @Struct.field(Name) collection_name!: Name
    @Struct.field(Name) parts_schema!: Name
    @Struct.field(Name) avatar_schema!: Name
    @Struct.field(Name) pack_schema!: Name
    @Struct.field(Float32) avatar_mint_pct_increase!: Float32
}

@Struct.type('setconfig')
export class Setconfig extends Struct {
    @Struct.field(Config, { optional: true }) cfg?: Config
}

@Struct.type('clrconfig')
export class Clrconfig extends Struct {
}

@Struct.type('withdraw')
export class Withdraw extends Struct {
    @Struct.field(Name) owner!: Name
    @Struct.field(ExtendedAsset) value!: ExtendedAsset
}

@Struct.type('open')
export class Open extends Struct {
    @Struct.field(Name) owner!: Name
    @Struct.field(ExtendedSymbol) token!: ExtendedSymbol
    @Struct.field(Name) ram_payer!: Name
}

@Struct.type('namepair')
export class Namepair extends Struct {
    @Struct.field('string') avatarpart!: string
    @Struct.field('string') name!: string
}

@Struct.type('assemble_set')
export class AssembleSet extends Struct {
    @Struct.field(Name) creator!: Name
    @Struct.field(Name) avatar_name!: Name
    @Struct.field(UInt32, { array: true }) template_ids!: UInt32[]
    @Struct.field(UInt8) rarity_score!: UInt8
    @Struct.field(Checksum256) identifier!: Checksum256
    @Struct.field(UInt32) max_mint!: UInt32
    @Struct.field(Namepair, { array: true }) avatarpart_names!: Namepair[]
    @Struct.field(Name) scope!: Name
    @Struct.field(Asset) base_price!: Asset
}

@Struct.type('assemble')
export class Assemble extends Struct {
    @Struct.field(AssembleSet) set_data!: AssembleSet
}

@Struct.type('finalize')
export class Finalize extends Struct {
    @Struct.field(Checksum256) identifier!: Checksum256
    @Struct.field('string') ipfs_hash!: string
}

@Struct.type('mintavatar')
export class Mintavatar extends Struct {
    @Struct.field(Name) minter!: Name
    @Struct.field(Name) avatar_name!: Name
    @Struct.field(Name) scope!: Name
    @Struct.field(UInt64) holding_tool_id!: UInt64
}

@Struct.type('receiverand')
export class Receiverand extends Struct {
    @Struct.field(UInt64) assoc_id!: UInt64
    @Struct.field(Checksum256) random_value!: Checksum256
}

@Struct.type('setowner')
export class Setowner extends Struct {
    @Struct.field(Name) owner!: Name
    @Struct.field(Name) new_owner!: Name
    @Struct.field(Name) avatar_name!: Name
    @Struct.field(Name) scope!: Name
}

@Struct.type('whitelistadd')
export class Whitelistadd extends Struct {
    @Struct.field(Name) account!: Name
}

@Struct.type('whitelistdel')
export class Whitelistdel extends Struct {
    @Struct.field(Name) account!: Name
}

@Struct.type('test')
export class Test extends Struct {
    @Struct.field(UInt64) id!: UInt64
}

@Struct.type('clravatars')
export class Clravatars extends Struct {
    @Struct.field(Name) scope!: Name
}

@Struct.type('clrqueue')
export class Clrqueue extends Struct {
}

@Struct.type('clrunpack')
export class Clrunpack extends Struct {
}

@Struct.type('clrwhitelist')
export class Clrwhitelist extends Struct {
}

@Struct.type('whitelist')
export class Whitelist extends Struct {
    @Struct.field(Name) account!: Name
}

@Struct.type('avatars')
export class Avatars extends Struct {
    @Struct.field(Name) avatar_name!: Name
    @Struct.field(UInt32) template_id!: UInt32
    @Struct.field(Name) creator!: Name
    @Struct.field(Checksum256) identifier!: Checksum256
    @Struct.field(UInt8) rarity!: UInt8
    @Struct.field(UInt32) mint!: UInt32
    @Struct.field(UInt32) max_mint!: UInt32
    @Struct.field(TimePointSec) modified!: TimePointSec
    @Struct.field(Asset) base_price!: Asset
    @Struct.field(UInt32, { array: true }) avatarparts!: UInt32[]
}

@Struct.type('queue')
export class Queue extends Struct {
    @Struct.field(Name) avatar_name!: Name
    @Struct.field(Checksum256) identifier!: Checksum256
    @Struct.field(Name) work!: Name
    @Struct.field(Name) scope!: Name
    @Struct.field(AssembleSet) set_data!: AssembleSet
    @Struct.field(TimePointSec) inserted!: TimePointSec
}

@Struct.type('deposits')
export class Deposits extends Struct {
    @Struct.field(UInt64) id!: UInt64
    @Struct.field(ExtendedAsset) balance!: ExtendedAsset
}

@Struct.type('editions')
export class Editions extends Struct {
    @Struct.field(Name) edition_scope!: Name
    @Struct.field(Asset) avatar_floor_mint_price!: Asset
    @Struct.field(Asset) avatar_template_price!: Asset
    @Struct.field(UInt64) avatar_template_count!: UInt64
    @Struct.field(UInt8) num_avatarparts!: UInt8
    @Struct.field(VectorUint32_, { array: true }) part_template_ids!: VectorUint32_[]
}

@Struct.type('packs')
export class Packs extends Struct {
    @Struct.field(UInt64) template_id!: UInt64
    @Struct.field(Asset) base_price!: Asset
    @Struct.field(Asset) floor_price!: Asset
    @Struct.field(TimePointSec) last_sold!: TimePointSec
    @Struct.field('string') pack_name!: string
}

@Struct.type('pack_data')
export class PackData extends Struct {
    @Struct.field(Name) edition!: Name
    @Struct.field(UInt8) pack_size!: UInt8
    @Struct.field(UInt8, { array: true }) rarity_distribution!: UInt8[]
}

@Struct.type('unpack')
export class Unpack extends Struct {
    @Struct.field(UInt64) pack_asset_id!: UInt64
    @Struct.field(Name) owner!: Name
    @Struct.field(PackData) pack_data!: PackData
    @Struct.field(UInt32, { array: true }) claimable_template_ids!: UInt32[]
    @Struct.field(TimePointSec) inserted!: TimePointSec
}
