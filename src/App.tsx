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

//const { StorageBrowser } = createStorageBrowser({
  //config: createAmplifyAuthAdapter(),
//});

// Code from Amazon Q

import React, { useState } from 'react';
import { StorageBrowser } from '@aws-amplify/ui-react-storage';
import { getUrl } from 'aws-amplify/storage';

const StorageBrowserWithSelection = () => {
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [isDownloading, setIsDownloading] = useState(false);

  // Handle individual item selection
  const handleItemSelection = (item, isSelected) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(item.key);
      } else {
        newSet.delete(item.key);
      }
      return newSet;
    });
  };

  // Handle select all functionality
  const handleSelectAll = (items) => {
    setSelectedItems(new Set(items.map(item => item.key)));
  };

  // Clear all selections
  const handleClearSelection = () => {
    setSelectedItems(new Set());
  };

  return (
    <div className="storage-browser-container">
      {/* Selection Controls */}
      <SelectionControls 
        selectedCount={selectedItems.size}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        selectedItems={selectedItems}
      />
      
      {/* Custom StorageBrowser */}
      <StorageBrowser
        components={{
          LocationItemsView: (props) => (
            <CustomLocationItemsView 
              {...props} 
              selectedItems={selectedItems}
              onItemSelection={handleItemSelection}
            />
          ),
        }}
        // Add your other StorageBrowser props here
      />
    </div>
  );
};

const CustomLocationItemsView = ({ 
  items, 
  selectedItems, 
  onItemSelection, 
  ...props 
}) => {
  return (
    <div className="custom-items-view">
      {/* Select All Checkbox */}
      <div className="select-all-row">
        <SelectAllCheckbox 
          items={items}
          selectedItems={selectedItems}
          onItemSelection={onItemSelection}
        />
        <span>Select All</span>
      </div>
      
      {/* Items List */}
      <div className="items-list">
        {items?.map((item) => (
          <CustomStorageItem
            key={item.key}
            item={item}
            isSelected={selectedItems.has(item.key)}
            onSelect={onItemSelection}
          />
        ))}
      </div>
    </div>
  );
};

const CustomStorageItem = ({ item, isSelected, onSelect }) => {
  const handleSelectionChange = (e) => {
    e.stopPropagation(); // Prevent triggering item click
    onSelect(item, e.target.checked);
  };

  const handleItemClick = () => {
    // Handle item click (navigate to folder, preview file, etc.)
    console.log('Item clicked:', item.key);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className={`storage-item ${isSelected ? 'selected' : ''}`}>
      {/* Selection Checkbox */}
      <div className="item-checkbox">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleSelectionChange}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Item Content */}
      <div className="item-content" onClick={handleItemClick}>
        {/* File/Folder Icon */}
        <div className="item-icon">
          {item.type === 'FOLDER' ? '📁' : '📄'}
        </div>

        {/* Item Details */}
        <div className="item-details">
          <div className="item-name">{item.key}</div>
          <div className="item-metadata">
            {item.size && <span className="item-size">{formatFileSize(item.size)}</span>}
            {item.lastModified && (
              <span className="item-date">{formatDate(item.lastModified)}</span>
            )}
          </div>
        </div>

        {/* Item Actions */}
        <div className="item-actions">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleSingleDownload(item);
            }}
            className="download-btn"
          >
            ⬇️
          </button>
        </div>
      </div>
    </div>
  );
};

const SelectAllCheckbox = ({ items, selectedItems, onItemSelection }) => {
  const allItemKeys = items?.map(item => item.key) || [];
  const selectedCount = allItemKeys.filter(key => selectedItems.has(key)).length;
  const isAllSelected = allItemKeys.length > 0 && selectedCount === allItemKeys.length;
  const isIndeterminate = selectedCount > 0 && selectedCount < allItemKeys.length;

  const handleSelectAllChange = (e) => {
    const isChecked = e.target.checked;
    
    if (isChecked) {
      // Select all items
      items?.forEach(item => onItemSelection(item, true));
    } else {
      // Deselect all items
      items?.forEach(item => onItemSelection(item, false));
    }
  };

  return (
    <input
      type="checkbox"
      checked={isAllSelected}
      ref={(input) => {
        if (input) input.indeterminate = isIndeterminate;
      }}
      onChange={handleSelectAllChange}
    />
  );
};

const SelectionControls = ({ 
  selectedCount, 
  onClearSelection, 
  selectedItems 
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleBulkDownload = async () => {
    if (selectedItems.size === 0) return;
    
    setIsDownloading(true);
    try {
      const itemsArray = Array.from(selectedItems);
      
      for (const itemKey of itemsArray) {
        try {
          const result = await getUrl({ key: itemKey });
          
          // Create download link
          const link = document.createElement('a');
          link.href = result.url.toString();
          link.download = itemKey.split('/').pop();
          link.style.display = 'none';
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Small delay between downloads
          await new Promise(resolve => setTimeout(resolve, 200));
          
        } catch (error) {
          console.error(`Error downloading ${itemKey}:`, error);
        }
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="selection-controls">
      <div className="selection-info">
        <span>{selectedCount} items selected</span>
      </div>
      
      <div className="selection-actions">
        <button
          onClick={handleBulkDownload}
          disabled={selectedCount === 0 || isDownloading}
          className="download-selected-btn"
        >
          {isDownloading ? 'Downloading...' : `Download Selected (${selectedCount})`}
        </button>
        
        <button
          onClick={onClearSelection}
          disabled={selectedCount === 0}
          className="clear-selection-btn"
        >
          Clear Selection
        </button>
      </div>
    </div>
  );
};

// End Code from Amazon Q





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
            <StorageBrowserWithSelection />
            <ThemeStyle theme={theme} />
          </View>
        </>
      )}
    </Authenticator>
  );
}

export default App;
