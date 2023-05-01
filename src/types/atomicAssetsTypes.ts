import { Struct, UInt64, Name, UInt32, Asset, UInt8 } from 'anchor-link'

@Struct.type('asset_s')
export class AtomicAssetRow extends Struct {
  @Struct.field(UInt64) asset_id!:UInt64
  @Struct.field(Name) collection_name!:Name
  @Struct.field(Name) schema_name!:Name
  @Struct.field(UInt32) template_id!:UInt32
  @Struct.field(Name) ram_payer!:Name
  @Struct.field(Asset, { array: true }) backed_tokens!:Asset[]
  @Struct.field(UInt8, { array: true }) immutable_serialized_data!:UInt8[]
  @Struct.field(UInt8, { array: true }) mutable_serialized_data!:UInt8[]
}
@Struct.type('atomic_transfer')
export class AtomicTransfer extends Struct {
  @Struct.field(Name) from!:Name
  @Struct.field(Name) to!:Name
  @Struct.field(UInt64, { array: true }) asset_ids!:UInt64[]
  @Struct.field('string') memo!: string
}
