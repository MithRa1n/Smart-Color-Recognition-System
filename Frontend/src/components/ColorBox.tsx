import { useEffect, useState } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import chroma from 'chroma-js'

interface RawColor {
  red: number
  green: number
  blue: number
}

interface ProcessedColor {
  rgb: string
  hex: string
  hsl: {
    h: number
    s: number
    l: number
  }
  lab: {
    l: number
    a: number
    b: number
  }
}


export default function ColorBox() {
  const [processedColor, setProcessedColor] = useState<ProcessedColor>({
    rgb: '0, 0, 0',
    hex: '#000000',
    hsl: { h: 0, s: 0, l: 0 },
    lab: { l: 0, a: 0, b: 0 }
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [colorHistory, setColorHistory] = useState<RawColor[]>([])

  const calculateAverageColor = (colors: RawColor[]): RawColor => {
    if (colors.length === 0) return { red: 0, green: 0, blue: 0 }
    
    const sum = colors.reduce((acc, color) => ({
      red: acc.red + color.red,
      green: acc.green + color.green,
      blue: acc.blue + color.blue
    }), { red: 0, green: 0, blue: 0 })

    return {
      red: Math.round(sum.red / colors.length),
      green: Math.round(sum.green / colors.length),
      blue: Math.round(sum.blue / colors.length)
    }
  }

  const normalizeRGB = (red: number, green: number, blue: number): RawColor => {
    const calibration = {
      red: 1.0,
      green: 1.0,
      blue: 1.0
    }

    const calibratedRed = Math.max(0, Math.min(255, red * calibration.red))
    const calibratedGreen = Math.max(0, Math.min(255, green * calibration.green))
    const calibratedBlue = Math.max(0, Math.min(255, blue * calibration.blue))

    return {
      red: Math.round(calibratedRed),
      green: Math.round(calibratedGreen),
      blue: Math.round(calibratedBlue)
    }
  }

  const processColor = (raw: RawColor): ProcessedColor => {
    try {
      const newHistory = [...colorHistory, raw].slice(-5)
      setColorHistory(newHistory)

      const averageColor = calculateAverageColor(newHistory)
      const normalized = normalizeRGB(averageColor.red, averageColor.green, averageColor.blue)
      
      const color = chroma(normalized.red, normalized.green, normalized.blue)
      const hsl = color.hsl()
      const lab = color.lab()
      
      return {
        rgb: color.rgb().join(', '),
        hex: color.hex(),
        hsl: {
          h: Math.round(hsl[0]),
          s: Math.round(hsl[1] * 100),
          l: Math.round(hsl[2] * 100)
        },
        lab: {
          l: Math.round(lab[0]),
          a: Math.round(lab[1]),
          b: Math.round(lab[2])
        }
      }
    } catch (error) {
      console.error('Error processing color:', error)
      return {
        rgb: '0, 0, 0',
        hex: '#000000',
        hsl: { h: 0, s: 0, l: 0 },
        lab: { l: 0, a: 0, b: 0 }
      }
    }
  }

  useEffect(() => {
    const fetchColor = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const res = await axios.get('http://localhost:5000/api/measurements')
        const latestMeasurement = res.data[0]
        
        if (latestMeasurement) {
          const processed = processColor(latestMeasurement)
          setProcessedColor(processed)
        } else {
          setError('Немає доступних вимірювань')
        }
      } catch (err) {
        setError('Помилка отримання даних')
        console.error('Error fetching color:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchColor()
    const interval = setInterval(fetchColor, 1000)
    return () => clearInterval(interval)
  }, [])

  const textColor = processedColor.lab.l > 50 ? 'text-gray-900' : 'text-white'

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center h-32"
          >
            <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-red-500 text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg"
          >
            {error}
          </motion.div>
        ) : (
          <motion.div
            key="color"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div
              className="w-32 h-32 rounded-lg shadow-lg relative overflow-hidden"
              style={{ backgroundColor: `rgb(${processedColor.rgb})` }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className={`absolute inset-0 flex items-center justify-center ${textColor} font-bold text-lg`}>
                {processedColor.hex.toUpperCase()}
              </div>
            </motion.div>
            <div className="text-center space-y-2">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-300">RGB</p>
                  <p className="text-sm font-mono">rgb({processedColor.rgb})</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-300">HSL</p>
                  <p className="text-sm font-mono">
                    H: {processedColor.hsl.h}° S: {processedColor.hsl.s}% L: {processedColor.hsl.l}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-300">LAB</p>
                  <p className="text-sm font-mono">
                    L: {processedColor.lab.l} a: {processedColor.lab.a} b: {processedColor.lab.b}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
