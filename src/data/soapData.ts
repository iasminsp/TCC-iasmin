import { CIAP_OPCOES, CID_OPCOES, SelectItem } from './atendimentoData';

export { CIAP_OPCOES, CID_OPCOES, SelectItem };

export const CBO_SOAP_OPCOES: SelectItem[] = [
  { codigo: '225125', descricao: 'Médico Clínico' },
  { codigo: '223505', descricao: 'Enfermeiro' },
  { codigo: '223605', descricao: 'Fisioterapeuta' },
  { codigo: '223710', descricao: 'Nutricionista' },
  { codigo: '251510', descricao: 'Psicólogo Clínico' },
  { codigo: '223810', descricao: 'Fonoaudiólogo' },
  { codigo: '251605', descricao: 'Assistente Social' },
];

export const EQUIPE_OPCOES: SelectItem[] = [
  { codigo: '1', descricao: 'EMAD 1' },
  { codigo: '2', descricao: 'EMAD 2' },
  { codigo: '3', descricao: 'EMAP' },
  { codigo: '4', descricao: 'eSF - Estratégia Saúde da Família' },
];