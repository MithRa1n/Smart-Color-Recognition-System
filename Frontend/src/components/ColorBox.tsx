import { useEffect, useState } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import tinycolor from 'tinycolor2'

interface RawColor {
  red: number
  green: number
  blue: number
}

interface ProcessedColor {
  rgb: string
  hex: string
  name: string
  hsl: {
    h: number
    s: number
    l: number
  }
}

export default function ColorBox() {
  const [processedColor, setProcessedColor] = useState<ProcessedColor>({
    rgb: 'rgb(0, 0, 0)',
    hex: '#000000',
    name: 'Чорний',
    hsl: { h: 0, s: 0, l: 0 }
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const baseColors = [
    { name: 'Червоний', hex: '#FF0000' },
    { name: 'Зелений', hex: '#00FF00' },
    { name: 'Синій', hex: '#0000FF' },
    { name: 'Жовтий', hex: '#FFFF00' },
    { name: 'Пурпурний', hex: '#FF00FF' },
    { name: 'Бірюзовий', hex: '#00FFFF' },
    { name: 'Білий', hex: '#FFFFFF' },
    { name: 'Чорний', hex: '#000000' },
    { name: 'Сірий', hex: '#808080' },
    { name: 'Оранжевий', hex: '#FFA500' },
    { name: 'Рожевий', hex: '#FFC0CB' },
    { name: 'Коричневий', hex: '#A52A2A' }
  ]

  const calculateColorDistance = (color1: tinycolor.Instance, color2: tinycolor.Instance): number => {
    const rgb1 = color1.toRgb()
    const rgb2 = color2.toRgb()
    
    return Math.sqrt(
      Math.pow(rgb1.r - rgb2.r, 2) +
      Math.pow(rgb1.g - rgb2.g, 2) +
      Math.pow(rgb1.b - rgb2.b, 2)
    )
  }

  const findClosestColor = (color: tinycolor.Instance): string => {
    let minDistance = Number.MAX_VALUE
    let closestColor = 'Невідомий'

    baseColors.forEach(baseColor => {
      const baseColorObj = tinycolor(baseColor.hex)
      const distance = calculateColorDistance(color, baseColorObj)
      
      if (distance < minDistance) {
        minDistance = distance
        closestColor = baseColor.name
      }
    })

    return closestColor
  }

  const normalizeRGB = (red: number, green: number, blue: number): RawColor => {
    const normalizedRed = Math.max(0, Math.min(255, red))
    const normalizedGreen = Math.max(0, Math.min(255, green))
    const normalizedBlue = Math.max(0, Math.min(255, blue))

    console.log('Raw RGB values:', { red, green, blue })
    console.log('Normalized RGB values:', { normalizedRed, normalizedGreen, normalizedBlue })

    return {
      red: normalizedRed,
      green: normalizedGreen,
      blue: normalizedBlue
    }
  }

  const processColor = (raw: RawColor): ProcessedColor => {
    try {
      const normalized = normalizeRGB(raw.red, raw.green, raw.blue)
      const color = tinycolor({ r: normalized.red, g: normalized.green, b: normalized.blue })
      const hsl = color.toHsl()
      
      const processed = {
        rgb: color.toRgbString(),
        hex: color.toHexString(),
        name: findClosestColor(color),
        hsl: {
          h: Math.round(hsl.h),
          s: Math.round(hsl.s),
          l: Math.round(hsl.l)
        }
      }

      console.log('Processed color:', processed)
      return processed
    } catch (error) {
      console.error('Error processing color:', error)
      return {
        rgb: 'rgb(0, 0, 0)',
        hex: '#000000',
        name: 'Помилка',
        hsl: { h: 0, s: 0, l: 0 }
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
          console.log('Latest measurement from API:', latestMeasurement)
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
    const interval = setInterval(fetchColor, 3000)
    return () => clearInterval(interval)
  }, [])

  const textColor = processedColor.hsl.l > 50 ? 'text-gray-900' : 'text-white'

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
              style={{ backgroundColor: processedColor.rgb }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className={`absolute inset-0 flex items-center justify-center ${textColor} font-bold text-lg`}>
                {processedColor.hex.toUpperCase()}
              </div>
            </motion.div>
            <div className="text-center space-y-2">
              <p className="text-lg font-medium text-gray-800 dark:text-white">
                {processedColor.name}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-300">RGB</p>
                  <p className="text-sm font-mono">{processedColor.rgb}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-300">HSL</p>
                  <p className="text-sm font-mono">
                    H: {processedColor.hsl.h}° S: {processedColor.hsl.s}% L: {processedColor.hsl.l}%
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
