import { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { list, downloadData } from 'aws-amplify/storage';
import { Authenticator, Button, View, Image, useTheme, Text, Heading, useAuthenticator } from '@aws-amplify/ui-react';
import logo from './tplogo.jpg';
import config from '../amplify_outputs.json';
import './App.css';

Amplify.configure(config);

interface S3File {
  key: string;
  lastModified?: Date;
  size?: number;
  eTag?: string;
}

const components = {
  Header() {
    const { tokens } = useTheme();
    return (
      <View textAlign="center" padding={tokens.space.large}>
        <Image alt="Amplify logo" src={logo} />
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
          <Button fontWeight="normal" onClick={toForgotPassword} size="small" variation="link">
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

function CustomStorageBrowser() {
  const [files, setFiles] = useState<S3File[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<S3File[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Cargar archivos del path actual
  useEffect(() => {
    const loadFiles = async () => {
      setIsLoading(true);
      try {
        const result = await list({
          path: currentPath || '',
          options: { listAll: true }
        });
        setFiles(result.items as S3File[]);
      } catch (error) {
        console.error('Error cargando archivos:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadFiles();
  }, [currentPath]);

  // Toggle selección de archivo
  const toggleSelection = (file: S3File) => {
    setSelectedFiles(prev => {
      const exists = prev.find(f => f.key === file.key);
      if (exists) {
        return prev.filter(f => f.key !== file.key);
      }
      return [...prev, file];
    });
  };

  // Descargar archivos seleccionados
  const downloadSelectedFiles = async () => {
    if (selectedFiles.length === 0) return;

    setIsDownloading(true);
    let successCount = 0;
    let errorCount = 0;

    for (const file of selectedFiles) {
      try {
        const result = await downloadData({ key: file.key }).result;
        const blob = await result.body.blob();
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.key.split('/').pop() || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        successCount++;
      } catch (error) {
        console.error(`Error descargando ${file.key}:`, error);
        errorCount++;
      }
    }

    alert(`Descarga completada:\n✓ ${successCount} exitoso(s)\n${errorCount > 0 ? `✗ ${errorCount} fallido(s)` : ''}`);
    setIsDownloading(false);
    setSelectedFiles([]);
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Panel de control */}
      {selectedFiles.length > 0 && (
        <div style={{
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <p><strong>{selectedFiles.length}</strong> archivo(s) seleccionado(s)</p>
          <Button
            onClick={downloadSelectedFiles}
            isDisabled={isDownloading}
            variation="primary"
          >
            {isDownloading ? 'Descargando...' : `⬇️ Descargar ${selectedFiles.length} archivo(s)`}
          </Button>
        </div>
      )}

      {/* Lista de archivos */}
      {isLoading ? (
        <p>Cargando archivos...</p>
      ) : (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                <th style={{ padding: '12px', textAlign: 'left', width: '40px' }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFiles(files);
                      } else {
                        setSelectedFiles([]);
                      }
                    }}
                    checked={selectedFiles.length === files.length && files.length > 0}
                  />
                </th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Nombre</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Tamaño</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Última modificación</th>
              </tr>
            </thead>
            <tbody>
              {files.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>
                    No hay archivos en esta ubicación
                  </td>
                </tr>
              ) : (
                files.map((file, index) => (
                  <tr
                    key={index}
                    style={{
                      borderBottom: '1px solid #dee2e6',
                      backgroundColor: selectedFiles.find(f => f.key === file.key) ? '#e7f3ff' : 'white'
                    }}
                  >
                    <td style={{ padding: '12px' }}>
                      <input
                        type="checkbox"
                        checked={!!selectedFiles.find(f => f.key === file.key)}
                        onChange={() => toggleSelection(file)}
                      />
                    </td>
                    <td style={{ padding: '12px' }}>{file.key}</td>
                    <td style={{ padding: '12px' }}>
                      {file.size ? `${(file.size / 1024).toFixed(2)} KB` : '-'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {file.lastModified ? new Date(file.lastModified).toLocaleString() : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Authenticator hideSignUp={true} formFields={formFields} components={components}>
      {({ signOut, user }) => (
        <>
          <div className="header">
            <h1>{`Bienvenido ${user?.signInDetails?.loginId}`}</h1>
            <Button className="sign-out-button" onClick={signOut}>Sign out</Button>
          </div>
          <CustomStorageBrowser />
        </>
      )}
    </Authenticator>
  );
}

export default App;
