import { cookies } from "next/headers"

import { getXAccount } from "@/lib/client/default/default"

import { XIntegrationShell } from "./components/x-integration-shell"

type ApiResponseLike = {
  status: number
}

async function getIsXConfigured() {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ")

  try {
    const response = (await getXAccount({
      cache: "no-store",
      headers: {
        Cookie: cookieHeader,
      },
    })) as ApiResponseLike

    return response.status === 200
  } catch {
    return false
  }
}

export default async function Page() {
  const isXConfigured = await getIsXConfigured()

  return <XIntegrationShell initialIsConfigured={isXConfigured} />
}
