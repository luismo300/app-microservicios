import React, { useState } from 'react';

function App() {
  // Estados para manejar la interfaz
  const [cursoId, setCursoId] = useState('');
  const [cursoData, setCursoData] = useState(null);
  const [loading, setLoading] = useState(false);

  // IMPORTANTE: Reemplaza esta URL con la "URL de invocación" de tu API Gateway
  const API_URL = 'https://TU_API_ID.execute-api.us-east-1.amazonaws.com/prod';

  const buscarCurso = () => {
    if (!cursoId) return;
    setLoading(true);

    // Hacemos el fetch al microservicio de Cursos
    fetch(`${API_URL}/cursos/${cursoId}`)
      .then(res => res.json())
      .then(data => {
        setCursoData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error consultando la API:', err);
        setLoading(false);
      });
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Plataforma de Cursos</h1>
      <p>Busca un curso para ver sus detalles e inscribirte.</p>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="Ej: curso-101" 
          value={cursoId} 
          onChange={(e) => setCursoId(e.target.value)} 
          style={{ padding: '10px', flex: 1, fontSize: '16px' }}
        />
        <button onClick={buscarCurso} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          {loading ? 'Buscando...' : 'Buscar Curso'}
        </button>
      </div>

      {cursoData && (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
          <h2>Información del Artículo</h2>
          {/* Mostramos los datos crudos del JSON de DynamoDB */}
          <pre style={{ whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(cursoData, null, 2)}
          </pre>
          
          <div style={{ marginTop: '20px' }}>
            <label><strong>Ingresa tu correo para recibir información:</strong></label><br/>
            <input type="email" placeholder="correo@ejemplo.com" style={{ padding: '10px', width: '100%', marginTop: '5px' }} />
            <button style={{ padding: '10px', marginTop: '10px', width: '100%', backgroundColor: '#FF9900', color: 'white', border: 'none', fontWeight: 'bold' }}>
              Solicitar Información / Inscribirse
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;