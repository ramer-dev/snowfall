import React from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import './Share.css'


function Share({ isOpen, setIsOpen }) {

    const handleCloseModal = () => {
        setIsOpen(false);
    }

    const encodeToBase64 = (str) => {
        return btoa(unescape(encodeURIComponent(str)))
    }

    const makeURL = () => {
        if (inputRef.current) {
            let url = window.location.host + '?n=' + encodeToBase64(inputRef.current.value);

            window.navigator.clipboard.writeText(url).then(() => {
                window.alert('링크 복사가 완료되었습니다.')
            })
        }

    }

    const inputRef = React.useRef(null);

    return (
        <AnimatePresence>
            {isOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className='backdraw' onClick={handleCloseModal} />
                <div className='modal'>
                    <h4>공유하고싶은 분의 이름을 적어주세요.</h4>
                    <div className='modal-div'>
                        <input type='text' placeholder='이름' ref={inputRef}></input>
                        <button type='button' className='modal-confirm' onClick={makeURL}>링크 복사</button>
                    </div>
                </div>
            </motion.div>}
        </AnimatePresence>
    )
}

export default Share