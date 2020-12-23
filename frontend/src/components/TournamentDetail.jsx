import React, { useCallback, useEffect, useState } from 'react'
import { Col, Form, FormControl, FormGroup, FormLabel, Jumbotron, Row, Button, Table } from 'react-bootstrap'
import { Link, useHistory, useParams } from 'react-router-dom'
import { useHttp } from '../hooks/http.hook'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { uk } from 'date-fns/locale'
import '../css/TournamentDetail.css'

export default function TournamentDetail() {

  const history = useHistory()
  const { id } = useParams()
  const {request} = useHttp()

  const [tournament, setTournament] = useState(null)
  const [name, setName] = useState("")
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())
  const [error, setError] = useState(false)
  const [organizers, setOrganizers] = useState([])
  const [organizerId, setOrganizerId] = useState(1)
  const [players, setPlayers] = useState([])

  const getPlayers = useCallback(async () => {
    try {
      const data = await request(`http://localhost:8080/tournament/${id}/players`)
      setPlayers(data.data)
      console.log(data)
    } catch (e) {
      setError(false)
    }
  }, [request, id])

  useEffect(() => {
    getPlayers()
  }, [getPlayers])

  const getOrganizers = useCallback(async () => {
    try {
      const data = await request(`http://localhost:8080/organizer`)
      setOrganizers(data.organizers)
    } catch (e) {
      setError(false)
    }
  }, [request])

  useEffect(() => {
    getOrganizers()
  }, [getOrganizers])

  const getTournament = useCallback(async (id) => {
    try {
      const data = await request(`http://localhost:8080/tournament/${id}`)
      setTournament(data.data)
    } catch (e) {
      setError(true)
    }
  }, [request])

  useEffect(() => {
    getTournament(id)
  }, [id, getTournament])

  useEffect(() => {
    if (tournament) {
      setName(tournament.name)
      setStartDate(new Date(tournament.start_date))
      setEndDate(new Date(tournament.end_date))
      setOrganizerId(tournament.organizer.id)
    }
  }, [tournament])

  const updateTournament = useCallback(async () => {
    try {
      await request(`http://localhost:8080/tournament`, 'PUT', {
        id: parseInt(id),
        name,
        start_date: startDate,
        end_date: endDate,
        organizer: {
          id: organizerId
        }
      })
      alert('Saved')
    } catch (e) {
      alert('Error ocurred')
    }
  }, [request, id, name, startDate, endDate, organizerId])

  const deleteTournament = useCallback(async () => {
    await request(`http://localhost:8080/tournament/${id}`, 'DELETE')
    history.push('/tournaments')
  }, [request, id, history])

  const handleSave = (e) => {
    e.preventDefault()

    updateTournament()
  }

  const handleDelete = (e) => {
    e.preventDefault()

    deleteTournament()
  }

  const organizersList = organizers.map((o) => {
    return <option key={o.id} value={o.id}>{o.first_name} {o.last_name}</option>
  })

  const playersList = players.map((p) =>  {
    return (
      <tr key={p.id}>
        <td><Link to={`/player/${p.id}`}>{p.first_name} {p.last_name}</Link></td>
      </tr>
    )
  })

  if (error) {
    return <h1>No such tournament</h1>
  }

  if (tournament) {
    return (
      <Row>
        <Col sm={6}>
          <Jumbotron>
            <h1>Tournament</h1>
            <h4>Id: {tournament.id}</h4>
            <Form>
              <FormGroup>
                <FormLabel>Name</FormLabel>
                <FormControl type="text" placeholder="Enter name" value={name} onChange={(e) => setName(e.target.value)} />
              </FormGroup>
              <FormGroup className="mt-3">
                <FormLabel>Start date</FormLabel>
                <DatePicker dateFormat="dd/MM/yyyy" className="form-control" locale={uk} selected={startDate} onChange={date => setStartDate(date)} />
              </FormGroup>
              <FormGroup className="mt-3">
                <FormLabel>End date</FormLabel>
                <DatePicker dateFormat="dd/MM/yyyy" className="form-control" locale={uk} selected={endDate} onChange={date => setEndDate(date)} />
              </FormGroup>
              <FormGroup className="mt-3">
                <FormLabel>Organizer</FormLabel>
                <Form.Control as="select" value={organizerId} onChange={(e) => setOrganizerId(parseInt(e.target.value))}>
                  {organizersList}
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
        <Col sm={6}>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Players</th>
              </tr>
            </thead>
            <tbody>
              {playersList}
            </tbody>
          </Table>
        </Col>
      </Row>
    )
  }

  return <h1>Loading</h1>
}
