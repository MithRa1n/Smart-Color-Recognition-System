import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import tinycolor from 'tinycolor2'
import CustomButton from '../components/CustomButton'

interface MeasurementData {
  id: number
  red: number
  green: number
  blue: number
  createdAt: string
}

export default function MeasurementDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [measurement, setMeasurement] = useState<MeasurementData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMeasurement = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const res = await axios.get<MeasurementData>(`http://localhost:5000/api/measurements/${id}`)
        setMeasurement(res.data)
      } catch (err) {
        setError('Помилка отримання даних')
        console.error('Error fetching measurement:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMeasurement()
  }, [id])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('uk-UA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getColorInfo = (red: number, green: number, blue: number) => {
    const color = tinycolor({ r: red, g: green, b: blue })
    const hsl = color.toHsl()
    return {
      rgb: color.toRgbString(),
      hex: color.toHexString(),
      brightness: hsl.l
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center h-64"
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
        ) : measurement ? (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Деталі вимірювання
              </h1>
              <CustomButton
                handleClick={() => navigate('/')}
                styles="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                title="Повернутися до списку"
              >
                Назад
              </CustomButton>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Час вимірювання
                    </h2>
                    <p className="text-gray-800 dark:text-gray-300">
                      {formatDate(measurement.createdAt)}
                    </p>
                  </div>

                  <div>
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      RGB значення
                    </h2>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-red-500" />
                        <span className="text-gray-800 dark:text-gray-300">
                          R: {measurement.red}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-green-500" />
                        <span className="text-gray-800 dark:text-gray-300">
                          G: {measurement.green}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-blue-500" />
                        <span className="text-gray-800 dark:text-gray-300">
                          B: {measurement.blue}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Візуалізація кольору
                    </h2>
                    {(() => {
                      const colorInfo = getColorInfo(measurement.red, measurement.green, measurement.blue)
                      const textColor = colorInfo.brightness > 50 ? 'text-gray-900' : 'text-white'
                      
                      return (
                        <div className="space-y-4">
                          <div 
                            className={`w-full h-32 rounded-lg shadow-md flex items-center justify-center ${textColor} font-bold text-lg`}
                            style={{ backgroundColor: colorInfo.rgb }}
                          >
                            {colorInfo.hex.toUpperCase()}
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-800 dark:text-gray-300">HEX</p>
                              <p className="text-sm font-mono text-gray-900 dark:text-white">
                                {colorInfo.hex.toUpperCase()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-800 dark:text-gray-300">RGB</p>
                              <p className="text-sm font-mono text-gray-900 dark:text-white">
                                {colorInfo.rgb}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
