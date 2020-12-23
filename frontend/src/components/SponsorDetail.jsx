import React, { useCallback, useEffect, useState } from 'react'
import { Col, Form, FormControl, FormGroup, FormLabel, Jumbotron, Row, Button } from 'react-bootstrap'
import { useHistory, useParams } from 'react-router-dom'
import { useHttp } from '../hooks/http.hook'

export default function SponsorDetail() {

  const history = useHistory()
  const { id } = useParams()
  const {request} = useHttp()

  const [sponsor, setSponsor] = useState(null)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [logo, setLogo] = useState("")
  const [website, setWebsite] = useState("")
  const [error, setError] = useState(false)

  const getSponsor = useCallback(async (id) => {
    try {
      const data = await request(`http://localhost:8080/sponsor/${id}`)
      setSponsor(data.data)
    } catch (e) {
      setError(false)
    }
  }, [request])

  useEffect(() => {
    getSponsor(id)
  }, [id, getSponsor])

  useEffect(() => {
    if (sponsor) {
      setFirstName(sponsor.first_name)
      setLastName(sponsor.last_name)
      setPhone(sponsor.phone.String)
      setLogo(sponsor.logo.String)
      setWebsite(sponsor.website.String)
    }
  }, [sponsor])

  const updateSponsor = useCallback(async () => {
    try {
      await request(`http://localhost:8080/sponsor`, 'PUT', {
        id: parseInt(id),
        first_name: firstName,
        last_name: lastName,
        phone: {
          Valid: phone !== '',
          String: phone
        },
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
  }, [request, id, firstName, lastName, phone, logo, website])

  const deleteSponsor = useCallback(async () => {
    await request(`http://localhost:8080/sponsor/${id}`, 'DELETE')
    history.push('/sponsors')
  }, [request, id, history])

  const handleSave = (e) => {
    e.preventDefault()

    updateSponsor()
  }

  const handleDelete = (e) => {
    e.preventDefault()

    deleteSponsor()
  }

  if (error) {
    return <h1>No such sponsor</h1>
  }

  if (sponsor) {
    return (
      <Row>
        <Col>
          <Jumbotron>
            <h1>Sponsor</h1>
            <h4>Id: {sponsor.id}</h4>
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
                <FormLabel>Phone</FormLabel>
                <FormControl type="text" placeholder="Enter phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
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
