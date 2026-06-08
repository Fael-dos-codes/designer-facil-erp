import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { supabase } from '../services/supabase'

import MainLayout from '../layouts/MainLayout'

import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import Clientes from '../pages/Clientes'
import Projetos from '../pages/Projetos'
import Financeiro from '../pages/Financeiro'
import Equipe from '../pages/Equipe'
import VisaoGeral from '../pages/Visaogeral'
import Entregas from '../pages/Entregas'

export default function AppRoutes() {

  const [usuario, setUsuario] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {

    async function verificarUsuario() {

      const { data } = await supabase.auth.getSession()

      setUsuario(data.session?.user || null)

      setCarregando(false)
    }

    verificarUsuario()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUsuario(session?.user || null)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }

  }, [])

  if (carregando) {
    return <div>Carregando...</div>
  }

  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/login"
          element={
            usuario ? <Navigate to="/" /> : <Login />
          }
        />

        <Route
          path="/"
          element={
            usuario ? (
              <MainLayout>
                <Dashboard />
              </MainLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/clientes"
          element={
            usuario ? (
              <MainLayout>
                <Clientes />
              </MainLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/projetos"
          element={
            usuario ? (
              <MainLayout>
                <Projetos />
              </MainLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/entregas"
          element={
            usuario ? (
              <MainLayout>
                <Entregas />
              </MainLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/financeiro"
          element={
            usuario ? (
              <MainLayout>
                <Financeiro />
              </MainLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/equipe"
          element={
            usuario ? (
              <MainLayout>
                <Equipe />
              </MainLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        

        <Route
          path="/visao-geral"
          element={
            usuario ? (
              <MainLayout>
                <VisaoGeral />
              </MainLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

      </Routes>

    </BrowserRouter>
  )
}