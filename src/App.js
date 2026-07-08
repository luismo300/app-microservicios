import React, { useState } from 'react';

function App() {
  // 1. Lista de IDs de tus cursos en DynamoDB (Cámbialos por los IDs reales que creaste)
  const cursosDisponibles = [
    { id: 'curso-101', titulo: 'Introducción a AWS Cloud' },
    { id: 'curso-102', titulo: 'Desarrollo de Microservicios' },
    { id: 'curso-103', titulo: 'Arquitecturas Serverless' }
  ];

  // Estados
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [cursoData, setCursoData] = useState(null);
  const [correo, setCorreo] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensajeStatus, setMensajeStatus] = useState('');

  // URL BASE DE TU API GATEWAY (Mantenla apuntando a tu API)
  const API_URL = 'https://k0861iuj8i.execute-api.us-west-2.amazonaws.com/dev';

  // Función para seleccionar un curso y traer sus datos desde CursosDB
  const seleccionarCurso = (id) => {
    setLoading(true);
    setCursoSeleccionado(id);
    setCursoData(null);
    setMensajeStatus('');

    fetch(`${API_URL}/cursos/${id}`)
      .then(res => res.json())
      .then(data => {
        setCursoData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error al traer detalles del curso:', err);
        setLoading(false);
      });
  };

  // Función para procesar la inscripción (Conecta con UsuariosDB e InscripcionesDB)
  const manejarInscripcion = (e) => {
    e.preventDefault();
    if (!correo || !cursoSeleccionado) return;

    setLoading(true);

    // Aquí enviamos los datos a tu endpoint de inscripciones o usuarios
    // Nota: Adapta la ruta (/inscripciones) según cómo la hayas creado en tu API Gateway
    fetch(`${API_URL}/inscripciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        correo: correo,
        cursoId: cursoSeleccionado
      })
    })
      .then(res => res.json())
      .then(data => {
        // Aquí puedes manejar la respuesta que de tu Lambda (ej. si retornó que el usuario es nuevo)
        setMensajeStatus('¡Solicitud procesada con éxito! Revisa tu correo.');
        setCorreo('');
        setLoading(false);
      })
      .catch(err => {
        console.error('Error en la inscripción:', err);
        setMensajeStatus('Hubo un error al procesar la inscripción.');
        setLoading(false);
      });
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Catálogo de Cursos Universitarios</h1>
      <p>Selecciona un curso de la variedad disponible para ver los detalles y solicitar información:</p>
      
      {/* SECCIÓN: Variedad de Cursos en pantalla */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '30px' }}>
        {cursosDisponibles.map(curso => (
          <div 
            key={curso.id} 
            onClick={() => seleccionarCurso(curso.id)}
            style={{
              padding: '20px',
              border: cursoSeleccionado === curso.id ? '2px solid #FF9900' : '1px solid #ccc',
              borderRadius: '8px',
              cursor: 'pointer',
              backgroundColor: cursoSeleccionado === curso.id ? '#fff3e0' : '#f9f9f9',
              transition: '0.2s'
            }}
          >
            <h3>{curso.titulo}</h3>
            <p style={{ color: '#666', fontSize: '14px' }}>Código: {curso.id}</p>
          </div>
        ))}
      </div>

      {/* SECCIÓN: Detalles del curso seleccionado */}
      {loading && !cursoData && <p>Cargando información del backend...</p>}

      {cursoData && (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '5px', backgroundColor: '#ffffff' }}>
          <h2>Detalles del Artículo Seleccionado</h2>
          <pre style={{ whiteSpace: 'pre-wrap', backgroundColor: '#f1f1f1', padding: '15px', borderRadius: '4px' }}>
            {JSON.stringify(cursoData, null, 2)}
          </pre>
          
          {/* SECCIÓN: Formulario de Correo requerido */}
          <form onSubmit={manejarInscripcion} style={{ marginTop: '25px', padding: '15px', borderTop: '1px solid #eee' }}>
            <label><strong>Para obtener la información completa de este artículo, ingresa tu correo electrónico:</strong></label>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <input 
                type="email" 
                required
                placeholder="ejemplo@correo.com" 
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                style={{ padding: '10px', flex: 1, fontSize: '16px' }}
              />
              <button 
                type="submit" 
                disabled={loading}
                style={{ padding: '10px 20px', backgroundColor: '#FF9900', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
              >
                {loading ? 'Procesando...' : 'Obtener Información'}
              </button>
            </div>
          </form>
          
          {mensajeStatus && (
            <p style={{ marginTop: '15px', padding: '10px', backgroundColor: '#e8f5e9', color: '#2e7d32', borderRadius: '4px', fontWeight: 'bold' }}>
              {mensajeStatus}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;