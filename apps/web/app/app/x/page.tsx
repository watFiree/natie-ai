"use client"

import { FormEvent, useEffect, useState } from "react"
import { IconExternalLink } from "@tabler/icons-react"

import {
  getXAccount,
  postXAccount,
} from "@/lib/client/default/default"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const X_COOKIE_VIDEO_EMBED_URL =
  "https://www.youtube.com/embed?listType=search&list=how+to+extract+auth_token+ct0+cookie+x.com"
const X_COOKIE_VIDEO_RESULTS_URL =
  "https://www.youtube.com/results?search_query=how+to+extract+auth_token+ct0+cookie+x.com"

const SETUP_STEPS = [
  "Log in to x.com in your desktop browser.",
  "Open Developer Tools, then go to Application (or Storage) > Cookies > https://x.com.",
  "Copy the value of the auth_token cookie and paste it into the auth_token field.",
  "Copy the value of the ct0 cookie and paste it into the ct0 field.",
  "Save credentials and return to the X chat view.",
]

type XAccountState = "loading" | "configured" | "unconfigured"

type ApiResponseLike = {
  status: number
}

function XSetupInstructions() {
  return (
    <div className="space-y-5 text-sm">
      <p className="text-muted-foreground">
        X integration requires two cookie values from your active{" "}
        <a
          href="https://x.com"
          target="_blank"
          rel="noreferrer"
          className="text-primary inline-flex items-center gap-1 hover:underline"
        >
          x.com session
          <IconExternalLink className="size-3.5" />
        </a>
        .
      </p>

      <ol className="text-muted-foreground list-decimal space-y-2 pl-5">
        {SETUP_STEPS.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>

      <div className="rounded-md border p-3 text-xs leading-relaxed">
        Treat these cookie values as secrets. Do not share them in screenshots,
        commits, or public messages.
      </div>

      <div className="space-y-2">
        <p className="font-medium">Video walkthrough</p>
        <div className="overflow-hidden rounded-md border bg-black">
          <div className="aspect-video w-full">
            <iframe
              title="How to extract auth_token and ct0 cookies from x.com"
              src={X_COOKIE_VIDEO_EMBED_URL}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
        <a
          href={X_COOKIE_VIDEO_RESULTS_URL}
          target="_blank"
          rel="noreferrer"
          className="text-primary inline-flex items-center gap-1 text-xs hover:underline"
        >
          Open tutorial search in a new tab
          <IconExternalLink className="size-3" />
        </a>
      </div>
    </div>
  )
}

export default function Page() {
  const [accountState, setAccountState] = useState<XAccountState>("loading")
  const [showAuthSettings, setShowAuthSettings] = useState(false)
  const [authToken, setAuthToken] = useState("")
  const [ct0, setCt0] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadXAccount = async () => {
      try {
        const response = (await getXAccount()) as ApiResponseLike

        if (!isMounted) {
          return
        }

        if (response.status === 200) {
          setAccountState("configured")
          setShowAuthSettings(false)
          return
        }
      } catch {
        // Surface the setup UI if checking current credentials fails.
      }

      if (!isMounted) {
        return
      }

      setAccountState("unconfigured")
      setShowAuthSettings(true)
    }

    void loadXAccount()

    return () => {
      isMounted = false
    }
  }, [])

  const handleSaveCredentials = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    const trimmedAuthToken = authToken.trim()
    const trimmedCt0 = ct0.trim()

    if (!trimmedAuthToken || !trimmedCt0) {
      setFormError("Both auth_token and ct0 are required.")
      return
    }

    try {
      setIsSubmitting(true)
      const response = (await postXAccount({
        authToken: trimmedAuthToken,
        ct0: trimmedCt0,
      })) as ApiResponseLike

      if (response.status !== 200) {
        setFormError("Could not save X credentials. Please try again.")
        return
      }

      setAccountState("configured")
      setShowAuthSettings(false)
      setAuthToken("")
      setCt0("")
    } catch {
      setFormError("Could not save X credentials. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isSetupView = accountState !== "configured" || showAuthSettings

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

          {accountState === "loading" && (
            <div className="px-4 lg:px-6">
              <Card>
                <CardHeader>
                  <CardTitle>Checking X account</CardTitle>
                  <CardDescription>
                    Verifying whether credentials are already configured.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          )}

          {accountState !== "loading" && isSetupView && (
            <div className="grid gap-4 px-4 lg:px-6 xl:grid-cols-[1.3fr_1fr]">
              <Card className="hidden xl:block">
                <CardHeader>
                  <CardTitle>How to get required variables</CardTitle>
                  <CardDescription>
                    Follow the steps below to extract cookie values from x.com.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <XSetupInstructions />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <CardTitle>Authentication settings</CardTitle>
                      <CardDescription>
                        Paste auth_token and ct0 cookies from your X account.
                      </CardDescription>
                    </div>

                    <Sheet
                      open={isInstructionsOpen}
                      onOpenChange={setIsInstructionsOpen}
                    >
                      <SheetTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="xl:hidden"
                        >
                          View instructions
                        </Button>
                      </SheetTrigger>
                      <SheetContent
                        side="left"
                        className="w-full max-w-full overflow-y-auto sm:max-w-xl"
                      >
                        <SheetHeader>
                          <SheetTitle>How to get X cookies</SheetTitle>
                          <SheetDescription>
                            Step-by-step instructions with a video walkthrough.
                          </SheetDescription>
                        </SheetHeader>
                        <div className="px-4 pb-6">
                          <XSetupInstructions />
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                </CardHeader>

                <CardContent>
                  <form onSubmit={handleSaveCredentials} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="auth-token-input">auth_token</Label>
                      <Input
                        id="auth-token-input"
                        value={authToken}
                        onChange={(event) => setAuthToken(event.target.value)}
                        placeholder="Paste auth_token cookie value"
                        autoCapitalize="none"
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck={false}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ct0-input">ct0</Label>
                      <Input
                        id="ct0-input"
                        value={ct0}
                        onChange={(event) => setCt0(event.target.value)}
                        placeholder="Paste ct0 cookie value"
                        autoCapitalize="none"
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck={false}
                      />
                    </div>

                    {formError && (
                      <p className="text-destructive text-sm">{formError}</p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting
                          ? "Saving..."
                          : accountState === "configured"
                            ? "Update credentials"
                            : "Save credentials"}
                      </Button>

                      {accountState === "configured" && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowAuthSettings(false)}
                        >
                          Back to chat view
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {accountState === "configured" && !showAuthSettings && (
            <div className="px-4 lg:px-6">
              <Card className="min-h-[420px]">
                <CardHeader className="flex-row items-start justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle>X chat</CardTitle>
                    <CardDescription>
                      X credentials are set. Chat UI will be added next.
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAuthSettings(true)}
                  >
                    Change auth settings
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="text-muted-foreground flex min-h-[280px] items-center justify-center rounded-md border border-dashed text-center text-sm">
                    Empty chat view for X integration.
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
