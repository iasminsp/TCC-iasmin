import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';

export const cleanCPF = (cpf: string) => cpf.replace(/\D/g, '');

// Adicionados cargo, equipe e turno
interface RegisterData {
  nome: string;
  cpfOrEmail: string;
  senha: string;
  cargo: string;
  equipe: string;
  turno: string;
}

export const registerUser = async ({ nome, cpfOrEmail, senha, cargo, equipe, turno }: RegisterData) => {
  const isEmail = cpfOrEmail.includes('@');
  const email = isEmail ? cpfOrEmail.trim() : '';
  const rawCpf = isEmail ? '' : cleanCPF(cpfOrEmail);

  if (rawCpf) {
    const cpfRef = doc(db, 'cpfs', rawCpf);
    const cpfSnap = await getDoc(cpfRef);

    if (cpfSnap.exists()) {
      throw new Error('Este CPF já está cadastrado.');
    }
  }

  if (!email) {
    throw new Error('Por favor, informe um e-mail válido para criar a conta.');
  }

  const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
  const uid = userCredential.user.uid;

  // Guarda o perfil com todos os dados do médico na coleção 'users'
  await setDoc(doc(db, 'users', uid), {
    nome,
    cpf: rawCpf,
    email,
    cargo,
    unidade: 'Melhor em Casa - SAD',
    equipe,
    turno,
    createdAt: new Date().toISOString(),
  });

  if (rawCpf) {
    await setDoc(doc(db, 'cpfs', rawCpf), { email });
  }

  return userCredential.user;
};

export const loginUser = async (loginInput: string, senha: string) => {
  let emailParaLogin = loginInput.trim();
  const rawInput = cleanCPF(loginInput);

  if (rawInput.length === 11 && !loginInput.includes('@')) {
    const cpfRef = doc(db, 'cpfs', rawInput);
    const cpfSnap = await getDoc(cpfRef);

    if (!cpfSnap.exists()) {
      throw new Error('CPF não encontrado.');
    }

    emailParaLogin = cpfSnap.data().email;
  }

  const userCredential = await signInWithEmailAndPassword(auth, emailParaLogin, senha);
  return userCredential.user;
};