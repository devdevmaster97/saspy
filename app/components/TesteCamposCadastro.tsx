'use client';

import { useState } from 'react';
import { FaBarcode, FaBuilding } from 'react-icons/fa';

export default function TesteCamposCadastro() {
  const [formData, setFormData] = useState({
    C_codigo_assoc: '',
    C_empregador_assoc: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-blue-700 mb-6">Teste de Campos</h2>
      
      <form className="space-y-6">
        {/* Teste do campo Código */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Campo Código</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="C_codigo_assoc" className="block text-sm font-medium text-gray-700">Código</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                  <FaBarcode className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  id="C_codigo_assoc"
                  name="C_codigo_assoc"
                  value={formData.C_codigo_assoc}
                  onChange={handleChange}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Teste do campo Empregador */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Campo Empregador</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="C_empregador_assoc" className="block text-sm font-medium text-gray-700">Empregador</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                  <FaBuilding className="h-4 w-4" />
                </span>
                <select
                  id="C_empregador_assoc"
                  name="C_empregador_assoc"
                  value={formData.C_empregador_assoc}
                  onChange={handleChange}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
                >
                  <option value="">Selecione um empregador</option>
                  <option value="1">Empresa 1</option>
                  <option value="2">Empresa 2</option>
                  <option value="3">Empresa 3</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <p>Valores digitados:</p>
          <pre className="bg-gray-100 p-3 rounded">
            {JSON.stringify(formData, null, 2)}
          </pre>
        </div>
      </form>
    </div>
  );
} 