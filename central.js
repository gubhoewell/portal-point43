// Central de Sistemas Point 43 — login (Firebase Auth e-mail/senha) + documentos protegidos (Firestore).
// A chave abaixo é pública por natureza; quem protege os documentos são as regras do Firestore (só membros).
firebase.initializeApp({
  apiKey: "AIzaSyCopQnYtHCog6SsjxqnVu2PR7L7VcbF4Yw",
  authDomain: "point-43-tarefas.firebaseapp.com",
  projectId: "point-43-tarefas",
  appId: "1:412215956600:web:19d633ec9d1a9478fa898d",
});
const AUTH = firebase.auth(), FS = firebase.firestore();

function erroLogin(e) {
  const c = (e && e.code) || '';
  if (/wrong-password|invalid-credential|user-not-found|invalid-login/.test(c)) return 'E-mail ou senha incorretos.';
  if (c.includes('invalid-email')) return 'E-mail inválido.';
  if (c.includes('too-many-requests')) return 'Muitas tentativas. Aguarde alguns minutos e tente de novo.';
  if (c.includes('network')) return 'Sem conexão. Tente de novo.';
  return 'Não foi possível entrar. Tente de novo.';
}
async function membroAtual() {            // null = logado mas sem cadastro de membro
  const u = AUTH.currentUser;
  const s = await FS.collection('membros').doc(u.uid).get().catch(() => null);
  return s && s.exists ? s.data() : null;
}
function formLogin(onOk) {
  const f = document.createElement('form'); f.className = 'login';
  f.innerHTML = '<input type="email" id="lg_e" placeholder="E-mail" autocomplete="username" required>' +
    '<input type="password" id="lg_s" placeholder="Senha" autocomplete="current-password" required>' +
    '<button type="submit">Entrar</button><div class="login-msg" id="lg_m"></div>' +
    '<a href="#" id="lg_r" class="login-link">Esqueci minha senha</a>';
  f.onsubmit = async ev => {
    ev.preventDefault(); const m = f.querySelector('#lg_m'); m.textContent = '';
    try { await AUTH.signInWithEmailAndPassword(f.querySelector('#lg_e').value.trim(), f.querySelector('#lg_s').value); onOk(); }
    catch (e) { m.textContent = erroLogin(e); }
  };
  f.querySelector('#lg_r').onclick = async ev => {
    ev.preventDefault(); const m = f.querySelector('#lg_m'), em = f.querySelector('#lg_e').value.trim();
    if (!em) { m.textContent = 'Digite seu e-mail acima e clique de novo.'; return; }
    try { await AUTH.sendPasswordResetEmail(em); m.textContent = 'Enviamos um e-mail para redefinir a senha.'; }
    catch (e) { m.textContent = 'Não foi possível enviar. Confira o e-mail.'; }
  };
  return f;
}
