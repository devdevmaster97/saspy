import { NextRequest, NextResponse } from 'next/server';

interface Departamento {
  sigla: string;
  nome: string;
}

interface Cidade {
  id: number;
  nome: string;
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Adicionar headers CORS para garantir acesso em todos dispositivos
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  try {
    const searchParams = request.nextUrl.searchParams;
    const uf = searchParams.get('uf');

    if (!uf) {
      return NextResponse.json(
        { success: false, message: 'Departamento é obrigatório' },
        { status: 400, headers }
      );
    }

    console.log(`Buscando cidades para Departamento: ${uf}`);

    // Mapeamento de cidades por departamento do Paraguai
    const cidadesPorDepartamento: Record<string, any[]> = {
      'AS': [
        { id: 1, nome: 'Asunción' }
      ],
      'CN': [
        { id: 2, nome: 'Fernando de la Mora' },
        { id: 3, nome: 'Lambaré' },
        { id: 4, nome: 'Luque' },
        { id: 5, nome: 'Mariano Roque Alonso' },
        { id: 6, nome: 'Ñemby' },
        { id: 7, nome: 'San Antonio' },
        { id: 8, nome: 'San Lorenzo' },
        { id: 9, nome: 'Villa Elisa' },
        { id: 10, nome: 'Villeta' },
        { id: 11, nome: 'Ypacaraí' },
        { id: 12, nome: 'Ypané' },
        { id: 13, nome: 'Limpio' },
        { id: 14, nome: 'Capiatá' },
        { id: 15, nome: 'Itá' },
        { id: 16, nome: 'Guarambaré' },
        { id: 17, nome: 'J. Augusto Saldívar' },
        { id: 18, nome: 'Nueva Italia' },
        { id: 19, nome: 'Areguá' }
      ],
      'AP': [
        { id: 20, nome: 'Ciudad del Este' },
        { id: 21, nome: 'Hernandarias' },
        { id: 22, nome: 'Itakyry' },
        { id: 23, nome: 'Juan León Mallorquín' },
        { id: 24, nome: 'Presidente Franco' },
        { id: 25, nome: 'Minga Guazú' },
        { id: 26, nome: 'Mbaracayú' },
        { id: 27, nome: 'Santa Rosa del Monday' },
        { id: 28, nome: 'Naranjal' },
        { id: 29, nome: 'Iruña' },
        { id: 30, nome: 'Santa Rita' },
        { id: 31, nome: 'Minga Porá' },
        { id: 32, nome: 'Itaipú Reserva' },
        { id: 33, nome: 'Yguazú' },
        { id: 34, nome: 'Los Cedrales' }
      ],
      'IT': [
        { id: 35, nome: 'Encarnación' },
        { id: 36, nome: 'Bella Vista' },
        { id: 37, nome: 'Capitán Meza' },
        { id: 38, nome: 'Capitán Miranda' },
        { id: 39, nome: 'Carlos Antonio López' },
        { id: 40, nome: 'Carmen del Paraná' },
        { id: 41, nome: 'Coronel Bogado' },
        { id: 42, nome: 'Edelira' },
        { id: 43, nome: 'Fram' },
        { id: 44, nome: 'General Artigas' },
        { id: 45, nome: 'General Delgado' },
        { id: 46, nome: 'Hohenau' },
        { id: 47, nome: 'Itapúa Poty' },
        { id: 48, nome: 'Jesús' },
        { id: 49, nome: 'José Leandro Oviedo' },
        { id: 50, nome: 'La Paz' },
        { id: 51, nome: 'Leandro N. Alem' },
        { id: 52, nome: 'Mayor Otaño' },
        { id: 53, nome: 'Natalio' },
        { id: 54, nome: 'Nueva Alborada' },
        { id: 55, nome: 'Obligado' },
        { id: 56, nome: 'Pirapó' },
        { id: 57, nome: 'San Cosme y Damián' },
        { id: 58, nome: 'San Pedro del Paraná' },
        { id: 59, nome: 'San Rafael del Paraná' },
        { id: 60, nome: 'Tomás Romero Pereira' },
        { id: 61, nome: 'Trinidad' },
        { id: 62, nome: 'Yatytay' }
      ],
      'CG': [
        { id: 63, nome: 'Coronel Oviedo' },
        { id: 64, nome: 'Caaguazú' },
        { id: 65, nome: 'Cnel. Domínguez' },
        { id: 66, nome: 'Dr. Cecilio Báez' },
        { id: 67, nome: 'Dr. Juan Eulogio Estigarribia' },
        { id: 68, nome: 'Dr. J.L. Mallorquín' },
        { id: 69, nome: 'Eugenio A. Garay' },
        { id: 70, nome: 'José Domingo Ocampos' },
        { id: 71, nome: 'La Pastora' },
        { id: 72, nome: 'Mariscal López' },
        { id: 73, nome: 'Nueva Londres' },
        { id: 74, nome: 'R.I.3 Corrales' },
        { id: 75, nome: 'Raúl Arsenio Oviedo' },
        { id: 76, nome: 'Repatriación' },
        { id: 77, nome: 'San Joaquín' },
        { id: 78, nome: 'San José de los Arroyos' },
        { id: 79, nome: 'Santa Rosa del Mbutuy' },
        { id: 80, nome: 'Simón Bolívar' },
        { id: 81, nome: 'Vaquería' },
        { id: 82, nome: 'Yhú' }
      ],
      'SP': [
        { id: 83, nome: 'San Pedro de Ycuamandiyú' },
        { id: 84, nome: 'Antequera' },
        { id: 85, nome: 'Capiibary' },
        { id: 86, nome: 'Choré' },
        { id: 87, nome: 'General Elizardo Aquino' },
        { id: 88, nome: 'General Francisco Isidoro Resquín' },
        { id: 89, nome: 'Guayaibí' },
        { id: 90, nome: 'Itacurubí del Rosario' },
        { id: 91, nome: 'Liberación' },
        { id: 92, nome: 'Lima' },
        { id: 93, nome: 'Nueva Germanía' },
        { id: 94, nome: 'San Pablo' },
        { id: 95, nome: 'San Vicente Pancholo' },
        { id: 96, nome: 'Santa Rosa del Aguaray' },
        { id: 97, nome: 'Tacuatí' },
        { id: 98, nome: 'Unión' },
        { id: 99, nome: 'Villa del Rosario' },
        { id: 100, nome: 'Yataity del Norte' },
        { id: 101, nome: 'Yrybucuá' },
        { id: 102, nome: '25 de Diciembre' }
      ],
      'CO': [
        { id: 103, nome: 'Caacupé' },
        { id: 104, nome: 'Altos' },
        { id: 105, nome: 'Arroyos y Esteros' },
        { id: 106, nome: 'Atyrá' },
        { id: 107, nome: 'Caraguatay' },
        { id: 108, nome: 'Emboscada' },
        { id: 109, nome: 'Eusebio Ayala' },
        { id: 110, nome: 'Isla Pucú' },
        { id: 111, nome: 'Itacurubí de la Cordillera' },
        { id: 112, nome: 'Juan de Mena' },
        { id: 113, nome: 'Loma Grande' },
        { id: 114, nome: 'Mbocayaty del Yhaguy' },
        { id: 115, nome: 'Nueva Colombia' },
        { id: 116, nome: 'Piribebuy' },
        { id: 117, nome: 'Primero de Marzo' },
        { id: 118, nome: 'San Bernardino' },
        { id: 119, nome: 'Santa Elena' },
        { id: 120, nome: 'Tobatí' },
        { id: 121, nome: 'Valenzuela' }
      ],
      'GU': [
        { id: 122, nome: 'Villarrica' },
        { id: 123, nome: 'Borja' },
        { id: 124, nome: 'Capitán Mauricio José Troche' },
        { id: 125, nome: 'Coronel Martínez' },
        { id: 126, nome: 'Dr. Bottrell' },
        { id: 127, nome: 'Félix Pérez Cardozo' },
        { id: 128, nome: 'General Eugenio Alejandrino Garay' },
        { id: 129, nome: 'Independencia' },
        { id: 130, nome: 'Itapé' },
        { id: 131, nome: 'Iturbe' },
        { id: 132, nome: 'José Fassardi' },
        { id: 133, nome: 'Mbocayaty del Guairá' },
        { id: 134, nome: 'Natalicio Talavera' },
        { id: 135, nome: 'Ñumi' },
        { id: 136, nome: 'Paso Yobái' },
        { id: 137, nome: 'San Salvador' },
        { id: 138, nome: 'Tebicuary' },
        { id: 139, nome: 'Yataity' }
      ],
      'PA': [
        { id: 140, nome: 'Paraguarí' },
        { id: 141, nome: 'Acahay' },
        { id: 142, nome: 'Caapucú' },
        { id: 143, nome: 'Caballero' },
        { id: 144, nome: 'Carapeguá' },
        { id: 145, nome: 'Escobar' },
        { id: 146, nome: 'General Bernardino Caballero' },
        { id: 147, nome: 'La Colmena' },
        { id: 148, nome: 'Mbuyapey' },
        { id: 149, nome: 'Pirayú' },
        { id: 150, nome: 'Quiindy' },
        { id: 151, nome: 'Quyquyhó' },
        { id: 152, nome: 'Roque González de Santa Cruz' },
        { id: 153, nome: 'San Roque González de Santa Cruz' },
        { id: 154, nome: 'Sapucai' },
        { id: 155, nome: 'Tebicuarymí' },
        { id: 156, nome: 'Yaguarón' },
        { id: 157, nome: 'Ybycuí' },
        { id: 158, nome: 'Ybytymí' }
      ],
      'CT': [
        { id: 159, nome: 'Concepción' },
        { id: 160, nome: 'Azotey' },
        { id: 161, nome: 'Belén' },
        { id: 162, nome: 'Horqueta' },
        { id: 163, nome: 'Loreto' },
        { id: 164, nome: 'Paso Barreto' },
        { id: 165, nome: 'San Alfredo' },
        { id: 166, nome: 'San Carlos del Apa' },
        { id: 167, nome: 'San Lázaro' },
        { id: 168, nome: 'Sargento José Félix López' },
        { id: 169, nome: 'Yby Yaú' }
      ],
      'AM': [
        { id: 170, nome: 'Pedro Juan Caballero' },
        { id: 171, nome: 'Bella Vista Norte' },
        { id: 172, nome: 'Capitán Bado' },
        { id: 173, nome: 'Karapai' },
        { id: 174, nome: 'Zanja Pytá' }
      ],
      'CA': [
        { id: 175, nome: 'Salto del Guairá' },
        { id: 176, nome: 'Corpus Christi' },
        { id: 177, nome: 'Curuguaty' },
        { id: 178, nome: 'General Francisco Caballero Álvarez' },
        { id: 179, nome: 'Itanará' },
        { id: 180, nome: 'Katueté' },
        { id: 181, nome: 'La Paloma del Espíritu Santo' },
        { id: 182, nome: 'Nueva Esperanza' },
        { id: 183, nome: 'Ypejhú' },
        { id: 184, nome: 'Villa Ygatimí' },
        { id: 185, nome: 'Yasy Cañy' },
        { id: 186, nome: 'Yby Pytá' },
        { id: 187, nome: 'Ypejhú' },
        { id: 188, nome: 'Ygatimí' }
      ],
      'CZ': [
        { id: 189, nome: 'Caazapá' },
        { id: 190, nome: 'Abaí' },
        { id: 191, nome: 'Buena Vista' },
        { id: 192, nome: 'Dr. Moisés Santiago Bertoni' },
        { id: 193, nome: 'Fulgencio Yegros' },
        { id: 194, nome: 'General Higinio Morínigo' },
        { id: 195, nome: 'Maciel' },
        { id: 196, nome: 'San Juan Nepomuceno' },
        { id: 197, nome: 'Tavaí' },
        { id: 198, nome: 'Tres de Mayo' },
        { id: 199, nome: 'Yuty' }
      ],
      'MI': [
        { id: 200, nome: 'San Juan Bautista' },
        { id: 201, nome: 'Ayolas' },
        { id: 202, nome: 'San Ignacio' },
        { id: 203, nome: 'San Miguel' },
        { id: 204, nome: 'San Patricio' },
        { id: 205, nome: 'Santa María' },
        { id: 206, nome: 'Santa Rosa' },
        { id: 207, nome: 'Santiago' },
        { id: 208, nome: 'Villa Florida' },
        { id: 209, nome: 'Yabebyry' }
      ],
      'NE': [
        { id: 210, nome: 'Pilar' },
        { id: 211, nome: 'Alberdi' },
        { id: 212, nome: 'Cerrito' },
        { id: 213, nome: 'Desmochados' },
        { id: 214, nome: 'General José Eduvigis Díaz' },
        { id: 215, nome: 'Guazú Cuá' },
        { id: 216, nome: 'Humaitá' },
        { id: 217, nome: 'Isla Umbú' },
        { id: 218, nome: 'Laureles' },
        { id: 219, nome: 'Mayor José de Jesús Martínez' },
        { id: 220, nome: 'Paso de Patria' },
        { id: 221, nome: 'San Juan del Ñeembucú' },
        { id: 222, nome: 'Tacuaras' },
        { id: 223, nome: 'Villa Franca' },
        { id: 224, nome: 'Villa Oliva' },
        { id: 225, nome: 'Villalbín' }
      ],
      'PH': [
        { id: 226, nome: 'Villa Hayes' },
        { id: 227, nome: 'Benjamín Aceval' },
        { id: 228, nome: 'General José María Bruguez' },
        { id: 229, nome: 'José Falcón' },
        { id: 230, nome: 'Nanawa' },
        { id: 231, nome: 'Puerto Pinasco' },
        { id: 232, nome: 'Teniente Primero Manuel Irala Fernández' },
        { id: 233, nome: 'Teniente Esteban Martínez' }
      ],
      'BO': [
        { id: 234, nome: 'Filadelfia' },
        { id: 235, nome: 'Loma Plata' },
        { id: 236, nome: 'Mariscal Estigarribia' }
      ],
      'AA': [
        { id: 237, nome: 'Fuerte Olimpo' },
        { id: 238, nome: 'Bahía Negra' },
        { id: 239, nome: 'Carmelo Peralta' }
      ]
    };

    // Verificar se o departamento existe no mapeamento
    if (!cidadesPorDepartamento[uf]) {
      console.error(`Departamento não encontrado: ${uf}`);
      return NextResponse.json(
        { success: false, message: 'Departamento não encontrado' },
        { status: 404, headers }
      );
    }

    console.log(`Departamento encontrado: ${uf}`);

    // Buscar cidades do departamento
    const cidades = cidadesPorDepartamento[uf];
    
    // Ordenar cidades por nome
    const cidadesOrdenadas = cidades
      .map((cidade: Cidade) => ({
        id: cidade.id,
        nome: cidade.nome
      }))
      .sort((a: Cidade, b: Cidade) => a.nome.localeCompare(b.nome));
    
    console.log(`Retornando ${cidadesOrdenadas.length} cidades ordenadas`);
    
    return NextResponse.json({
      success: true,
      data: cidadesOrdenadas
    }, { headers });

  } catch (error) {
    console.error('Erro ao buscar cidades do Paraguai:', error);
    
    // Melhorar a resposta de erro para facilitar diagnóstico
    return NextResponse.json({
      success: false,
      message: 'Erro ao buscar cidades',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      data: []
    }, { status: 500, headers });
  }
} 