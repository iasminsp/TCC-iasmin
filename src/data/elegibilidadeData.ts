export interface SelectItem {
  codigo: string;
  descricao: string;
}

export const PROCEDENCIA_OPCOES: SelectItem[] = [
  { codigo: '3', descricao: 'Internação Hospitalar' },
  { codigo: '4', descricao: 'Urgência e emergência' },
  { codigo: '5', descricao: 'Cacon/Unacon' },
  { codigo: '16', descricao: 'Iniciativa do paciente ou terceiros' },
  { codigo: '1', descricao: 'Atenção Básica' },
  { codigo: '2', descricao: 'Outros' },
];

export const MODALIDADE_AD_OPCOES: SelectItem[] = [
  { codigo: '1', descricao: 'AD1' },
  { codigo: '2', descricao: 'AD2' },
  { codigo: '3', descricao: 'AD3' },
  { codigo: '4', descricao: 'Inelegível' },
];

export const CUIDADOR_GRAU_OPCOES: SelectItem[] = [
  { codigo: '1', descricao: 'Não possui' },
  { codigo: '2', descricao: 'Cônjuge/companheiro(a)' },
  { codigo: '3', descricao: 'Filho(a)/Enteado(a)' },
  { codigo: '4', descricao: 'Pai/Mãe' },
  { codigo: '5', descricao: 'Avô/Avó' },
  { codigo: '6', descricao: 'Neto(a)' },
  { codigo: '7', descricao: 'Irmão(ã)' },
  { codigo: '8', descricao: 'Outro' },
];

export const CID_EXEMPLOS: SelectItem[] = [
  { codigo: 'T740', descricao: 'Abandono' },
  { codigo: 'R100', descricao: 'Abdome agudo' },
  { codigo: 'N96', descricao: 'Abortamento habitual' },
  { codigo: 'O03', descricao: 'Aborto espontâneo' },
  { codigo: 'O038', descricao: 'Aborto espontâneo - completo ou não espec., com outras complicações' },
  { codigo: 'O037', descricao: 'Aborto espontâneo - completo ou não espec., complicado p/ embolia' },
  { codigo: 'O036', descricao: 'Aborto espontâneo - complicado p/ hemor. excessiva ou tardia' },
  { codigo: 'O035', descricao: 'Aborto espontâneo - complicado p/ infec. do trato genital ou órg. pélvicos' },
  { codigo: 'O039', descricao: 'Aborto espontâneo - sem complicações' },
];

export const CONDICOES_OPCOES = [
  { id: 'acamado', label: 'Acamado' },
  { id: 'domiciliado', label: 'Domiciliado' },
  { id: 'ulceras', label: 'Úlceras / Feridas (grau III ou IV)' },
  { id: 'nutricional', label: 'Acompanhamento nutricional' },
  { id: 'sng', label: 'Uso de sonda naso-gástrica - SNG' },
  { id: 'sne', label: 'Uso de sonda naso-enteral - SNE' },
  { id: 'gastrostomia', label: 'Uso de gastrostomia' },
  { id: 'colostomia', label: 'Uso de colostomia' },
  { id: 'cistostomia', label: 'Uso de cistostomia' },
  { id: 'svd', label: 'Uso de sonda vesical de demora - SVD' },
  { id: 'pre_operatorio', label: 'Acompanhamento pré-operatório' },
  { id: 'pos_operatorio', label: 'Acompanhamento pós-operatório' },
  { id: 'ortese_protese', label: 'Adaptação ao uso de órtese / prótese' },
  { id: 'reabilitacao_domiciliar', label: 'Reabilitação domiciliar' },
  { id: 'paliativos_oncologico', label: 'Cuidados paliativos oncológico' },
  { id: 'paliativos_nao_oncologico', label: 'Cuidados paliativos não-oncológico' },
  { id: 'oxigenoterapia', label: 'Oxigenoterapia domiciliar' },
  { id: 'traqueostomia', label: 'Uso de traqueostomia' },
  { id: 'aspirador_vias_aereas', label: 'Uso de aspirador de vias aéreas para higiene brônquica' },
  { id: 'ventilatorio_cpap', label: 'Suporte ventilatório não invasivo, CPAP' },
  { id: 'ventilatorio_bipap', label: 'Suporte ventilatório não invasivo, BiPAP' },
  { id: 'dialise_peritoneal', label: 'Diálise peritoneal' },
  { id: 'paracentese', label: 'Paracentese' },
  { id: 'medicacao_parenteral', label: 'Medicação parenteral' },
];