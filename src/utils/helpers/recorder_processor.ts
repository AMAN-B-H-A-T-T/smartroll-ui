export const startRecording = async () => {
  const audioContext = new AudioContext()
  const sampleRate = audioContext.sampleRate

  await audioContext.audioWorklet.addModule('recorder-processor.js')

  const recorderNode = new AudioWorkletNode(audioContext, 'recorder-processor')
  const mic = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
    },
  })
  const source = audioContext.createMediaStreamSource(mic)
  source.connect(recorderNode)

  let recordedData: any = []

  recorderNode.port.onmessage = (event) => {
    // Mono only: grab channel 0
    const channelData = event.data[0]
    recordedData.push(channelData)
  }

  recorderNode.connect(audioContext.destination) // Optional: to hear while recording

  console.log('Recording...')
  setTimeout(() => {
    recorderNode.disconnect()
    source.disconnect()
    audioContext.close()
    console.log('Recording stopped.')
    const audioBuffer = flattenChunks(recordedData)
    const wavBlob = createWavBlob(audioBuffer, sampleRate)
    downloadBlob(wavBlob, 'recording.wav')
  }, 10000) // 10 seconds
}

function flattenChunks(chunks: any) {
  const length = chunks.reduce((acc: any, cur: any) => acc + cur.length, 0)
  const result = new Float32Array(length)
  let offset = 0
  chunks.forEach((chunk: any) => {
    result.set(chunk, offset)
    offset += chunk.length
  })
  return result
}

function createWavBlob(float32Array: any, sampleRate: any) {
  const buffer = new ArrayBuffer(44 + float32Array.length * 2)
  const view = new DataView(buffer)

  function writeString(view: any, offset: any, str: any) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i))
    }
  }

  function floatTo16BitPCM(output: any, offset: any, input: any) {
    for (let i = 0; i < input.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, input[i]))
      s = s < 0 ? s * 0x8000 : s * 0x7fff
      output.setInt16(offset, s, true)
    }
  }

  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + float32Array.length * 2, true)
  writeString(view, 8, 'WAVE')
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true) // PCM
  view.setUint16(22, 1, true) // Mono
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true) // byte rate
  view.setUint16(32, 2, true) // block align
  view.setUint16(34, 16, true) // bits per sample
  writeString(view, 36, 'data')
  view.setUint32(40, float32Array.length * 2, true)

  floatTo16BitPCM(view, 44, float32Array)

  return new Blob([view], { type: 'audio/wav' })
}

function downloadBlob(blob: any, filename: any) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.style.display = 'none'
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
}
