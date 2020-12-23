import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
	Col,
	InputGroup,
	Row,
	Table,
	FormControl,
  Pagination,
  Button,
	Modal,
	FormGroup,
	Form,
  FormLabel,
} from 'react-bootstrap';
import { useHttp } from '../hooks/http.hook';
import { throttle } from 'lodash';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { uk } from 'date-fns/locale';

export default function MatchesList() {
	const [matches, setMatches] = useState([]);
	const [perPage, setPerPage] = useState(10);
	const [count, setCount] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	const [name, setName] = useState('');
	const [tournamentName, setTournamentName] = useState('');
	const [createResult, setCreateResult] = useState(0);
	const [createStartDate, setCreateStartDate] = useState(new Date());
	const [createTournamentId, setCreateTournamentId] = useState(0);
	const [createFirstPlayerId, setCreateFirstPlayerId] = useState(0);
	const [createSecondPlayerId, setCreateSecondPlayerId] = useState(0);
  const [createPlayers, setCreatePlayers] = useState([]);
  const [createTournaments, setCreateTournaments] = useState([]);
  const [show, setShow] = useState(false);

  const { request } = useHttp();

  const getTournaments = useCallback(async () => {
		try {
			const data = await request(`http://localhost:8080/tournament`);
			setCreateTournaments(data.tournaments);
			console.log(data);
		} catch (e) {}
	}, [request]);

	useEffect(() => {
		getTournaments();
  }, [getTournaments]);
  
  const getPlayers = useCallback(async () => {
		try {
			const data = await request(`http://localhost:8080/player`);
			setCreatePlayers(data.players);
			console.log(data);
		} catch (e) {}
	}, [request]);

	useEffect(() => {
		getPlayers();
	}, [getPlayers]);

	const throttled = useRef(
		throttle((currentPage, perPage, name, tournamentName) => {
			getMatches(currentPage ? currentPage : 1, perPage, name, tournamentName);
		}, 1000)
	);

	const getMatches = useCallback(
		async (page = 1, perPage = 0, name = '', tournamentName = '') => {
			try {
				const data = await request(
					`http://localhost:8080/match?page=${page}&perPage=${
						perPage ? perPage : 0
					}&name=${name}&tournamentName=${tournamentName}`
				);
				setMatches(data.matches);
				console.log(data);
				setCount(data.count);
			} catch (e) {}
		},
		[request]
	);

	useEffect(() => {
		throttled.current(currentPage, perPage, name, tournamentName);
	}, [currentPage, perPage, getMatches, name, tournamentName]);

	useEffect(() => {
		setCurrentPage(1);
	}, [perPage, count]);

	const handlePerPageChange = (e) => {
		const perPage = e.target.value;
		if (!isNaN(perPage)) {
			if (perPage === '') {
				setCurrentPage(0);
			}
			setPerPage(perPage);
		} else {
			setCurrentPage(0);
		}
	};

	const matchesList = matches.map((m) => (
		<tr key={m.id}>
			<td>
				<Link to={`/match/${m.id}`}>{m.id}</Link>
			</td>
			<td>
				<Link to={`/player/${m.first_player.id}`}>
					{m.first_player.first_name} {m.first_player.last_name}(
					{m.first_player.rank})
				</Link>
			</td>
			<td>
				<Link to={`/player/${m.second_player.id}`}>
					{m.second_player.first_name} {m.second_player.last_name}(
					{m.second_player.rank})
				</Link>
			</td>
			<td>{m.result === 0 ? '1/2:1/2' : m.result === -1 ? '0:1' : '1:0'}</td>
			<td>
				<Link to={`/tournament/${m.tournament.id}`}>{m.tournament.name}</Link>
			</td>
		</tr>
	));

	const handlePagination = (e) => {
		let page;
		if (e.target.tagName === 'A') {
			page = parseInt(e.target.id);
		} else if (e.target.tagName === 'SPAN') {
			page = parseInt(e.target.parentNode.id);
		} else {
			return;
		}
		setCurrentPage(page);
	};

	const pagination = [];
	if (currentPage && count) {
		currentPage !== 1 &&
			pagination.push(
				<Pagination.Item
					key={currentPage - 1}
					id={currentPage - 1}
					onClick={handlePagination}
				>
					{currentPage - 1}
				</Pagination.Item>
			);
		pagination.push(
			<Pagination.Item key={currentPage} active activeLabel="">
				{currentPage}
			</Pagination.Item>
		);
		currentPage !== count &&
			pagination.push(
				<Pagination.Item
					onClick={handlePagination}
					key={currentPage + 1}
					id={currentPage + 1}
				>
					{currentPage + 1}
				</Pagination.Item>
			);
	}

	const saveMatch = useCallback(async () => {
		try {
			await request(`http://localhost:8080/match`, 'POST', {
				result: parseInt(createResult),
				first_player: {
					id: createFirstPlayerId,
				},
				second_player: {
					id: createSecondPlayerId,
				},
				start_date: createStartDate,
				tournament: {
					id: createTournamentId,
				},
      });
      setShow(false)
		} catch (e) {
			alert('Error ocurred');
		}
	}, [
		request,
		createResult,
		createFirstPlayerId,
		createSecondPlayerId,
		createStartDate,
		createTournamentId,
	]);

	const handleSave = (e) => {
		e.preventDefault();

		saveMatch();
  };
  
  const createPlayersList = createPlayers.map(p => {
    return <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
  })

  const createTournamentsList = createTournaments.map(t => {
    return <option key={t.id} value={t.id}>{t.name}</option>
  })

	return (
		<>
      <Modal show={show} onHide={() => setShow(false)}>
				<Modal.Header>
					<Modal.Title>Create Match</Modal.Title>
				</Modal.Header>

				<Modal.Body>
					<Form>
            <FormGroup>
							<FormLabel>White</FormLabel>
							<Form.Control
								as="select"
								value={createFirstPlayerId}
								onChange={(e) => setCreateFirstPlayerId(parseInt(e.target.value))}
							>
                <option value={0}></option>
								{createPlayersList}
							</Form.Control>
						</FormGroup>
            <FormGroup className="mt-3">
							<FormLabel>Black</FormLabel>
							<Form.Control
								as="select"
								value={createSecondPlayerId}
								onChange={(e) => setCreateSecondPlayerId(parseInt(e.target.value))}
							>
                <option value={0}></option>
								{createPlayersList}
							</Form.Control>
						</FormGroup>
            <FormGroup className="mt-3">
							<FormLabel>Start date</FormLabel>
							<DatePicker
								dateFormat="dd/MM/yyyy"
								className="form-control"
								locale={uk}
								selected={createStartDate}
								onChange={(date) => setCreateStartDate(date)}
							/>
						</FormGroup>
            <FormGroup className="mt-3">
							<FormLabel>Result</FormLabel>
							<FormControl
								type="text"
								placeholder="Enter last name"
								value={createResult}
								onChange={(e) => setCreateResult(e.target.value)}
							/>
						</FormGroup>
						<FormGroup className="mt-3">
							<FormLabel>Club</FormLabel>
							<Form.Control
								as="select"
								value={createTournamentId}
								onChange={(e) => setCreateTournamentId(parseInt(e.target.value))}
							>
                <option value={0}></option>
								{createTournamentsList}
							</Form.Control>
						</FormGroup>
					</Form>
				</Modal.Body>

				<Modal.Footer>
					<Button variant="secondary" onClick={() => setShow(false)}>
						Close
					</Button>
					<Button variant="primary" onClick={handleSave}>
						Save
					</Button>
				</Modal.Footer>
			</Modal>
			<Row className="mt-3 mb-3">
				<Col>
					<Button variant="success" onClick={() => setShow(true)}>
						Create
					</Button>
				</Col>
			</Row>
			<Row className="gx-5">
				<Col sm={5}>
					<Row>
						<Col>
							<label htmlFor="perPage">Matches per page</label>
							<InputGroup className="mb-3">
								<FormControl
									placeholder="0"
									id="perPage"
									value={perPage}
									onChange={handlePerPageChange}
								/>
							</InputGroup>
						</Col>
					</Row>
					<Row>
						<Col>
							<label htmlFor="name">Filter by players' name</label>
							<InputGroup className="mb-3">
								<FormControl
									placeholder="Name"
									id="name"
									value={name}
									onChange={(e) => setName(e.target.value)}
								/>
							</InputGroup>
						</Col>
					</Row>
					<Row>
						<Col>
							<label htmlFor="tournamentName">
								Filter by tournament's name
							</label>
							<InputGroup className="mb-3">
								<FormControl
									placeholder="Tournament name"
									id="tournamentName"
									value={tournamentName}
									onChange={(e) => setTournamentName(e.target.value)}
								/>
							</InputGroup>
						</Col>
					</Row>
					<Row>
						<Col className="d-flex justify-content-center">
							<Pagination>{pagination}</Pagination>
						</Col>
					</Row>
				</Col>
				<Col sm={7}>
					<Table striped bordered hover>
						<thead>
							<tr>
								<th>#</th>
								<th>White</th>
								<th>Black</th>
								<th>Result</th>
								<th>Tournament</th>
							</tr>
						</thead>
						<tbody>{matchesList}</tbody>
					</Table>
				</Col>
			</Row>
		</>
	);
}
