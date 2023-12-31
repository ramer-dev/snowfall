import React from 'react'
import './Toast.css'
import { AnimatePresence, motion } from 'framer-motion'
function Toast({ isOpen, setIsOpen, content, time }) {
    const handleCloseToast = () => {
        setIsOpen(false);
    }

    React.useEffect(() => {
        setTimeout(() => {
            handleCloseToast()
        }, time)
    }, [])
    
    return (
        <AnimatePresence>
            {isOpen && <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className='toast'>{content}</motion.div>}
        </AnimatePresence>
    )
}

export default Toast