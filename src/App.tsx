/*
import {
  createAmplifyAuthAdapter,
  createStorageBrowser,
} from '@aws-amplify/ui-react-storage/browser';
import '@aws-amplify/ui-react-storage/styles.css';
import './App.css';
import config from '../amplify_outputs.json';
import { Amplify } from 'aws-amplify';
import { Authenticator, Button, View, Image, useTheme, Text, Heading, useAuthenticator } from '@aws-amplify/ui-react';
import logo from './tplogo.jpg'; 

import {
  ThemeStyle,
  createTheme,
  defineComponentTheme,
} from '@aws-amplify/ui-react/server';

Amplify.configure(config);

const storageBrowserTheme = defineComponentTheme({
  name: 'storage-browser',
  theme: (tokens) => {
    return {
      _element: {
        controls: {
          flexDirection: 'row-reverse',
          backgroundColor: tokens.colors.background.primary,
          padding: tokens.space.small,
          borderRadius: tokens.radii.small,
        },
        title: {
          fontWeight: tokens.fontWeights.thin,
        },
      },
    };
  },
});

const theme = createTheme({
  name: 'my-theme',
  primaryColor: 'purple',
  components: [storageBrowserTheme],
});

const { StorageBrowser } = createStorageBrowser({
  config: createAmplifyAuthAdapter(),
});

const components = {
  Header() {
    const { tokens } = useTheme();
    return (
      <View textAlign="center" padding={tokens.space.large}>
        <Image
          alt="Amplify logo"
          src={logo}
        />
      </View>
    );
  },
  Footer() {
    const { tokens } = useTheme();

    return (
      <View textAlign="center" padding={tokens.space.large}>
        <Text color={tokens.colors.neutral[80]}>
          &copy; All Rights Reserved
        </Text>
      </View>
    );
  },
  SignIn: {
    Header() {
      const { tokens } = useTheme();
      return (
        <Heading padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`} level={3}>
          Sign in to your account
        </Heading>
      );
    },
    Footer() {
      const { toForgotPassword } = useAuthenticator();
      return (
        <View textAlign="center">
          <Button
            fontWeight="normal"
            onClick={toForgotPassword}
            size="small"
            variation="link"
          >
            Reset Password
          </Button>
        </View>
      );
    }
  }
};

const formFields = {
  signIn: {
    username: {
      placeholder: 'Enter your email',
      isRequired: true,
      Label: 'Email'
    }
  }
};


function App() {
  return (
    <Authenticator hideSignUp={true} formFields={formFields} components={components}>
      {({ signOut, user }) => (
        <>
          <div className="header">
            <h1>{`Bienvenido ${user?.signInDetails?.loginId}`}</h1>
            <Button className="sign-out-button" onClick={signOut}>Sign out</Button>
          </div>
          <View backgroundColor="background.tertiary" {...theme.containerProps()}>
            <StorageBrowser />
            <ThemeStyle theme={theme} />
          </View>
        </>
      )}
    </Authenticator>
  );
}

export default App;
*/

import React, { useState } from 'react';
import { Amplify } from 'aws-amplify';
import { downloadData } from 'aws-amplify/storage';
import { StorageBrowser } from '@aws-amplify/ui-react-storage';
import '@aws-amplify/ui-react-storage/styles.css';
import amplifyConfig from './amplifyconfiguration.json';

// Configurar Amplify
Amplify.configure(amplifyConfig);

// Definir tipos para los archivos de S3
interface S3File {
  key: string;
  lastModified?: Date;
  size?: number;
  eTag?: string;
}

