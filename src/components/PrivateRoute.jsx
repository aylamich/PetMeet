import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ children, tipo }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Carregando...</h2>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Acesso Negado</h2>
          <p className="text-gray-700 mb-6">Você precisa estar logado para acessar esta página.</p>
          <a
            href="/login"
            className="inline-block bg-blue-900 text-white py-2 px-6 rounded-md hover:bg-blue-800 transition"
          >
            Ir para Login
          </a>
        </div>
      </div>
    );
  }

  if (tipo && user.tipo !== tipo) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Acesso Negado</h2>
          <p className="text-gray-700 mb-6">Você não tem permissão para acessar esta página.</p>
          <a
            href="/login"
            className="inline-block bg-blue-900 text-white py-2 px-6 rounded-md hover:bg-blue-800 transition"
          >
            Ir para Login
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default PrivateRoute;