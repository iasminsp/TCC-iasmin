import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';

export const cleanCPF = (cpf: string) => cpf.replace(/\D/g, '');

interface RegisterData {
  nome: string;
  cpfOrEmail: string;
  senha: string;
  cbo: {
    codigo: string;
    descricao: string;
  };
  equipe: string;
  turno: string;
}
export const registerUser = async (data: RegisterData) => {
  const { nome, cpfOrEmail, senha, cbo, equipe, turno } = data;
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

  await setDoc(doc(db, 'users', uid), {
    nome,
    cpf: rawCpf,
    email,
    cbo,
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