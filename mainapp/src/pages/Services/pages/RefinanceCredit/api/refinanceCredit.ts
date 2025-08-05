const refinanceCredit = async (data: any) => {
  // Get API base URL from environment variables
  const baseUrl = import.meta.env.VITE_NODE_API_BASE_URL || 'https://bankdev2standalone-production.up.railway.app/api'
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
    console.log(error)
  }
}

export default refinanceCredit
