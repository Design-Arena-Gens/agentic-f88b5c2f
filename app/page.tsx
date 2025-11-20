'use client'

import { useState, useRef, useEffect } from 'react'

export default function Home() {
  const [text, setText] = useState('Hello YouTube!')
  const [backgroundColor, setBackgroundColor] = useState('#1a1a1a')
  const [textColor, setTextColor] = useState('#ffffff')
  const [fontSize, setFontSize] = useState(60)
  const [duration, setDuration] = useState(5)
  const [isGenerating, setIsGenerating] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generateVideo = async () => {
    setIsGenerating(true)
    setVideoUrl(null)

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas to 720p (1280x720)
    canvas.width = 1280
    canvas.height = 720

    // Create video stream
    const stream = canvas.captureStream(30) // 30 fps
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp8',
      videoBitsPerSecond: 2500000 // 2.5 Mbps for good quality
    })

    const chunks: Blob[] = []
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data)
      }
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' })
      const url = URL.createObjectURL(blob)
      setVideoUrl(url)
      setIsGenerating(false)
    }

    mediaRecorder.start()

    // Animate the canvas
    let startTime = Date.now()
    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000

      if (elapsed >= duration) {
        mediaRecorder.stop()
        return
      }

      // Clear canvas
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw text
      ctx.fillStyle = textColor
      ctx.font = `bold ${fontSize}px Arial`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // Add text with animation (fade in, then fade out)
      const fadeInDuration = 0.5
      const fadeOutDuration = 0.5
      const fadeOutStart = duration - fadeOutDuration

      let opacity = 1
      if (elapsed < fadeInDuration) {
        opacity = elapsed / fadeInDuration
      } else if (elapsed > fadeOutStart) {
        opacity = (duration - elapsed) / fadeOutDuration
      }

      ctx.globalAlpha = opacity
      ctx.fillText(text, canvas.width / 2, canvas.height / 2)
      ctx.globalAlpha = 1

      // Add timestamp
      ctx.font = '20px Arial'
      ctx.fillStyle = textColor
      ctx.globalAlpha = 0.5
      ctx.fillText(`${elapsed.toFixed(1)}s / ${duration}s`, canvas.width / 2, canvas.height - 40)
      ctx.globalAlpha = 1

      requestAnimationFrame(animate)
    }

    animate()
  }

  const downloadVideo = () => {
    if (!videoUrl) return
    const a = document.createElement('a')
    a.href = videoUrl
    a.download = 'youtube-video-720p.webm'
    a.click()
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '10px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          YouTube Video Creator
        </h1>
        <p style={{
          textAlign: 'center',
          color: '#666',
          marginBottom: '40px',
          fontSize: '18px'
        }}>
          Create custom 720p videos for YouTube
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
              Text Content
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #e0e0e0',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
              Background Color
            </label>
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              style={{
                width: '100%',
                height: '46px',
                borderRadius: '8px',
                border: '2px solid #e0e0e0',
                cursor: 'pointer'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
              Text Color
            </label>
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              style={{
                width: '100%',
                height: '46px',
                borderRadius: '8px',
                border: '2px solid #e0e0e0',
                cursor: 'pointer'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
              Font Size: {fontSize}px
            </label>
            <input
              type="range"
              min="20"
              max="120"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              style={{
                width: '100%',
                height: '46px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
              Duration: {duration}s
            </label>
            <input
              type="range"
              min="1"
              max="30"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              style={{
                width: '100%',
                height: '46px'
              }}
            />
          </div>
        </div>

        <div style={{
          background: '#f5f5f5',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginTop: 0, color: '#333', marginBottom: '15px' }}>Preview (720p: 1280x720)</h3>
          <div style={{
            position: 'relative',
            width: '100%',
            paddingBottom: '56.25%', // 16:9 aspect ratio
            background: '#000',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <canvas
              ref={canvasRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={generateVideo}
            disabled={isGenerating}
            style={{
              padding: '15px 40px',
              fontSize: '18px',
              fontWeight: '600',
              background: isGenerating ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              transition: 'transform 0.2s',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
            }}
            onMouseOver={(e) => {
              if (!isGenerating) {
                e.currentTarget.style.transform = 'translateY(-2px)'
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            {isGenerating ? 'Generating Video...' : 'Generate Video'}
          </button>

          {videoUrl && (
            <button
              onClick={downloadVideo}
              style={{
                padding: '15px 40px',
                fontSize: '18px',
                fontWeight: '600',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              Download Video
            </button>
          )}
        </div>

        {videoUrl && (
          <div style={{
            marginTop: '30px',
            background: '#f5f5f5',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h3 style={{ marginTop: 0, color: '#333', marginBottom: '15px' }}>Generated Video</h3>
            <video
              src={videoUrl}
              controls
              style={{
                width: '100%',
                borderRadius: '8px',
                maxHeight: '500px'
              }}
            />
            <p style={{
              marginTop: '15px',
              color: '#666',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              Video format: WebM (VP8) • Resolution: 1280x720 (720p) • Frame rate: 30fps
            </p>
          </div>
        )}

        <div style={{
          marginTop: '40px',
          padding: '20px',
          background: '#e3f2fd',
          borderRadius: '10px',
          borderLeft: '4px solid #2196f3'
        }}>
          <h4 style={{ marginTop: 0, color: '#1976d2' }}>Tips for YouTube:</h4>
          <ul style={{ color: '#555', lineHeight: '1.8', paddingLeft: '20px' }}>
            <li>This tool creates 720p (1280x720) videos suitable for YouTube</li>
            <li>Videos are generated in WebM format (VP8 codec)</li>
            <li>YouTube accepts WebM, MP4, MOV, AVI, and other formats</li>
            <li>Recommended: Convert to MP4 (H.264) for maximum compatibility if needed</li>
            <li>Customize text, colors, and duration to create your content</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
