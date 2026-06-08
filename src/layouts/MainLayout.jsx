import '../styles/layout.css'

import { NavLink } from 'react-router-dom'
import { supabase } from '../services/supabase'
import logo from '../assets/logo.png'
import TeamPresenceNotifications from '../components/TeamPresenceNotifications'

import {
  LayoutDashboard,
  Users,
  BriefcaseBusiness,
  Wallet,
  UserCog,
  BarChart3,
  Upload,
  LogOut
} from 'lucide-react'

export default function MainLayout({ children }) {

  async function sair() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="layout">
      <TeamPresenceNotifications />

      <aside className="sidebar">

        <div className="logo">
          <img src={logo} alt="Designer Fácil" />
        </div>

        <nav className="menu">

          <NavLink to="/visao-geral" className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'}>
            <BarChart3 size={18} />
            Visão Geral
          </NavLink>

          <NavLink to="/" className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'}>
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>

          <NavLink to="/clientes" className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'}>
            <Users size={18} />
            Clientes
          </NavLink>

          <NavLink to="/projetos" className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'}>
            <BriefcaseBusiness size={18} />
            Projetos
          </NavLink>

          <NavLink to="/entregas" className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'}>
            <Upload size={18} />
            Entregas
          </NavLink>

          <NavLink to="/financeiro" className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'}>
            <Wallet size={18} />
            Financeiro
          </NavLink>

          <NavLink to="/equipe" className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'}>
            <UserCog size={18} />
            Equipe
          </NavLink>

          

        </nav>

        <button className="logout-button" onClick={sair}>
          <LogOut size={18} />
          Sair
        </button>

      </aside>

      <main className="content">
        {children}
      </main>

    </div>
  )
}