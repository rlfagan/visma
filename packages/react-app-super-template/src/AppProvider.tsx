import { clientPromise } from '@/api';
import definition from '@/api/schema.json';
import { IntlProvider } from '@visma/react-intl-bundled-messages';
import { ReactKeycloakProvider } from '@visma/react-keycloak';
import type { OpenAPIV3 } from 'openapi-types';
import React, { Suspense } from 'react';
import keycloak from './keycloak.js';
import useSetBackendBaseURL from './useSetBackendBaseURL.js';

interface Props {
  apiSchema?: OpenAPIV3.Document;
  authClient?: Keycloak.KeycloakInstance;
  backend?: { baseURL?: string };
  children?: React.ReactNode;
  fallback?: JSX.Element | null;
  intlProviderProps?: Parameters<typeof IntlProvider>[0];
  reactKeycloakProviderProps?: Parameters<typeof ReactKeycloakProvider>[0];
}

export default function AppProvider(props: Props) {
  const backend = props.backend ?? {};
  backend.baseURL ??= globalThis.ENV?.BACKEND?.baseURL;
  const children = props.children ?? null;
  const fallback = props.fallback ?? null;
  const intlProviderProps = props.intlProviderProps;
  const reactKeycloakProviderProps =
    props.reactKeycloakProviderProps ??
    ({} as Parameters<typeof ReactKeycloakProvider>[0]);
  reactKeycloakProviderProps.authClient ??= keycloak;
  reactKeycloakProviderProps.axios ??= clientPromise;
  reactKeycloakProviderProps.LoadingComponent ??= props.fallback ?? undefined;
  const apiSchema = props.apiSchema ?? definition;

  useSetBackendBaseURL(apiSchema, backend.baseURL);

  return (
    <Suspense fallback={fallback}>
      <ReactKeycloakProvider {...reactKeycloakProviderProps}>
        <Suspense fallback={fallback}>
          <IntlProvider {...intlProviderProps}>{children}</IntlProvider>
        </Suspense>
      </ReactKeycloakProvider>
    </Suspense>
  );
}
