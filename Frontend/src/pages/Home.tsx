import { motion } from 'framer-motion'
import ColorBox from '../components/ColorBox'
import MeasurementChart from '../components/MeasurementChart'
import HistoryTable from '../components/HistoryTable'

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  }

  return (
    <motion.div 
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="text-center mb-12"
        variants={itemVariants}
      >
        <h1 className="text-4xl font-extrabold text-gray-800 dark:text-red   sm:text-5xl sm:tracking-tight lg:text-6xl">
          Smart Color Recognition
        </h1>
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transform hover:scale-[1.02] transition-transform"
          variants={itemVariants}
        >
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Визначення кольору</h2>
          <ColorBox />
        </motion.div>
        
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transform hover:scale-[1.02] transition-transform"
          variants={itemVariants}
        >
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Графік вимірювань</h2>
          <MeasurementChart />
        </motion.div>
      </div>
      
      <motion.div 
        className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
        variants={itemVariants}
      >
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Історія вимірювань</h2>
        <HistoryTable />
      </motion.div>
    </motion.div>
  )
}
