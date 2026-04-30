const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`

export async function generateResume(data: {
  fullName: string
  email: string
  phone: string
  jobTitle: string
  skills: string
  education: string
  experience: string
}): Promise<string> {
  const prompt = `
    Create a professional resume for the following person. Format it cleanly with clear sections.

    Name: ${data.fullName}
    Email: ${data.email}
    Phone: ${data.phone}
    Target Job Title: ${data.jobTitle}
    Skills: ${data.skills}
    Education: ${data.education}
    Experience: ${data.experience}

    Output a well-structured resume with sections: Summary, Experience, Education, Skills.
    Use plain text formatting with clear headings and bullet points.
  `

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    }),
  })

  const json = await response.json()
  return json.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Could not generate resume.'
}