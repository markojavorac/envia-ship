/**
 * Mock ENVÍA Ticket Data for Testing
 *
 * Realistic Guatemala City delivery tickets following the ENVÍA format.
 * Use these for testing the AI ticket analysis without real PDFs.
 */

import type { TicketAnalysisResult } from "./ticket-analysis";

export const MOCK_ENVIA_TICKETS: TicketAnalysisResult[] = [
  {
    success: true,
    ticketNumber: "DTLNO1251452370",
    originAddress:
      "TF009/2a. Avenida 18-21, Zona 10, Gran Centro Comercial Los Próceres, 1er. Nivel Galería Independencia, Local B1-1",
    destinationAddress: "3AV 10-80 ZONA 10 EDIFICIO FORUM ZONA VIVA TORRE I GUATEMALA Z. 10",
    recipientName: "MISHELL MACARIO",
    recipientPhone: "36076628",
    notes:
      '12WWJ-LAPTOP DELL INSPIRON 3535 15.6" FHD, RYZEN 3 7320U, 8GB RAM, 512GB SSD, W11 -BLACK-',
  },
  {
    success: true,
    ticketNumber: "DTLNO2584739201",
    originAddress:
      "Oakland Mall, 18 Calle 5-56, Zona 10, Diagonal 6, Local 234, Nivel 2, Guatemala",
    destinationAddress:
      "5 Avenida 12-31, Zona 9, Edificio Plaza del Sol, Apartamento 503, Guatemala",
    recipientName: "CARLOS ROBERTO HERNANDEZ",
    recipientPhone: "45789632",
    notes: "SMARTPHONE SAMSUNG GALAXY S23 ULTRA 256GB - PHANTOM BLACK - CAJA SELLADA",
  },
  {
    success: true,
    ticketNumber: "DTLNO3698521470",
    originAddress:
      "Pradera Concepción, Carretera a El Salvador Km 16.5, Zona 6 de Mixco, Bodega 12-A",
    destinationAddress: "15 Calle 3-40, Zona 10, Residenciales Las Luces, Casa 15-B, Guatemala",
    recipientName: "ANA LUCIA MORALES",
    recipientPhone: "52147896",
    notes: "ASPIRADORA ROBOT XIAOMI MI ROBOT VACUUM S10+ - BLANCA - IMPORTADA",
  },
  {
    success: true,
    ticketNumber: "DTLNO4712589630",
    originAddress:
      "Fontabella Plaza, 4 Avenida 12-59, Zona 10, Boulevard Los Próceres, Local 45, Guatemala",
    destinationAddress:
      "Calzada Roosevelt 22-43, Zona 11, Colonia Las Charcas, Torre 3, Apartamento 802, Guatemala",
    recipientName: "JOSE FERNANDO LOPEZ",
    recipientPhone: "41236587",
    notes: "SMART TV LG 65 PULGADAS OLED 4K C3 SERIES - NUEVA EN CAJA",
  },
  {
    success: true,
    ticketNumber: "DTLNO5823674190",
    originAddress:
      "Paseo Cayalá, 16 Calle, Zona 16 de Mixco, Centro Comercial, Nivel 1, Local 128, Guatemala",
    destinationAddress: "7 Avenida 6-53, Zona 4, Edificio Century Tower, Oficina 1205, Guatemala",
    recipientName: "MARIA FERNANDA CASTILLO",
    recipientPhone: "58963214",
    notes: "IMPRESORA MULTIFUNCION EPSON ECOTANK L3250 - SISTEMA CONTINUO",
  },
  {
    success: true,
    ticketNumber: "DTLNO6934712580",
    originAddress:
      "Metronorte, Calzada San Juan 31-00, Zona 7, Centro Comercial, Nivel 2, Tienda 201, Guatemala",
    destinationAddress:
      "12 Calle 1-25, Zona 10, Edificio Géminis 10, Torre Norte, Apartamento 604, Guatemala",
    recipientName: "ROBERTO ANTONIO RAMIREZ",
    recipientPhone: "47851236",
    notes: "CONSOLA PLAYSTATION 5 SLIM DIGITAL EDITION 1TB + 2 CONTROLES",
  },
  {
    success: true,
    ticketNumber: "DTLNO7145896320",
    originAddress:
      "Tikal Futura, Calzada Roosevelt, Zona 11, Centro Comercial, Bodega B-08, Nivel Sótano, Guatemala",
    destinationAddress: "1 Avenida 14-61, Zona 10, Edificio Plaza Maritima, Local 3-C, Guatemala",
    recipientName: "CLAUDIA PATRICIA MENDEZ",
    recipientPhone: "32589647",
    notes: "CAFETERA NESPRESSO VERTUO NEXT + 30 CAPSULAS DE BIENVENIDA - GRIS",
  },
  {
    success: true,
    ticketNumber: "DTLNO8256471930",
    originAddress:
      "Naranjo Mall, 4 Avenida 10-01, Zona 4, Centro Comercial, Nivel 3, Local 315-B, Guatemala",
    destinationAddress: "20 Calle 25-12, Zona 13, Residenciales Atlántida, Casa 12, Guatemala",
    recipientName: "JUAN PABLO SILVA",
    recipientPhone: "56321478",
    notes: "TABLET APPLE IPAD AIR 5TA GEN 64GB WI-FI + PENCIL 2DA GEN - AZUL",
  },
  {
    success: true,
    ticketNumber: "DTLNO9367582410",
    originAddress:
      "Plaza Madero Atanasio, 12 Calle 1-25, Zona 10, Centro Comercial, Nivel 1, Tienda 42, Guatemala",
    destinationAddress:
      "Diagonal 6, 12-01, Zona 10, Edificio Interplaza, Torre 2, Oficina 1508, Guatemala",
    recipientName: "ANDREA SOFIA GARCIA",
    recipientPhone: "41852963",
    notes: "LICUADORA VITAMIX E310 EXPLORIAN SERIES - NEGRA - IMPORTADA USA",
  },
  {
    success: true,
    ticketNumber: "DTLNO1047856239",
    originAddress: "Miraflores, 21 Avenida 4-32, Zona 11, Calzada Roosevelt, Bodega 5-A, Guatemala",
    destinationAddress:
      "11 Calle 3-80, Zona 1, Centro Histórico, Edificio El Centro, Apartamento 205, Guatemala",
    recipientName: "LUIS ALBERTO PEREZ",
    recipientPhone: "38947562",
    notes: "BICICLETA ELECTRICA XIAOMI HIMO C20 - BLANCA - 25KM/H MAX",
  },
  {
    success: true,
    ticketNumber: "DTLNO1158963247",
    originAddress:
      "Pradera Xela, 15 Avenida 3-00, Zona 3, Quetzaltenango, Tienda Ancla, Local 101-C",
    destinationAddress:
      "13 Avenida 8-44, Zona 14, Oakland, Residencial Las Victorias, Casa 44-B, Guatemala",
    recipientName: "GABRIELA ALEJANDRA TORRES",
    recipientPhone: "47123658",
    notes: "HORNO MICROONDAS SAMSUNG 1.1 CU FT - ACERO INOXIDABLE - DIGITAL",
  },
  {
    success: true,
    ticketNumber: "DTLNO1269874153",
    originAddress:
      "Centro Comercial Arkadia, Calzada Aguilar Batres 31-00, Zona 12, Nivel 2, Local 228, Guatemala",
    destinationAddress:
      "6 Avenida 9-15, Zona 9, Edificio Etisa, Torre B, Apartamento 1102, Guatemala",
    recipientName: "DIEGO ALEJANDRO RODRIGUEZ",
    recipientPhone: "52639874",
    notes: "AURICULARES SONY WH-1000XM5 NOISE CANCELLING WIRELESS - PLATA",
  },
  {
    success: true,
    ticketNumber: "DTLNO1378945621",
    originAddress:
      "Pradera Zona 10, Boulevard Los Próceres 24-69, Zona 10, Galería Principal, Local 156, Guatemala",
    destinationAddress:
      "10 Calle 2-34, Zona 15, Colonia Tecún Umán, Vista Hermosa I, Casa 2-34-A, Guatemala",
    recipientName: "ISABELLA MARIE GONZALEZ",
    recipientPhone: "41963852",
    notes: "RELOJ INTELIGENTE APPLE WATCH SERIES 9 GPS 45MM - MEDIANOCHE - CAJA SELLADA",
  },
];

/**
 * Get a random mock ticket for testing
 */
export function getRandomMockTicket(): TicketAnalysisResult {
  const randomIndex = Math.floor(Math.random() * MOCK_ENVIA_TICKETS.length);
  return MOCK_ENVIA_TICKETS[randomIndex];
}

/**
 * Get all mock tickets
 */
export function getAllMockTickets(): TicketAnalysisResult[] {
  return MOCK_ENVIA_TICKETS;
}

/**
 * Simulate ticket analysis with random delay
 */
export async function simulateTicketAnalysis(ticketIndex?: number): Promise<TicketAnalysisResult> {
  // Simulate API delay (500-2000ms)
  const delay = Math.random() * 1500 + 500;
  await new Promise((resolve) => setTimeout(resolve, delay));

  if (ticketIndex !== undefined && ticketIndex < MOCK_ENVIA_TICKETS.length) {
    return MOCK_ENVIA_TICKETS[ticketIndex];
  }

  return getRandomMockTicket();
}
