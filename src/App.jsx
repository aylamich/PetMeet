import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; 
import PrivateRoute from './components/PrivateRoute'; 
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
    <AuthProvider> {/* Envolve todas as rotas com AuthProvider */}
      <Router>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/cadastropet" element={<CadastroPet />} />
          <Route path="/landingpage" element={<LandingPage />} />

          {/* Rotas do menu usuário (protegidas, apenas para tipo="usuario") */}
          <Route path="/eventosinscritos"
            element={
              <PrivateRoute tipo="usuario">
                <EventosInscritos />
              </PrivateRoute>
            }
          />
          <Route path="/explorar"
            element={ 
              <PrivateRoute tipo="usuario">
                <Explorar />
              </PrivateRoute>
            }
          />
          <Route path="/eventoscriados"
            element={
              <PrivateRoute tipo="usuario">
                <EventosCriados />
              </PrivateRoute>
            }
          />

          {/* Rotas do menu admin (protegidas, apenas para tipo="adm") */}
          <Route path="/gerenciareventos"
            element={
              <PrivateRoute tipo="adm">
                <GerenciarEventos />
              </PrivateRoute>
            }
          />
          <Route path="/gerenciarusuarios"
            element={
              <PrivateRoute tipo="adm">
                <GerenciarUsuarios />
              </PrivateRoute>
            }
          />
          <Route path="/cadastraradmin"
            element={
              <PrivateRoute tipo="adm">
                <CadastrarAdmin />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;