import logo from './logo.svg';
import React from 'react';
import './App.css';
import Window from './Canvas/Window';
import Toast from './Toast/Toast';

function App() {

  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    setIsOpen(true)
  }, [])
  return (
    <div className="App">
      <div className='container'>
        <div className='wrapper'>
          {/* <img className='window' src='#' alt='window BG'/> */}
          <Window />
          <Toast isOpen={isOpen} setIsOpen={setIsOpen} content={'터치/클릭하여 쌓인 눈을 닦을 수 있습니다.'} time={3000}/>
        </div>

      </div>
    </div >
  );
}

export default App;
