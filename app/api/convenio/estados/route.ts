import { NextResponse } from 'next/server';
import axios from 'axios';

interface Departamento {
  id: number;
  nombre: string;
  codigo: string;
}

export async function GET() {
  try {
    // Lista de departamentos do Paraguai
    const departamentosParaguai = [
      { sigla: 'AS', nome: 'Asunción' },
      { sigla: 'CN', nome: 'Central' },
      { sigla: 'AA', nome: 'Alto Paraguay' },
      { sigla: 'AP', nome: 'Alto Paraná' },
      { sigla: 'AM', nome: 'Amambay' },
      { sigla: 'BO', nome: 'Boquerón' },
      { sigla: 'CG', nome: 'Caaguazú' },
      { sigla: 'CZ', nome: 'Caazapá' },
      { sigla: 'CA', nome: 'Canindeyú' },
      { sigla: 'CO', nome: 'Cordillera' },
      { sigla: 'GU', nome: 'Guairá' },
      { sigla: 'IT', nome: 'Itapúa' },
      { sigla: 'MI', nome: 'Misiones' },
      { sigla: 'NE', nome: 'Ñeembucú' },
      { sigla: 'PA', nome: 'Paraguarí' },
      { sigla: 'PH', nome: 'Presidente Hayes' },
      { sigla: 'SP', nome: 'San Pedro' },
      { sigla: 'CT', nome: 'Concepción' }
    ];
    
    // Ordenar departamentos por nome
    const departamentos = departamentosParaguai
      .map((departamento) => ({
        sigla: departamento.sigla,
        nome: departamento.nome
      }))
      .sort((a, b) => a.nome.localeCompare(b.nome));
    
    return NextResponse.json({
      success: true,
      data: departamentos
    });

  } catch (error) {
    console.error('Erro ao buscar departamentos do Paraguai:', error);
    return NextResponse.json({
      success: true,
      data: []
    });
  }
} 