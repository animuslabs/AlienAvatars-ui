/* eslint-disable no-async-promise-executor */
// import * as ipfs from 'ip'

import { sleep } from 'src/lib/utils'

const ipfsGateways = [
  // 'https://ipfs.atomichub.io/ipfs/',
  'https://ipfs.eospowerup.io/ipfs/',
  'https://ipfs.animus.is/ipfs/'
]
let defaultIndex = -1

async function pingGateways() {
  const existing = localStorage.getItem('ipfs-defaultIndex')
  if (existing) defaultIndex = parseInt(existing)
  else defaultIndex = 0
  const results:{url:string, latency:number}[] = []
  const finished = await Promise.all(
    ipfsGateways.map(async url => {
      return Promise.race([new Promise(async res => { await sleep(3000); return res(0) }), new Promise(async res => {
        const start = Date.now()
        await fetch(url + 'QmT5tY5YGrZWf6Lq9ZDkgxVvMrBaYCZeGgXkQRrzSBSHzQ', { cache: 'no-cache', mode: 'cors', referrerPolicy: 'no-referrer' }).catch(() => res({ latency: 99999, url }))
        const finished = Date.now()
        results.push({ latency: finished - start, url })
        res({ latency: finished - start, url })
      })])
    })
  )
  const data = finished.filter(el => el !== 0) as {url:string, latency:number}[]
  data.sort((a, b) => a.latency - b.latency)
  defaultIndex = ipfsGateways.findIndex(el => data[0].url === el)
  localStorage.setItem('ipfs-defaultIndex', defaultIndex.toString())
  console.log(data)
}

function readBlob(b) {
  return new Promise(function(resolve, reject) {
    const reader = new FileReader()

    reader.onloadend = function() {
      resolve(reader.result)
    }

    // TODO: hook up reject to reader.onerror somehow and try it

    reader.readAsDataURL(b)
  })
}

function getData(ipfsIndex:number, cid:string) {
  // const response = await fetch(ipfsGateways[ipfsIndex] + cid)
  // const blob = await response.blob()
  // const content = await readBlob(blob)
  // return content
  return ipfsGateways[ipfsIndex] + cid
  // return ipfsGateways[0] + cid
}

export default (cid = '', retry = false):string => {
  if (defaultIndex < 0) pingGateways()
  console.log(defaultIndex)
  console.log()
  if (retry) {
    if (defaultIndex + 1 > ipfsGateways.length - 1) defaultIndex = 0
    else defaultIndex = defaultIndex + 1
  }
  try {
    return getData(defaultIndex, cid)
  } catch (error) {
    console.error(error)

    return getData(defaultIndex, cid)
  }
}
