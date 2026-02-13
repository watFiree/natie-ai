"use client"

import { useState } from "react"

import { XChatView } from "./x-chat-view"
import { XSetupView } from "./x-setup-view"

type XIntegrationShellProps = {
  initialIsConfigured: boolean
}

export function XIntegrationShell({
  initialIsConfigured,
}: XIntegrationShellProps) {
  const [isConfigured, setIsConfigured] = useState(initialIsConfigured)
  const [showAuthSettings, setShowAuthSettings] = useState(
    !initialIsConfigured
  )

  const isSetupVisible = !isConfigured || showAuthSettings

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <h1 className="mb-2 text-2xl font-bold">X (Twitter) Integration</h1>
            <p className="text-muted-foreground">
              Connect your X account and chat with Natie about tweets and
              timelines.
            </p>
          </div>

          {isSetupVisible && (
            <div className="px-4 lg:px-6">
              <XSetupView
                isConfigured={isConfigured}
                onCredentialsSaved={() => {
                  setIsConfigured(true)
                  setShowAuthSettings(false)
                }}
                onBackToChat={
                  isConfigured
                    ? () => setShowAuthSettings(false)
                    : undefined
                }
              />
            </div>
          )}

          {!isSetupVisible && (
            <div className="px-4 lg:px-6">
              <XChatView onChangeAuthSettings={() => setShowAuthSettings(true)} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
