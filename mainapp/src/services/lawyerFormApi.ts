export interface LawyerFormSubmission {
  [key: string]: any
}

export const submitLawyerForm = async (data: LawyerFormSubmission) => {
  const response = await fetch('/api/lawyers/apply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  const json = await response.json()
  if (!response.ok) {
    throw new Error(json.message || 'Failed to submit lawyer application')
  }
  return json
} 