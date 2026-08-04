import { useState } from 'react';
import { api } from '../api';

export default function AuthScreen({ mode, onAuthed }) {
  const isSetup = mode === 'setup';
  const [pw, setPw] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError('');
    if (isSetup) {
      if (pw.length < 4) return setError('Password minimal 4 karakter ya, kak');
      if (pw !== pwConfirm) return setError('Konfirmasi password belum cocok');
    }
    setBusy(true);
    try {
      const res = isSetup ? await api.setup(pw) : await api.login(pw);
      onAuthed(res.token);
    } catch (e) {
      setError(e.message || 'Terjadi kesalahan');
    }
    setBusy(false);
  }

  return (
    <div className="center-screen">
      <div className="blob" style={{ top: -60, left: -60, width: 220, height: 220, background: '#F7D9E8' }} />
      <div className="blob" style={{ bottom: -80, right: -40, width: 260, height: 260, background: '#D6E9FB' }} />
      <div className="blob" style={{ bottom: 40, left: -40, width: 160, height: 160, background: '#E3F5EA' }} />

      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div className="icon-circle">🔒</div>
          <h1 className="f-display" style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>
            {isSetup ? 'Bikin Password Papanmu' : 'Selamat Datang Kembali'}
          </h1>
          <p style={{ fontSize: 13, color: '#A797B5', marginTop: 6 }}>
            {isSetup ? 'Cuma kamu yang bisa buka board ini' : 'Masukkan password untuk masuk'}
          </p>
        </div>

        <input
          type="password"
          className="input"
          placeholder="Password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !isSetup && submit()}
        />
        {isSetup && (
          <input
            type="password"
            className="input"
            placeholder="Konfirmasi password"
            value={pwConfirm}
            onChange={(e) => setPwConfirm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
        )}
        {error && <p className="error-text">{error}</p>}

        <button className="btn-primary" onClick={submit} disabled={busy}>
          {isSetup ? 'Simpan & Mulai' : 'Masuk'}
        </button>

        {!isSetup && (
          <p className="hint-text">
            Lupa password? Hapus file <code>data/data.json</code> di server untuk reset (semua data ikut terhapus).
          </p>
        )}
      </div>
    </div>
  );
}
