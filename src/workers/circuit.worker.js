importScripts('https://www.gstatic.com/firebasejs/6.3.3/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/6.3.3/firebase-firestore.js')
importScripts('https://www.gstatic.com/firebasejs/6.3.3/firebase-auth.js')
importScripts('https://www.gstatic.com/firebasejs/6.3.3/firebase-storage.js')

import MerkleTools from '../utils/merkleTools'

const merkleTools = new MerkleTools()

self.addEventListener('message', async function (e) {
  let data = e.data
  switch (data.cmd) {
    case 'get':

      firebase.initializeApp(data.config.fireBase)

      firebase.firestore()
      const FBStorage = firebase.storage()
      const FBStorageRef = FBStorage.ref()
      const FBStorageCircuitRef = FBStorageRef.child('bitcoin_circuits')

      const nTX = data.nTX
      const closestBlock = data.closestBlock
      const closestBlockOffsets = data.closestBlockOffsets

      let canvasSize = 1024
      let canvas = new OffscreenCanvas(canvasSize, canvasSize)

      merkleTools.drawMerkleCanvas(canvas, closestBlock, nTX, canvasSize, closestBlockOffsets)

      let blob = null
      if (typeof canvas.convertToBlob !== 'undefined') {
        blob = await canvas.convertToBlob()
      } else if (typeof canvas.toBlob !== 'undefined') {
        blob = await canvas.toBlob()
      }

      let canvasRef = FBStorageCircuitRef.child(closestBlock.blockData.hash + '.png')

      let complete = false

      try {
        await canvasRef.put(blob)
        complete = true
      } catch (error) {
        complete = false
      }

      let returnData = {
        complete: complete
      }

      self.postMessage(returnData)
      break
    case 'stop':
      self.postMessage('WORKER STOPPED')
      self.close()
      break
    default:
      self.postMessage('Unknown command')
  }
}, false)
