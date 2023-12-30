import logo from './logo.svg';
import './App.css';
import Window from './Canvas/Window';

function App() {
  return (
    <div className="App">
      <div className='container'>
        <div className='wrapper'>
          <img className='window' src='#' alt='window BG'/>
          <Window/>
        </div>

      </div>
    </div>
  );
}

export default App;
