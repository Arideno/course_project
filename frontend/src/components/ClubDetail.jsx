import React, { useCallback, useEffect, useState } from 'react'
import { Col, Form, FormControl, FormGroup, FormLabel, Jumbotron, Row, Button } from 'react-bootstrap'
import { useHistory, useParams } from 'react-router-dom'
import { useHttp } from '../hooks/http.hook'

export default function ClubDetail() {

  const history = useHistory()
  const { id } = useParams()
  const {request} = useHttp()

  const [club, setClub] = useState(null)
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [logo, setLogo] = useState("")
  const [website, setWebsite] = useState("")
  const [error, setError] = useState(false)

  const getClub = useCallback(async (id) => {
    try {
      const data = await request(`http://localhost:8080/club/${id}`)
      setClub(data.data)
    } catch (e) {
      setError(false)
    }
  }, [request])

  useEffect(() => {
    getClub(id)
  }, [id, getClub])

  useEffect(() => {
    if (club) {
      setName(club.name)
      setAddress(club.address)
      setLogo(club.logo.String)
      setWebsite(club.website.String)
    }
  }, [club])

  const updateClub = useCallback(async () => {
    try {
      await request(`http://localhost:8080/club`, 'PUT', {
        id: parseInt(id),
        name,
        address,
        logo: {
          Valid: logo !== '',
          String: logo
        },
        website: {
          Valid: website !== '',
          String: website
        },
      })
      alert('Saved')
    } catch (e) {
      alert('Error ocurred')
    }
  }, [request, id, name, address, logo, website])

  const deleteClub = useCallback(async () => {
    await request(`http://localhost:8080/club/${id}`, 'DELETE')
    history.push('/clubs')
  }, [request, id, history])

  const handleSave = (e) => {
    e.preventDefault()

    updateClub()
  }

  const handleDelete = (e) => {
    e.preventDefault()

    deleteClub()
  }

  if (error) {
    return <h1>No such club</h1>
  }

  if (club) {
    return (
      <Row>
        <Col>
          <Jumbotron>
            <h1>Club</h1>
            <h4>Id: {club.id}</h4>
            <Form>
              <FormGroup>
                <FormLabel>Name</FormLabel>
                <FormControl type="text" placeholder="Enter name" value={name} onChange={(e) => setName(e.target.value)} />
              </FormGroup>
              <FormGroup className="mt-3">
                <FormLabel>Address</FormLabel>
                <FormControl type="text" placeholder="Enter address" value={address} onChange={(e) => setAddress(e.target.value)} />
              </FormGroup>
              <FormGroup className="mt-3">
                <FormLabel>Logo</FormLabel>
                <FormControl type="text" placeholder="Enter logo url" value={logo} onChange={(e) => setLogo(e.target.value)} />
              </FormGroup>
              <FormGroup className="mt-3">
                <FormLabel>Website</FormLabel>
                <FormControl type="text" placeholder="Enter website url" value={website} onChange={(e) => setWebsite(e.target.value)} />
              </FormGroup>
              <Button variant="primary" type="submit" className="mt-3" onClick={handleSave}>
                Save
              </Button>
              <Button variant="danger" className="mt-3 ms-3" onClick={handleDelete}>
                Delete
              </Button>
            </Form>
          </Jumbotron>
        </Col>
      </Row>
    )
  }

  return <h1>Loading</h1>
}