function App() {
  // Estado para archivos seleccionados
  const [selectedFiles, setSelectedFiles] = useState<S3File[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<string>('');

  /**
   * Función para descargar múltiples archivos seleccionados
   * Usa la API de Amplify v6 con downloadData
   */
  const downloadSelectedFiles = async () => {
    if (selectedFiles.length === 0) {
      alert('No hay archivos seleccionados');
      return;
    }

    setIsDownloading(true);
    setDownloadProgress('Iniciando descarga...');

    let successCount = 0;
    let errorCount = 0;

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        
        try {
          setDownloadProgress(
            `Descargando ${i + 1} de ${selectedFiles.length}: ${file.key}`
          );

          // Descargar archivo usando Amplify v6 API
          const downloadResult = await downloadData({
            key: file.key,
          }).result;

          // Convertir el resultado a blob
          const blob = await downloadResult.body.blob();

          // Crear enlace temporal para descarga
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = file.key.split('/').pop() || 'download';
          link.style.display = 'none';

          // Agregar al DOM, hacer clic y remover
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Limpiar URL temporal para liberar memoria
          URL.revokeObjectURL(url);

          successCount++;
          console.log(`✓ Descargado exitosamente: ${file.key}`);
        } catch (error) {
          errorCount++;
          console.error(`✗ Error descargando ${file.key}:`, error);
        }
      }

      // Mostrar resumen
      const message = `Descarga completada:\n✓ ${successCount} exitoso(s)\n${
        errorCount > 0 ? `✗ ${errorCount} fallido(s)` : ''
      }`;
      alert(message);
    } finally {
      setIsDownloading(false);
      setDownloadProgress('');
    }
  };

  /**
   * Manejador para cuando el usuario selecciona archivos
   */
  const handleFileSelection = (files: unknown) => {
    setSelectedFiles(files as S3File[]);
    console.log('Archivos seleccionados:', files);
  };

  return (
    <div className="App">
      {/* Header */}
      <header
        style={{
          padding: '20px',
          backgroundColor: '#232f3e',
          color: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '24px' }}>
          S3 Storage Browser - Teleperformance
        </h1>
      </header>

      {/* Main Content */}
      <main style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Panel de control de descarga */}
        {selectedFiles.length > 0 && (
          <div
            style={{
              marginBottom: '20px',
              padding: '20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #dee2e6',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '15px',
              }}
            >
              <div>
                <p style={{ margin: '0 0 5px 0', fontSize: '16px' }}>
                  <strong>{selectedFiles.length}</strong> archivo(s)
                  seleccionado(s)
                </p>
                {downloadProgress && (
                  <p
                    style={{
                      margin: '5px 0 0 0',
                      fontSize: '14px',
                      color: '#6c757d',
                    }}
                  >
                    {downloadProgress}
                  </p>
                )}
              </div>

              <button
                onClick={downloadSelectedFiles}
                disabled={isDownloading}
                style={{
                  padding: '12px 24px',
                  backgroundColor: isDownloading ? '#cccccc' : '#ff9900',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isDownloading ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  transition: 'background-color 0.2s',
                  boxShadow: isDownloading
                    ? 'none'
                    : '0 2px 4px rgba(0,0,0,0.2)',
                }}
                onMouseEnter={(e) => {
                  if (!isDownloading) {
                    e.currentTarget.style.backgroundColor = '#ec7211';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isDownloading) {
                    e.currentTarget.style.backgroundColor = '#ff9900';
                  }
                }}
              >
                {isDownloading
                  ? '⏳ Descargando...'
                  : `⬇️ Descargar ${selectedFiles.length} archivo(s)`}
              </button>
            </div>

            {/* Lista de archivos seleccionados */}
            <details style={{ marginTop: '15px' }}>
              <summary
                style={{
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#495057',
                  userSelect: 'none',
                }}
              >
                Ver archivos seleccionados
              </summary>
              <ul
                style={{
                  marginTop: '10px',
                  paddingLeft: '20px',
                  fontSize: '13px',
                  color: '#6c757d',
                }}
              >
                {selectedFiles.map((file, index) => (
                  <li key={index} style={{ marginBottom: '5px' }}>
                    {file.key}
                    {file.size && (
                      <span style={{ color: '#adb5bd', marginLeft: '10px' }}>
                        ({(file.size / 1024).toFixed(2)} KB)
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </details>
          </div>
        )}

        {/* Storage Browser Component */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            overflow: 'hidden',
          }}
        >
          <StorageBrowser
            onSelect={handleFileSelection}
            displayText={{
              getListViewTableColumnHeader: (column) => {
                // Personalizar headers de columnas si es necesario
                const headers: Record<string, string> = {
                  name: 'Nombre',
                  size: 'Tamaño',
                  lastModified: 'Última modificación',
                };
                return headers[column] || column;
              },
            }}
          />
        </div>

        {/* Información adicional */}
        <div
          style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#e7f3ff',
            borderRadius: '6px',
            border: '1px solid #b3d9ff',
            fontSize: '14px',
            color: '#004085',
          }}
        >
          <strong>💡 Instrucciones:</strong>
          <ul style={{ marginTop: '10px', marginBottom: 0, paddingLeft: '20px' }}>
            <li>Selecciona uno o más archivos del navegador</li>
            <li>Haz clic en el botón "Descargar" para iniciar la descarga</li>
            <li>Los archivos se descargarán secuencialmente a tu equipo</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

export default App;
