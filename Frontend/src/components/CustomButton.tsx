import React from 'react';
import { motion } from 'framer-motion';

type CustomButtonType = 'button' | 'submit' | 'reset' | undefined;

interface Props {
  children: React.ReactNode;
  handleClick?: () => void;
  styles: string;
  type?: CustomButtonType;
  title: string;
  disabled?: boolean;
  isLoading?: boolean;
}

const CustomButton = ({
  children,
  handleClick,
  styles,
  type = 'button',
  title,
  disabled = false,
  isLoading = false
}: Props) => {
  return (
    <motion.button
      className={`
        ${styles}
        relative
        inline-flex
        items-center
        justify-center
        font-medium
        transition-all
        duration-200
        focus:outline-none
        focus:ring-2
        focus:ring-offset-2
        focus:ring-blue-500
        disabled:opacity-50
        disabled:cursor-not-allowed
        disabled:hover:transform-none
      `}
      type={type}
      title={title}
      disabled={disabled || isLoading}
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 17
      }}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        children
      )}
    </motion.button>
  );
};

export default CustomButton;