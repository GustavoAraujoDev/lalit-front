import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Sidebar from "./Components/SideBar";
import ProductsPage from "./Components/ProductPage";
import Home from "./Components/Home";
import CaixaPage from "./Components/ProductListCaixa";
import Vendas from "./Components/Vendas";
import Clientes from "./Components/Clientes";
import Login from "./Components/Login";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("isAuthenticated") === "true";
  });

  const ProtectedRoute = ({ component: Component, onLogout }) => {
    return isAuthenticated ? (
      <div className="routes" style={{ display: 'flex', height: '100vh', margin:'0'}}>
        <div
          className="sidebar"
          style={{
            flexBasis: '250px'
          }}
        >
          <Sidebar onLogout={onLogout} />
        </div>
        <div
          className="page-content"
          style={{
            flexGrow: 1,           /* O conteúdo da página ocupará o restante do espaço */
          }}
        >
          <Component />
        </div>
      </div>
    ) : (
      <Navigate to="/" />
    );
  };
  

  const login = () => {
    setIsAuthenticated(true);
    localStorage.setItem("isAuthenticated", "true");
    console.log(isAuthenticated);
  };

  const onLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
    console.log(isAuthenticated);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login login={login} />} />
        <Route
          path="/home"
          element={<ProtectedRoute component={Home} onLogout={onLogout} />}
        />
        <Route
          path="/ProductPage"
          element={
            <ProtectedRoute component={ProductsPage} onLogout={onLogout} />
          }
        />
        <Route
          path="/CaixaPage"
          element={<ProtectedRoute component={CaixaPage} onLogout={onLogout} />}
        />
        <Route
          path="/Vendas"
          element={<ProtectedRoute component={Vendas} onLogout={onLogout} />}
        />
        <Route
          path="/Clientes"
          element={<ProtectedRoute component={Clientes} onLogout={onLogout} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
