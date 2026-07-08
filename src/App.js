import React, { useState } from 'react';

function App() {
  // 1. Lista de IDs de tus cursos en DynamoDB
  const cursosDisponibles = [
    { cursoId: 'curso-101', titulo: 'Matématica Superior' },
    { cursoId: 'curso-102', titulo: 'Programación I' },
    { cursoId: 'curso-103', titulo: 'Programación II' }
  ];

  // Estados
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [cursoData, setCursoData] = useState(null);
  const [correo, setCorreo] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensajeStatus, setMensajeStatus] = useState('');

  // URL BASE DE TU API GATEWAY
  const API_URL = 'https://hfhhhr8686.execute-api.us-east-1.amazonaws.com/dev';

  // Función para seleccionar un curso y traer sus datos desde CursosDB
  const seleccionarCurso = (idDelCurso) => {
    setLoading(true);
    setCursoSeleccionado(idDelCurso);
    setCursoData(null);
    setMensajeStatus('');

    fetch(`${API_URL}/cursos/${idDelCurso}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Error al traer el curso: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setCursoData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error al traer detalles del curso:', err);
        setMensajeStatus(`Error: ${err.message}`);
        setLoading(false);
      });
  };

  // Función para procesar la inscripción (Conecta con UsuariosDB e InscripcionesDB)
  const manejarInscripcion = (e) => {
    e.preventDefault();
    if (!correo || !cursoSeleccionado) return;

    setLoading(true);
    setMensajeStatus('');

    fetch(`${API_URL}/inscripciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        correo: correo,
        cursoId: cursoSeleccionado
      })
    })
      .then(async res => {
        // Intentamos parsear el JSON de respuesta de la Lambda
        const data = await res.json().catch(() => ({}));
        
        // CORRECCIÓN 1: Si la respuesta no es exitosa (200 OK), forzamos la caída al .catch
        if (!res.ok) {
          throw new Error(data.error || `Error del servidor: ${res.status}`);
        }
        return data;
      })
      .then(data => {
        // CORRECCIÓN 2: Usamos el mensaje dinámico que envía tu Lambda (Maneja usuarios nuevos y existentes)
        setMensajeStatus(data.mensaje || '¡Solicitud procesada con éxito!');
        setCorreo('');
        setLoading(false);
      })
      .catch(err => {
        console.error('Error en la inscripción:', err);
        // Guardamos el error con el prefijo "Error:" para cambiar el diseño visual abajo
        setMensajeStatus(`Error: ${err.message}`);
        setLoading(false);
      });
  };

  // Validamos si el mensaje actual en pantalla es un error técnico
  const esError = mensajeStatus.startsWith('Error');

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Catálogo de Cursos Universitarios</h1>
      <p>Selecciona un curso de la variedad disponible para ver los detalles y solicitar información:</p>
      
      {/* SECCIÓN: Variedad de Cursos en pantalla */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '30px' }}>
        {cursosDisponibles.map(curso => (
          <div 
            key={curso.cursoId} 
            onClick={() => seleccionarCurso(curso.cursoId)}
            style={{
              padding: '20px',
              border: cursoSeleccionado === curso.cursoId ? '2px solid #FF9900' : '1px solid #ccc',
              borderRadius: '8px',
              cursor: 'pointer',
              backgroundColor: cursoSeleccionado === curso.cursoId ? '#fff3e0' : '#f9f9f9',
              transition: '0.2s'
            }}
          >
            <h3>{curso.titulo}</h3>
            <p style={{ color: '#666', fontSize: '14px' }}>Código: {curso.cursoId}</p>
          </div>
        ))}
      </div>

      {/* SECCIÓN: Detalles del curso seleccionado */}
      {loading && !cursoData && !mensajeStatus && <p>Cargando información del backend...</p>}

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
          
          {/* CORRECCIÓN 3: Alerta dinámica. Si el mensaje es un Error se pinta de rojo, si es éxito se queda verde */}
          {mensajeStatus && (
            <p style={{ 
              marginTop: '15px', 
              padding: '10px', 
              backgroundColor: esError ? '#ffebee' : '#e8f5e9', 
              color: esError ? '#c62828' : '#2e7d32', 
              borderRadius: '4px', 
              fontWeight: 'bold' 
            }}>
              {mensajeStatus}
            </p>
          )}
        </div>
      )}

      {/* Mostrar errores de carga iniciales fuera del contenedor si no hay curso cargado */}
      {!cursoData && mensajeStatus && (
        <p style={{ padding: '10px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '4px', fontWeight: 'bold' }}>
          {mensajeStatus}
        </p>
      )}
    </div>
  );
}

export default App;