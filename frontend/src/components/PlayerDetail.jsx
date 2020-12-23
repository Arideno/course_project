import React, { useCallback, useEffect, useState } from 'react'
import { Col, Form, FormControl, FormGroup, FormLabel, Jumbotron, Row, Button, Table } from 'react-bootstrap'
import { Link, useHistory, useParams } from 'react-router-dom'
import { useHttp } from '../hooks/http.hook'

export default function PlayerDetail() {

  const history = useHistory()
  const { id } = useParams()
  const {request} = useHttp()

  const [player, setPlayer] = useState(null)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [rank, setRank] = useState("")
  const [error, setError] = useState(false)
  const [clubs, setClubs] = useState([])
  const [tournaments, setTournaments] = useState([])
  const [results, setResults] = useState([])
  const [matchesPlayed, setMatchesPlayed] = useState([])
  const [productiveMatches, setProductiveMatches] = useState([])
  const [clubId, setClubId] = useState(1)

  const getPlayerParticipation = useCallback(async () => {
    try {
      const data = await request(`http://localhost:8080/player/${id}/tournaments`)
      setTournaments(data.data.tournaments)
      setResults(data.data.results)
      setMatchesPlayed(data.data.matchesPlayed)
      setProductiveMatches(data.data.productiveMatches)
    } catch (e) {
      setError(false)
    }
  }, [request, id])

  useEffect(() => {
    getPlayerParticipation()
  }, [getPlayerParticipation])

  const getClubs = useCallback(async () => {
    try {
      const data = await request(`http://localhost:8080/club`)
      setClubs(data.clubs)
    } catch (e) {
      setError(false)
    }
  }, [request])

  useEffect(() => {
    getClubs()
  }, [getClubs])

  const getPlayer = useCallback(async (id) => {
    try {
      const data = await request(`http://localhost:8080/player/${id}`)
      setPlayer(data.data)
    } catch (e) {
      setError(false)
    }
  }, [request])

  useEffect(() => {
    getPlayer(id)
  }, [id, getPlayer])

  useEffect(() => {
    if (player) {
      setFirstName(player.first_name)
      setLastName(player.last_name)
      setAddress(player.address.String)
      setPhone(player.phone_number.String)
      setEmail(player.email.String)
      setRank(player.rank)
      setClubId(player.club.id)
    }
  }, [player])

  const updatePlayer = useCallback(async () => {
    try {
      await request(`http://localhost:8080/player`, 'PUT', {
        id: parseInt(id),
        first_name: firstName,
        last_name: lastName,
        address: {
          Valid: address !== '',
          String: address
        },
        phone_number: {
          Valid: phone !== '',
          String: phone
        },
        email: {
          Valid: email !== '',
          String: email
        },
        rank: parseInt(rank),
        club: {
          id: clubId,
        }
      })
      alert('Saved')
    } catch (e) {
      alert('Error ocurred')
    }
  }, [request, id, firstName, lastName, address, phone, email, rank, clubId])

  const deletePlayer = useCallback(async () => {
    await request(`http://localhost:8080/player/${id}`, 'DELETE')
    history.push('/players')
  }, [request, id, history])

  const handleSave = (e) => {
    e.preventDefault()

    updatePlayer()
  }

  const handleDelete = (e) => {
    e.preventDefault()

    deletePlayer()
  }

  const clubsList = clubs.map((c) => {
    return <option key={c.id} value={c.id}>{c.name}</option>
  })
  
  const playerParticipation = []
  for (let i = 0; i < results.length; i++) {
    playerParticipation.push(
      <tr key={tournaments[i].id}>
        <td><Link to={`/tournament/${tournaments[i].id}`}>{tournaments[i].name}</Link></td>
        <td>{results[i]}</td>
        <td>{matchesPlayed[i]}</td>
        <td>{productiveMatches[i]}</td>
      </tr>
    )
  }

  if (error) {
    return <h1>No such player</h1>
  }

  if (player) {
    return (
      <Row>
        <Col sm={6}>
          <Jumbotron>
            <h1>Player</h1>
            <h4>Id: {player.id}</h4>
            <Form>
              <FormGroup>
                <FormLabel>First name</FormLabel>
                <FormControl type="text" placeholder="Enter first name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </FormGroup>
              <FormGroup className="mt-3">
                <FormLabel>Last name</FormLabel>
                <FormControl type="text" placeholder="Enter last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </FormGroup>
              <FormGroup className="mt-3">
                <FormLabel>Address</FormLabel>
                <FormControl type="text" placeholder="Enter address" value={address} onChange={(e) => setAddress(e.target.value)} />
              </FormGroup>
              <FormGroup className="mt-3">
                <FormLabel>Phone</FormLabel>
                <FormControl type="text" placeholder="Enter phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </FormGroup>
              <FormGroup className="mt-3">
                <FormLabel>Email</FormLabel>
                <FormControl type="text" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </FormGroup>
              <FormGroup className="mt-3">
                <FormLabel>Rank</FormLabel>
                <FormControl type="text" placeholder="Enter rank" value={rank} onChange={(e) => setRank(e.target.value)} />
              </FormGroup>
              <FormGroup className="mt-3">
                <FormLabel>Club</FormLabel>
                <Form.Control as="select" value={clubId} onChange={(e) => setClubId(parseInt(e.target.value))}>
                  {clubsList}
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
                <th>Tournament</th>
                <th>Score</th>
                <th>Matches played</th>
                <th>Productive matches</th>
              </tr>
            </thead>
            <tbody>
              {playerParticipation}
            </tbody>
          </Table>
        </Col>
      </Row>
    )
  }

  return <h1>Loading</h1>
}
