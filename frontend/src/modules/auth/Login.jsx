import React, { useState } from "react";
import api from "../../utils/api";
import "./Login.css";

export default function Login() {
  const [tenant, setTenant] = useState("modashop");
  const [email, setEmail] = useState("admin");
  const [password, setPassword] = useState("Yaninaadmin2026");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Guardamos el tenant ANTES para que api.js lo reconozca automáticamente
      localStorage.setItem("tenant", tenant);

      const response = await api.post(
        "/auth/login",
        { email, password }
      );

      console.log("Login ok", response.data);
      localStorage.removeItem("roleOverride");
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("authUser", JSON.stringify(response.data.user || {}));
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("Error login:", err);
      setError("Credenciales inválidas o error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <form className="login-box" onSubmit={handleLogin}>
        <h1>Iniciar sesión</h1>
        <p className="subtitle">Panel Tienda de Ropa · SaaS</p>

        <input
          type="text"
          placeholder="Tienda (slug)"
          value={tenant}
          onChange={(e) => setTenant(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Usuario"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Conectando..." : "Ingresar"}
        </button>

        <footer>
          <p>© {new Date().getFullYear()} · Asesoría Tecnológica LY</p>
        </footer>
      </form>
      
    </div>
  );
}
