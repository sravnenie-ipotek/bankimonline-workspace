const refinanceCredit = async (data: any) => {
  // Use relative URL for development (proxied by Vite)
  // In production, this will use the full URL from environment
  const isDevelopment = import.meta.env.DEV
  const baseUrl = isDevelopment ? '/api' : (import.meta.env.VITE_NODE_API_BASE_URL || '/api')
  const url = `${baseUrl}/refinance-credit`

  try {
    const opts: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }

    const response = await fetch(url, opts)
    return await response.json()
  } catch (error) {
    }
}

export default refinanceCredit
