import { useEffect, useState } from 'react'
import axios from 'axios'
import CustomButton from './CustomButton'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import tinycolor from 'tinycolor2'

interface Measurement {
  id: number
  red: number
  green: number
  blue: number
  createdAt: string
}

export default function HistoryTable() {
  const [history, setHistory] = useState<Measurement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const res = await axios.get<Measurement[]>('http://localhost:5000/api/measurements')
        setHistory(res.data)
      } catch (err) {
        setError('Помилка отримання даних')
        console.error('Error fetching history:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHistory()
    const interval = setInterval(fetchHistory, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleView = (id: string) => {
    navigate(`/measurements/${id}`)
  }

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
    <div className="overflow-x-auto">
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
          <motion.table
            key="table"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
          >
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Дата
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Колір
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  RGB
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Дії
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {history.map((item, index) => {
                const colorInfo = getColorInfo(item.red, item.green, item.blue)
                const textColor = colorInfo.brightness > 50 ? 'text-gray-900' : 'text-white'
                
                return (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-8 h-8 rounded-lg shadow-md"
                          style={{ backgroundColor: colorInfo.rgb }}
                        />
                        <span className={`text-sm font-medium ${textColor}`}>
                          {colorInfo.hex.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {colorInfo.rgb}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <CustomButton
                        handleClick={() => handleView(item.id.toString())}
                        styles="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                        title="Переглянути деталі"
                      >
                        Деталі
                      </CustomButton>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </motion.table>
        )}
      </AnimatePresence>
    </div>
  )
}
