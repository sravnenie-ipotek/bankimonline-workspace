import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import './View.css'

// Define a type for User
interface User {
  id?: number
  name?: string
  email?: string
  contact?: string
}

const View: React.FC = () => {
  const [user, setUser] = useState<User | null>(null)
  const { id } = useParams<{ id: string }>()

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/get/${id}`)
      .then((resp) => {
        const fetchedUser: User = resp.data[0]
        setUser(fetchedUser)
      })
      .catch((error) => {
        console.error('Error fetching user:', error)
      })
  }, [id])

  if (!user) return <p>Loading...</p>

  return (
    <div style={{ marginTop: '150px' }}>
      <div className="card">
        <div className="card-header">
          <p>User Contact Details</p>
        </div>
        <div className="container">
          {' '}
          {/* fixed typo here */}
          <strong>ID: </strong>
          <span>{id}</span>
          <br />
          <br />
          <strong>Name: </strong>
          <span>{user.name}</span>
          <br />
          <br />
          <strong>Email: </strong>
          <span>{user.email}</span>
          <br />
          <br />
          <strong>Contact: </strong>
          <span>{user.contact}</span>
          <br />
          <br />
          <Link to="/">
            <button className="btn btn-edit">Go Back</button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default View
