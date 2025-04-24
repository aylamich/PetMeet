import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import Cadastro from './pages/cadastro';
import CadastroPet from './pages/cadastropet';
import LandingPage from './pages/landingpage';

import EventosInscritos from './pages/eventosinscritos';
import Explorar from './pages/explorar';
import EventosCriados from './pages/eventoscriados';

import GerenciarEventos from './pages/gerenciareventos';
import GerenciarUsuarios from './pages/gerenciarusuarios';
import CadastrarAdmin from './pages/cadastraradmin';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/cadastropet" element={<CadastroPet />} />
        <Route path="/landingpage" element={<LandingPage />} />

         {/* Rotas do menu usuário */}
        <Route path="/eventosinscritos" element={<EventosInscritos />} />
        <Route path="/explorar" element={<Explorar />} />
        <Route path="/eventoscriados" element={<EventosCriados />} />

        {/* Rotas do menu adm */}
        <Route path="/gerenciareventos" element={<GerenciarEventos />} />
        <Route path="/gerenciarusuarios" element={<GerenciarUsuarios />} />
        <Route path="/cadastraradmin" element={<CadastrarAdmin />} />

  
      </Routes>
    </Router>
  );
}

export default App;