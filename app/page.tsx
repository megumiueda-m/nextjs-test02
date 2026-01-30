'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      alert(error.message)
    } else {
      alert('ログイン成功！')
      router.push('/mypage')
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>ログイン</h1>

      <input
        style={styles.input}
        type="email"
        placeholder="メールアドレス"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        style={styles.input}
        type="password"
        placeholder="パスワード"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button style={styles.button} onClick={handleLogin} disabled={loading}>
        {loading ? 'ログイン中...' : 'ログイン'}
      </button>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: 400,
    margin: '100px auto',
    padding: 28,
    borderRadius: 12,
    background: '#ffffff',
    boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
  },
  title: {
    marginBottom: 24,
    textAlign: 'center' as const,
    color: '#2f855a', // 濃い緑
  },
  input: {
    width: '100%',
    padding: 12,
    marginBottom: 14,
    fontSize: 16,
    borderRadius: 8,
    border: '1px solid #c6f6d5',
    outline: 'none',
  },
  button: {
    width: '100%',
    padding: 12,
    fontSize: 16,
    fontWeight: 'bold' as const,
    borderRadius: 8,
    border: 'none',
    backgroundColor: '#38a169', // メイン緑
    color: '#fff',
    cursor: 'pointer',
  },
}