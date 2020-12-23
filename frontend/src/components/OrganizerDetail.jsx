import React, { useCallback, useEffect, useState } from 'react'
import { Col, Form, FormControl, FormGroup, FormLabel, Jumbotron, Row, Button } from 'react-bootstrap'
import { useHistory, useParams } from 'react-router-dom'
import { useHttp } from '../hooks/http.hook'

export default function OrganizerDetail() {

  const history = useHistory()
  const { id } = useParams()
  const {request} = useHttp()

  const [organizer, setOrganizer] = useState(null)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [clubId, setClubId] = useState(0)
  const [clubs, setClubs] = useState([])
  const [error, setError] = useState(false)

  const getClubs = useCallback(async () => {
    try {
      const data = await request(`http://localhost:8080/unowned_clubs`)
      setClubs(data.clubs)
      console.log(data)
    } catch (e) {}
  }, [request])

  useEffect(() => {
    getClubs()
  }, [getClubs])

  const getOrganizer = useCallback(async (id) => {
    try {
      const data = await request(`http://localhost:8080/organizer/${id}`)
      setOrganizer(data.data)
    } catch (e) {
      setError(false)
    }
  }, [request])

  useEffect(() => {
    getOrganizer(id)
  }, [id, getOrganizer])

  useEffect(() => {
    if (organizer) {
      setFirstName(organizer.first_name)
      setLastName(organizer.last_name)
      setClubId(organizer.club.id)
    }
  }, [organizer])

  const updateOrganizer = useCallback(async () => {
    try {
      await request(`http://localhost:8080/organizer`, 'PUT', {
        id: parseInt(id),
        first_name: firstName,
        last_name: lastName,
        club: {
          id: clubId
        }
      })
      alert('Saved')
    } catch (e) {
      alert('Error ocurred')
    }
  }, [request, id, firstName, lastName, clubId])

  const deleteOrganizer = useCallback(async () => {
    await request(`http://localhost:8080/organizer/${id}`, 'DELETE')
    history.push('/organizers')
  }, [request, id, history])

  const handleSave = (e) => {
    e.preventDefault()

    updateOrganizer()
  }

  const handleDelete = (e) => {
    e.preventDefault()

    deleteOrganizer()
  }

  const clubList = clubs.map((c) => {
    return <option key={c.id} value={c.id}>{c.name}</option>
  })

  if (error) {
    return <h1>No such organizer</h1>
  }

  if (organizer) {
    return (
      <Row>
        <Col>
          <Jumbotron>
            <h1>Organizer</h1>
            <h4>Id: {organizer.id}</h4>
            <Form>
              <FormGroup>
                <FormLabel>First name</FormLabel>
                <FormControl type="text" placeholder="Enter first name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </FormGroup>
              <FormGroup>
                <FormLabel>Last name</FormLabel>
                <FormControl type="text" placeholder="Enter last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </FormGroup>
              <FormGroup className="mt-3">
                <FormLabel>Club</FormLabel>
                <Form.Control as="select" value={clubId} onChange={(e) => setClubId(parseInt(e.target.value))}>
                  <option value={organizer.club.id}>{organizer.club.name}</option>
                  {clubList}
                </Form.Control>
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
