import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';

// Remove pontos, traços e espaços (deixa apenas números)
export const cleanCPF = (cpf: string) => cpf.replace(/\D/g, '');

interface RegisterData {
  nome: string;
  cpfOrEmail: string;
  senha: string;
}

// 1. Função de Cadastro (Crie sua conta!)
export const registerUser = async ({ nome, cpfOrEmail, senha }: RegisterData) => {
  const isEmail = cpfOrEmail.includes('@');
  const email = isEmail ? cpfOrEmail.trim() : '';
  const rawCpf = isEmail ? '' : cleanCPF(cpfOrEmail);

  // Se o utilizador digitou um CPF, verifica se já existe na coleção 'cpfs'
  if (rawCpf) {
    const cpfRef = doc(db, 'cpfs', rawCpf);
    const cpfSnap = await getDoc(cpfRef);

    if (cpfSnap.exists()) {
      throw new Error('Este CPF já está cadastrado.');
    }
  }

  // O Firebase Auth necessita obrigatoriamente de um e-mail.
  // Caso o utilizador tenha informado CPF no campo, podes ajustar o fluxo para pedir o e-mail no formulário.
  if (!email) {
    throw new Error('Por favor, informe um e-mail válido para criar a conta.');
  }

  // Cria a conta no Firebase Authentication
  const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
  const uid = userCredential.user.uid;

  // Guarda o perfil do utilizador na coleção 'users'
  await setDoc(doc(db, 'users', uid), {
    nome,
    cpf: rawCpf,
    email,
    createdAt: new Date().toISOString(),
  });

  // Se houver CPF, guarda o mapeamento na coleção 'cpfs' para permitir o login por CPF depois
  if (rawCpf) {
    await setDoc(doc(db, 'cpfs', rawCpf), { email });
  }

  return userCredential.user;
};

// 2. Função de Login (Hello Sing in!!)
export const loginUser = async (loginInput: string, senha: string) => {
  let emailParaLogin = loginInput.trim();
  const rawInput = cleanCPF(loginInput);

  // Se forem 11 dígitos e não tiver '@', assume que é um CPF e busca o e-mail associado
  if (rawInput.length === 11 && !loginInput.includes('@')) {
    const cpfRef = doc(db, 'cpfs', rawInput);
    const cpfSnap = await getDoc(cpfRef);

    if (!cpfSnap.exists()) {
      throw new Error('CPF não encontrado.');
    }

    emailParaLogin = cpfSnap.data().email;
  }

  // Autentica via Firebase Auth usando o e-mail resolvido
  const userCredential = await signInWithEmailAndPassword(auth, emailParaLogin, senha);
  return userCredential.user;
};