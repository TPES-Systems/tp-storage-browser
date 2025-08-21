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
