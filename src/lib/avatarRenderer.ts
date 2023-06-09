/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import Konva from 'konva'
import { AvatarPart, Elements } from '../types/avatarParts'
import { Layer } from 'konva/lib/Layer'
import { Stage, StageConfig } from 'konva/lib/Stage'
import { Image } from 'konva/lib/shapes/Image'
import ipfs from 'src/lib/ipfs'
import { avatarRarity, getRarityName } from 'src/lib/utils'

class AvatarRenderer {
  parts: AvatarPart[]
  stage: Stage
  layer: Layer
  bp_order: Elements[]
  rarity:number
  constructor(parts: AvatarPart[]) {
    this.rarity = avatarRarity(parts.map(el => el.rarity))
    this.parts = parts
    const config:StageConfig = {
      width: 2048,
      height: 2048,
      container: 'sauce'
    }
    this.stage = new Konva.Stage(config)
    this.layer = new Konva.Layer()
    this.stage.add(this.layer)
    this.bp_order = [
      'background',
      'legs',
      'torso',
      'head',
      'top',
      'equipment'
    ]
  }

  async getDataUrl(scale = 1) {
    if (scale > 1 || scale < 0.1) {
      throw new Error('scale must be in range 0-1')
    }
    await this.populateStage()
    const uri = this.stage.toDataURL({ pixelRatio: scale })
    return uri
  }

  async populateStage() {
    for (let i = 0; i < this.bp_order.length; i++) {
      const item = this.parts.find(p => p.type === this.bp_order[i])
      if (!item) throw new Error('could not find part ' + this.bp_order[i])
      const bp = await this.loadPart(item)
      this.layer.add(bp)
    }
    const frame = await this.loadFrame()
    this.layer.add(frame)
  }

  async loadPart(part:AvatarPart):Promise<Image> {
    return new Promise((resolve, rej) => {
      try {
        const image:any = new Image({ image: undefined })
        image.onload = () => {
          const p = new Konva.Image({
            image,
            x: part.offset.x - (part.offset.width / 2),
            y: Math.abs(part.offset.y) - (part.offset.height / 2),
            width: part.offset.width,
            height: part.offset.height
          })
          resolve(p)
        }
        image.src = ipfs(part.ipfsRaw)
      } catch (error) {
        rej(error)
      }
    })
  }

  async loadFrame():Promise<any> {
    // console.log(part)
    const src = '/frames/avatar_frame_' + getRarityName(this.rarity) + '.png'
    console.log(src)

    return new Promise(resolve => {
      const image:any = new Image({ image: undefined })
      const width = this.stage.getSize().width
      const height = this.stage.getSize().height

      image.onload = () => {
        const p = new Konva.Image({
          image,
          width,
          height
        })

        resolve(p)
      }

      image.src = src
    })
  }
}
export { AvatarRenderer }
