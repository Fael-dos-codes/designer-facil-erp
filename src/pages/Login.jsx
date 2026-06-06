import { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, Rocket, Users, TrendingUp, Star } from 'lucide-react'
import { supabase } from '../services/supabase'
import logo from '../assets/logo.png'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)

  async function fazerLogin(e) {
    e.preventDefault()
    setErro('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha
    })

    if (error) {
      setErro('Email ou senha inválidos.')
      return
    }

    window.location.href = '/'
  }

  return (
    <div className="login-page">

      <section className="login-hero">

        <div className="login-logo-area">
          <img src={logo} alt="Designer Fácil" />
        </div>

        <div className="login-badge">
          <span></span>
          Tráfego Pago
        </div>

        <h1>
          Sua marca merece crescer <strong>de verdade.</strong>
        </h1>

        <p>
          Da estratégia ao design, do tráfego pago às redes sociais —
          a gente cuida de tudo para o seu negócio aparecer, encantar e converter.
        </p>

        <div className="login-results">
          <div>
            <Users size={30} />
            <strong>100+</strong>
            <span>clientes atendidos</span>
          </div>

          <div>
            <TrendingUp size={30} />
            <strong>3×</strong>
            <span>retorno médio</span>
          </div>

          <div>
            <Star size={30} />
            <strong>5★</strong>
            <span>avaliação</span>
          </div>
        </div>

        <div className="login-mini-cta">
          <Rocket size={32} />
          <div>
            <span>Leva menos de 2 minutos · Sem compromisso</span>
            <strong>Quero crescer agora →</strong>
          </div>
        </div>

      </section>

      <section className="login-form-wrapper">

        <form className="login-card" onSubmit={fazerLogin}>

          <div className="login-form-logo">
            <img src={logo} alt="Designer Fácil" />
          </div>

          <h2>Acessar painel</h2>

          <p>Entre com suas credenciais administrativas.</p>

          {erro && (
            <div className="login-error">
              {erro}
            </div>
          )}

          <div className="login-field">
            <label>Email</label>

            <div>
              <Mail size={20} />

              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="login-field">
            <label>Senha</label>

            <div>
              <Lock size={20} />

              <input
                type={mostrarSenha ? 'text' : 'password'}
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setMostrarSenha(!mostrarSenha)}
              >
                {mostrarSenha ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </div>

          <button className="login-button" type="submit">
            Entrar no sistema →
          </button>

          <div className="login-footer">
            Designer Fácil · Gestão Empresarial
          </div>

        </form>

      </section>

    </div>
  )
}