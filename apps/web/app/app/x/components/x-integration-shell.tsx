'use client';

import { useState } from 'react';

import { XChatView } from './x-chat-view';
import { XSetupView } from './x-setup-view';

type XIntegrationShellProps = {
  initialIsConfigured: boolean;
};

export function XIntegrationShell({
  initialIsConfigured,
}: XIntegrationShellProps) {
  const [isConfigured, setIsConfigured] = useState(initialIsConfigured);
  const [showAuthSettings, setShowAuthSettings] =
    useState(!initialIsConfigured);

  const isSetupVisible = !isConfigured || showAuthSettings;

  return (
    <div className="flex flex-col h-full max-h-[calc(100dvh-(var(--header-height))-(var(--spacing)*4))] overflow-hidden">
      {isSetupVisible ? (
        <XSetupView
          isConfigured={isConfigured}
          onCredentialsSaved={() => {
            setIsConfigured(true);
            setShowAuthSettings(false);
          }}
          onBackToChat={
            isConfigured ? () => setShowAuthSettings(false) : undefined
          }
        />
      ) : (
        <XChatView onChangeAuthSettings={() => setShowAuthSettings(true)} />
      )}
    </div>
  );
}
