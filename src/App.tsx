import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Diagnostico from './pages/Diagnostico';
import Resultado from './pages/Resultado'; // <--- Tem que ter isso

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/diagnostico" element={<Diagnostico />} />
        <Route path="/resultado" element={<Resultado />} /> {/* <--- E isso */}
      </Routes>
    </BrowserRouter>
  )
}

export default App;