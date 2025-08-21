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

// Code from Amazon Q

import { useState } from 'react';
import { getUrl, downloadData } from 'aws-amplify/storage';

const [selectedItems, setSelectedItems] = useState([]);
const [isDownloading, setIsDownloading] = useState(false);

// Function to handle item selection
const handleItemSelection = (item, isSelected) => {
  if (isSelected) {
    setSelectedItems(prev => [...prev, item]);
  } else {
    setSelectedItems(prev => prev.filter(selected => selected.key !== item.key));
  }
};

const DownloadSelectedButton = ({ selectedItems, onDownloadComplete }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  
  // Method 2: Using downloadData (for more control)
  const downloadUsingData = async () => {
    setIsDownloading(true);
    let completed = 0;

    try {
      for (const item of selectedItems) {
        try {
          const result = await downloadData({ key: item.key });
          const blob = await result.body;
          
          // Create blob URL and trigger download
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = item.key.split('/').pop();
          link.style.display = 'none';
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Clean up the blob URL
          URL.revokeObjectURL(url);
          
          completed++;
          setDownloadProgress((completed / selectedItems.length) * 100);
          
        } catch (error) {
          console.error(`Error downloading ${item.key}:`, error);
        }
      }
      
      onDownloadComplete?.();
      
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  return (
    <div className="download-section">
      <button 
        onClick={downloadUsingUrls} // or downloadUsingData
        disabled={selectedItems.length === 0 || isDownloading}
        className="download-selected-btn"
      >
        {isDownloading 
          ? `Downloading... ${Math.round(downloadProgress)}%` 
          : `Download Selected (${selectedItems.length})`
        }
      </button>
      
      {isDownloading && (
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${downloadProgress}%` }}
          />
        </div>
      )}
    </div>
  );
};

const SelectableStorageItem = ({ item, onSelect }) => {
  const [isSelected, setIsSelected] = useState(false);

  const handleSelectionChange = (e) => {
    const selected = e.target.checked;
    setIsSelected(selected);
    onSelect(item, selected);
  };

  return (
    <div className="storage-item">
      <input 
        type="checkbox" 
        checked={isSelected}
        onChange={handleSelectionChange}
        className="item-checkbox"
      />
      <div className="item-info">
        <span className="item-name">{item.key}</span>
        <span className="item-size">{item.size ? `${(item.size / 1024).toFixed(2)} KB` : ''}</span>
      </div>
    </div>
  );
};

import { StorageBrowser } from '@aws-amplify/ui-react-storage';

const MyStorageComponent = () => {
  const [selectedItems, setSelectedItems] = useState([]);

  const handleDownloadComplete = () => {
    // Clear selection after download
    setSelectedItems([]);
    console.log('All downloads completed!');
  };

  const handleSelectAll = (items) => {
    setSelectedItems(items);
  };

  const handleClearSelection = () => {
    setSelectedItems([]);
  };
};

// End code from Amazon Q





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


            
    <div className="storage-container">
      <div className="controls">
        <DownloadSelectedButton 
          selectedItems={selectedItems}
          onDownloadComplete={handleDownloadComplete}
        />
        
        <button onClick={handleClearSelection} disabled={selectedItems.length === 0}>
          Clear Selection
        </button>
        
        <span className="selection-count">
          {selectedItems.length} items selected
        </span>
      </div>



            
            <StorageBrowser />
            <ThemeStyle theme={theme} />
          </View>
        </>
      )}
    </Authenticator>
  );
}

export default App;
