export interface SelectItem {
  codigo: string;
  descricao: string;
}

export const MODALIDADE_AD_ATENDIMENTO_OPCOES: SelectItem[] = [
  { codigo: '1', descricao: 'AD1' },
  { codigo: '2', descricao: 'AD2' },
  { codigo: '3', descricao: 'AD3' },
];

export const TIPO_ATENDIMENTO_OPCOES: SelectItem[] = [
  { codigo: '1', descricao: 'Atendimento Individual' },
  { codigo: '2', descricao: 'Atendimento Compartilhado' },
  { codigo: '3', descricao: 'Visita Domiciliar' },
];

export const CIAP_OPCOES: SelectItem[] = [
  { codigo: 'R73', descricao: 'ABCESSO/FURÚNCULO NO NARIZ' },
  { codigo: 'W82', descricao: 'ABORTO ESPONTÂNEO' },
  { codigo: 'W83', descricao: 'ABORTO PROVOCADO DE ALTO RISCO' },
  { codigo: 'S17', descricao: 'ABRASÃO/ARRANHÃO/BOLHAS' },
  { codigo: 'P16', descricao: 'ABUSO AGUDO DE ÁLCOOL' },
  { codigo: 'P15', descricao: 'ABUSO CRÔNICO DE ÁLCOOL' },
  { codigo: 'P19', descricao: 'ABUSO DE DROGAS' },
  { codigo: 'P18', descricao: 'ABUSO DE MEDICAÇÃO' },
  { codigo: 'P17', descricao: 'ABUSO DO TABACO' },
  { codigo: 'S96', descricao: 'ACNE' },
  { codigo: '58', descricao: 'ACONSELHAMENTO/ESCUTA TERAPÊUTICA' },
];

export const CID_OPCOES: SelectItem[] = [
  { codigo: 'T740', descricao: 'Abandono' },
  { codigo: 'R100', descricao: 'Abdome agudo' },
  { codigo: 'N96', descricao: 'Abortamento habitual' },
  { codigo: 'O03', descricao: 'Aborto espontâneo' },
  { codigo: 'O038', descricao: 'Aborto espontâneo - completo ou não espec., com outras complicações' },
  { codigo: 'O037', descricao: 'Aborto espontâneo - completo ou não espec., complicado p/ embolia' },
  { codigo: 'O036', descricao: 'Aborto espontâneo - complicado p/ hemor. excessiva ou tardia' },
  { codigo: 'O035', descricao: 'Aborto espontâneo - complicado p/ infec. do trato genital ou órg. pélvicos' },
  { codigo: 'O039', descricao: 'Aborto espontâneo - sem complicações' },
  { codigo: 'O033', descricao: 'Aborto espontâneo - incompleto, com outras complicações' },
  { codigo: 'O032', descricao: 'Aborto espontâneo - incompleto, complicado por embolia' },
];

export const PROCEDIMENTOS_SIA_OPCOES: SelectItem[] = [
  { codigo: '0604380011', descricao: 'ADALIMUMABE 40 MG INJETÁVEL (POR SERINGA PREENCHIDA)' },
  { codigo: '0604380062', descricao: 'ADALIMUMABE 40 MG INJETÁVEL (POR SERINGA PREENCHIDA)' },
  { codigo: '0604380127', descricao: 'ADALIMUMABE 40 MG INJETÁVEL ( POR SERINGA PREENCHIDA)( BIOSSIMILAR A)' },
  { codigo: '0604380135', descricao: 'ADALIMUMABE 40 MG INJETÁVEL (POR SERINGA PREENCHIDA) (BIOSSIMILAR B)' },
  { codigo: '0604380143', descricao: 'ADALIMUMABE 40 MG INJETÁVEL (POR SERINGA PREENCHIDA) (BIOSSIMILAR C)' },
  { codigo: '0101040059', descricao: 'ADMINISTRAÇÃO DE VITAMINA A' },
  { codigo: '0702040010', descricao: 'AGULHA P/ PUNCAO TRANSEPTAL' },
  { codigo: '0604320205', descricao: 'ALENTUZUMABE 10 MG/ML SOLUÇÃO INJETÁVEL' },
  { codigo: '0604240104', descricao: 'ALFA-ALGLICOSIDASE 50 MG PÓ LIOFILIZADO' },
  { codigo: '0604620012', descricao: 'ALFACALCIDOL 0,25 MCG (POR CAPSULA)' },
  { codigo: '0604620020', descricao: 'ALFACALCIDOL 1,0 MCG (POR CAPSULA)' },
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

export const CONDICOES_OPCOES2 = [
  { id: 'permanencia', label: 'Permanência' },
  { id: 'alta_administrativa', label: 'Alta administrativa' },
  { id: 'alta_clinica', label: 'Alta clínica' },
  { id: 'obito', label: 'Óbito' },
  { id: 'ad1', label: 'Atenção Básica (AD1)' },
  { id: 'urgencia_emergencia', label: 'Serviço de urgência e emergência' },
  { id: 'internacao_hospitalar', label: 'Serviço de internação hospitalar' },
];