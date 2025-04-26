// const io = require('socket.io-client')
import { io } from 'socket.io-client';
// const mediasoupClient = require('mediasoup-client')
import mediasoupClient from 'mediasoup-client';

console.log('[Start] Loading Client Code')

const roomName = window.location.pathname.split('/')[2]
console.log('[Room Name]', roomName)

const socket = io("/mediasoup")
console.log('[Socket] Initialized')

socket.on('connection-success', ({ socketId }) => {
  console.log('abc')

  console.log('[Socket] Connection Success, socketId:', socketId)
  getLocalStream()
})

let device
let rtpCapabilities
let producerTransport
let consumerTransports = []
let audioProducer
let videoProducer
let consumer
let isProducer = false

console.log('[Variables Initialized]', { device, rtpCapabilities, producerTransport, consumerTransports, audioProducer, videoProducer, consumer, isProducer })

let params = {
  encodings: [
    { rid: 'r0', maxBitrate: 100000, scalabilityMode: 'S1T3' },
    { rid: 'r1', maxBitrate: 300000, scalabilityMode: 'S1T3' },
    { rid: 'r2', maxBitrate: 900000, scalabilityMode: 'S1T3' },
  ],
  codecOptions: { videoGoogleStartBitrate: 1000 }
}
console.log('[Media Params]', params)

let audioParams;
let videoParams = { params };
let consumingTransports = [];

const streamSuccess = (stream) => {
  console.log(' streamSuccess called', stream)
  localVideo.srcObject = stream

  audioParams = { track: stream.getAudioTracks()[0], ...audioParams };
  videoParams = { track: stream.getVideoTracks()[0], ...videoParams };

  console.log('[Audio Params]', audioParams)
  console.log('[Video Params]', videoParams)

  joinRoom()
}

const joinRoom = () => {
  console.log('[Function] joinRoom called')
  socket.emit('joinRoom', { roomName }, (data) => {
    console.log('[Socket] joinRoom response', data)
    rtpCapabilities = data.rtpCapabilities
    console.log('[RTP Capabilities Set]', rtpCapabilities)

    createDevice()
  })
}

const getLocalStream = () => {
  console.log('[Function] getLocalStream called')
  navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      width: { min: 640, max: 1920 },
      height: { min: 400, max: 1080 },
    }
  })
  .then(streamSuccess)
  .catch(error => {
    console.error('[getLocalStream Error]', error.message)
  })
}

const createDevice = async () => {
  console.log('[Function] createDevice called')
  try {
    device = new mediasoupClient.Device()
    console.log('[Device Created]', device)

    await device.load({ routerRtpCapabilities: rtpCapabilities })
    console.log('[Device Loaded with RTP Capabilities]', device.rtpCapabilities)

    createSendTransport()
  } catch (error) {
    console.error('[createDevice Error]', error)
    if (error.name === 'UnsupportedError')
      console.warn('[Warning] browser not supported')
  }
}

const createSendTransport = () => {
  console.log('[Function] createSendTransport called')
  socket.emit('createWebRtcTransport', { consumer: false }, ({ params }) => {
    console.log('[Socket] createWebRtcTransport response', params)
    if (params.error) {
      console.error('[createSendTransport Error]', params.error)
      return
    }

    producerTransport = device.createSendTransport(params)
    console.log('[Producer Transport Created]', producerTransport)

    producerTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
      console.log('[ProducerTransport] connect event', dtlsParameters)
      try {
        await socket.emit('transport-connect', { dtlsParameters })
        callback()
      } catch (error) {
        errback(error)
      }
    })

    producerTransport.on('produce', async (parameters, callback, errback) => {
      console.log('[ProducerTransport] produce event', parameters)
      try {
        await socket.emit('transport-produce', {
          kind: parameters.kind,
          rtpParameters: parameters.rtpParameters,
          appData: parameters.appData,
        }, ({ id, producersExist }) => {
          console.log('[transport-produce Response]', { id, producersExist })
          callback({ id })
          if (producersExist) getProducers()
        })
      } catch (error) {
        errback(error)
      }
    })

    connectSendTransport()
  })
}

