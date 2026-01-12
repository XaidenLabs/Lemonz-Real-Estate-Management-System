export const config = {
  API_BASE_URL: "http://10.175.218.202:5001",
};

console.log("Configured API URL:", config.API_BASE_URL);

export const DOCUMENT_TYPE_DESCRIPTIONS = {
  PP: "Passport",
  DL: "Driver's License",
  ID: "National ID Card",
  BC: "Birth Certificate",
  RC: "Residence Card",

  NG: {
    NIN: "National Identity Number Card",
    BVN: "Bank Verification Number Card",
    VC: "Voter's Card",
  },

  UK: {
    NINO: "National Insurance Number Card",
  },

  FR: {
    CNI: "Carte Nationale d'Identité",
    TS: "Titre de Séjour",
  },

  DE: {
    PA: "Personalausweis",
  },

  IT: {
    CIE: "Carta d'Identità Elettronica",
    CF: "Codice Fiscale",
  },

  ES: {
    NIE: "Número de Identidad de Extranjero",
    DNI: "Documento Nacional de Identidad",
  },

  USA: {
    SSC: "Social Security Card",
    SC: "State ID Card",
    MC: "Medicare Card",
  },

  IN: {
    AA: "Aadhaar Card",
    PAN: "Permanent Account Number Card",
  },

  CN: {
    SFZ: "Resident Identity Card",
    HKB: "Hukou Book",
  },

  SG: {
    NRIC: "National Registration Identity Card",
    FIN: "Foreign Identification Number",
  },

  BR: {
    RG: "Registro Geral",
    CNH: "Carteira Nacional de Habilitação",
    CPF: "Cadastro de Pessoas Físicas",
  },

  MX: {
    INE: "Instituto Nacional Electoral Card",
    RFC: "Registro Federal de Contribuyentes",
  },
};
