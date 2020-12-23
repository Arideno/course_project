import React from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect
} from 'react-router-dom'

import 'bootstrap/dist/css/bootstrap.min.css'
import { Container, Nav, Navbar } from 'react-bootstrap'
import TournamentsList from './components/TournamentsList'
import PlayersList from './components/PlayersList'
import ClubsList from './components/ClubsList'
import SponsorsList from './components/SponsorsList'
import OrganizersList from './components/OrganizersList'
import TournamentDetail from './components/TournamentDetail'
import PlayerDetail from './components/PlayerDetail'
import ClubDetail from './components/ClubDetail'
import SponsorDetail from './components/SponsorDetail'
import OrganizerDetail from './components/OrganizerDetail'
import MatchesList from './components/MatchesList'
import MatchDetail from './components/MatchDetail'

function App() {
  return (
    <Router>
      <Navbar bg="light" expand="lg">
        <Navbar.Brand as={Link} to="/tournaments" className="ms-4">Chess Tournaments</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar" />
        <Navbar.Collapse id="navbar">
        <Nav className="mr-auto">
          <Nav.Link as={Link} to="/tournaments">Tournaments</Nav.Link>
          <Nav.Link as={Link} to="/players">Players</Nav.Link>
          <Nav.Link as={Link} to="/clubs">Clubs</Nav.Link>
          <Nav.Link as={Link} to="/sponsors">Sponsors</Nav.Link>
          <Nav.Link as={Link} to="/organizers">Organizers</Nav.Link>
          <Nav.Link as={Link} to="/matches">Matches</Nav.Link>
        </Nav>
        </Navbar.Collapse>
      </Navbar>

      <Container>
        <Switch>
          <Route path="/tournaments">
            <TournamentsList />
          </Route>
          <Route path="/players">
            <PlayersList />
          </Route>
          <Route path="/clubs">
            <ClubsList />
          </Route>
          <Route path="/sponsors">
            <SponsorsList />
          </Route>
          <Route path="/organizers">
            <OrganizersList />
          </Route>
          <Route path="/matches">
            <MatchesList />
          </Route>
          <Route path="/tournament/:id">
            <TournamentDetail />
          </Route>
          <Route path="/player/:id">
            <PlayerDetail />
          </Route>
          <Route path="/club/:id">
            <ClubDetail />
          </Route>
          <Route path="/sponsor/:id">
            <SponsorDetail />
          </Route>
          <Route path="/organizer/:id">
            <OrganizerDetail />
          </Route>
          <Route path="/match/:id">
            <MatchDetail />
          </Route>
          <Redirect to="/tournaments" />
        </Switch>
      </Container>
    </Router>
  )
}

export default App;
