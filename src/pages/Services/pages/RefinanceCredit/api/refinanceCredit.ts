const refinanceCredit = async (data: any) => {
  const url = 'http://localhost:8003/api/refinance-credit'

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
