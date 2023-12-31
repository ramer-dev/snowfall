import React from 'react'

function Text() {
    const urlRef = React.useRef(new URL(window.location.href))
    const name = urlRef.current.searchParams.get('n');
    let encoded;
    try {
        encoded = decodeURIComponent(escape(atob(name)));
    } catch (error) {
        console.warning('Invalid decoding Base 64 string')
        encoded = ''
    }
    return (
        <div>
            <h1>HAPPY NEW YEAR</h1>
            <h3>{encoded}</h3>
        </div>
    )
}

export default Text