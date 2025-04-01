import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import Cadastro from './pages/cadastro';
import CadastroPet from './pages/cadastropet';
import LandingPage from './pages/landingpage';

import EventosInscritos from './pages/eventosinscritos';
import Explorar from './pages/explorar';
import EventosCriados from './pages/eventoscriados';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/cadastropet" element={<CadastroPet />} />
        <Route path="/landingpage" element={<LandingPage />} />

         {/* Novas rotas do menu */}
        <Route path="/eventosinscritos" element={<EventosInscritos />} />
        <Route path="/explorar" element={<Explorar />} />
        <Route path="/eventoscriados" element={<EventosCriados />} />
      </Routes>
    </Router>
  );
}

export default App;