const connectSendTransport = async () => {
  console.log('[Function] connectSendTransport called')
  audioProducer = await producerTransport.produce(audioParams)
  console.log('[Audio Producer]', audioProducer)
  videoProducer = await producerTransport.produce(videoParams)
  console.log('[Video Producer]', videoProducer)

  audioProducer.on('trackended', () => console.warn('[Audio Producer] Track Ended'))
  audioProducer.on('transportclose', () => console.warn('[Audio Producer] Transport Closed'))

  videoProducer.on('trackended', () => console.warn('[Video Producer] Track Ended'))
  videoProducer.on('transportclose', () => console.warn('[Video Producer] Transport Closed'))
}

const signalNewConsumerTransport = async (remoteProducerId) => {
  console.log('[Function] signalNewConsumerTransport called', remoteProducerId)
  if (consumingTransports.includes(remoteProducerId)) {
    console.log('[Already Consuming]', remoteProducerId)
    return;
  }
  consumingTransports.push(remoteProducerId)

  await socket.emit('createWebRtcTransport', { consumer: true }, ({ params }) => {
    console.log('[Socket] createWebRtcTransport (Consumer) response', params)
    if (params.error) {
      console.error('[createWebRtcTransport Consumer Error]', params.error)
      return
    }

    let consumerTransport
    try {
      consumerTransport = device.createRecvTransport(params)
      console.log('[Consumer Transport Created]', consumerTransport)
    } catch (error) {
      console.error('[createRecvTransport Error]', error)
      return
    }

    consumerTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
      console.log('[ConsumerTransport] connect event', dtlsParameters)
      try {
        await socket.emit('transport-recv-connect', {
          dtlsParameters,
          serverConsumerTransportId: params.id,
        })
        callback()
      } catch (error) {
        errback(error)
      }
    })

    connectRecvTransport(consumerTransport, remoteProducerId, params.id)
  })
}

socket.on('new-producer', ({ producerId }) => {
  console.log('[Socket] new-producer event', producerId)
  signalNewConsumerTransport(producerId)
})

const getProducers = () => {
  console.log('[Function] getProducers called')
  socket.emit('getProducers', producerIds => {
    console.log('[Socket] getProducers response', producerIds)
    producerIds.forEach(signalNewConsumerTransport)
  })
}

const connectRecvTransport = async (consumerTransport, remoteProducerId, serverConsumerTransportId) => {
  console.log('[Function] connectRecvTransport called', { remoteProducerId, serverConsumerTransportId })

  await socket.emit('consume', {
    rtpCapabilities: device.rtpCapabilities,
    remoteProducerId,
    serverConsumerTransportId,
  }, async ({ params }) => {
    if (params.error) {
      console.error('[Consume Error]', params.error)
      return
    }
    console.log('[Consume Params]', params)

    const consumer = await consumerTransport.consume({
      id: params.id,
      producerId: params.producerId,
      kind: params.kind,
      rtpParameters: params.rtpParameters,
    })
    console.log('[Consumer Created]', consumer)

    consumerTransports = [
      ...consumerTransports,
      {
        consumerTransport,
        serverConsumerTransportId: params.id,
        producerId: remoteProducerId,
        consumer,
      },
    ]

    const newElem = document.createElement('div')
    newElem.setAttribute('id', `td-${remoteProducerId}`)

    if (params.kind == 'audio') {
      newElem.innerHTML = `<audio id="${remoteProducerId}" autoplay></audio>`
    } else {
      newElem.setAttribute('class', 'remoteVideo')
      newElem.innerHTML = `<video id="${remoteProducerId}" autoplay class="video"></video>`
    }

    videoContainer.appendChild(newElem)

    const { track } = consumer
    document.getElementById(remoteProducerId).srcObject = new MediaStream([track])

    socket.emit('consumer-resume', { serverConsumerId: params.serverConsumerId })
  })
}

socket.on('producer-closed', ({ remoteProducerId }) => {
  console.log('[Socket] producer-closed event', remoteProducerId)

  const producerToClose = consumerTransports.find(transportData => transportData.producerId === remoteProducerId)
  if (producerToClose) {
    producerToClose.consumerTransport.close()
    producerToClose.consumer.close()

    consumerTransports = consumerTransports.filter(transportData => transportData.producerId !== remoteProducerId)

    videoContainer.removeChild(document.getElementById(`td-${remoteProducerId}`))
    console.log('[Producer Closed and UI Updated]', remoteProducerId)
  }
})

console.log('[End] Client Code Loaded ✅')
