import React, { useCallback, useEffect, useState } from 'react';
import {
	Col,
	Form,
	FormControl,
	FormGroup,
	FormLabel,
	Jumbotron,
	Row,
	Button,
} from 'react-bootstrap';
import { useHistory, useParams } from 'react-router-dom';
import { useHttp } from '../hooks/http.hook';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { uk } from 'date-fns/locale';

export default function MatchDetail() {
	const history = useHistory();
	const { id } = useParams();
	const { request } = useHttp();

	const [match, setMatch] = useState(null);
	const [result, setResult] = useState(0);
	const [startDate, setStartDate] = useState(new Date());
	const [tournamentId, setTournamentId] = useState(0);
	const [firstPlayerId, setFirstPlayerId] = useState(0);
	const [secondPlayerId, setSecondPlayerId] = useState(0);
	const [tournaments, setTournaments] = useState([]);
	const [players, setPlayers] = useState([]);
	const [error, setError] = useState(false);

	const getTournaments = useCallback(async () => {
		try {
			const data = await request(`http://localhost:8080/tournament`);
			setTournaments(data.tournaments);
			console.log(data);
		} catch (e) {}
	}, [request]);

	useEffect(() => {
		getTournaments();
	}, [getTournaments]);

	const getPlayers = useCallback(async () => {
		try {
			const data = await request(`http://localhost:8080/player`);
			setPlayers(data.players);
			console.log(data);
		} catch (e) {}
	}, [request]);

	useEffect(() => {
		getPlayers();
	}, [getPlayers]);

	const getMatch = useCallback(
		async (id) => {
			try {
				const data = await request(`http://localhost:8080/match/${id}`);
				setMatch(data.data);
			} catch (e) {
				setError(false);
			}
		},
		[request]
	);

	useEffect(() => {
		getMatch(id);
	}, [id, getMatch]);

	useEffect(() => {
		if (match) {
			setResult(match.result);
			setStartDate(new Date(match.start_date));
			setFirstPlayerId(match.first_player.id);
			setSecondPlayerId(match.second_player.id);
			setTournamentId(match.tournament.id);
		}
	}, [match]);

	const updateMatch = useCallback(async () => {
		try {
			await request(`http://localhost:8080/match`, 'PUT', {
				id: parseInt(id),
				result: parseInt(result),
				first_player: {
					id: firstPlayerId,
				},
				second_player: {
					id: secondPlayerId,
				},
				start_date: startDate,
				tournament: {
					id: tournamentId,
				},
			});
			alert('Saved');
		} catch (e) {
			alert('Error ocurred');
		}
	}, [
		request,
		id,
		result,
		firstPlayerId,
		secondPlayerId,
		startDate,
		tournamentId,
	]);

	const deleteMatch = useCallback(async () => {
		await request(`http://localhost:8080/match/${id}`, 'DELETE');
		history.push('/matches');
	}, [request, id, history]);

	const handleSave = (e) => {
		e.preventDefault();

		updateMatch();
	};

	const handleDelete = (e) => {
		e.preventDefault();

		deleteMatch();
	};

	const tournamentList = tournaments.map((t) => {
		return (
			<option key={t.id} value={t.id}>
				{t.name}
			</option>
		);
	});

	const playerList = players.map((p) => {
		return (
			<option key={p.id} value={p.id}>
				{p.first_name} {p.last_name}
			</option>
		);
	});

	if (error) {
		return <h1>No such organizer</h1>;
	}

	if (match) {
		return (
			<Row>
				<Col>
					<Jumbotron>
						<h1>Match</h1>
						<h4>Id: {match.id}</h4>
						<Form>
							<FormGroup className="mt-3">
								<FormLabel>Result</FormLabel>
								<FormControl
									type="text"
									placeholder="Enter result"
									value={result}
									onChange={(e) => setResult(e.target.value)}
								/>
							</FormGroup>
							<FormGroup className="mt-3">
								<FormLabel>Start date</FormLabel>
								<DatePicker
									dateFormat="dd/MM/yyyy"
									className="form-control"
									locale={uk}
									selected={startDate}
									onChange={(date) => setStartDate(date)}
								/>
							</FormGroup>
							<FormGroup className="mt-3">
								<FormLabel>Tournament</FormLabel>
								<Form.Control
									as="select"
									value={tournamentId}
									onChange={(e) => setTournamentId(parseInt(e.target.value))}
								>
									{tournamentList}
								</Form.Control>
							</FormGroup>
							<FormGroup className="mt-3">
								<FormLabel>White</FormLabel>
								<Form.Control
									as="select"
									value={firstPlayerId}
									onChange={(e) => setFirstPlayerId(parseInt(e.target.value))}
								>
									{playerList}
								</Form.Control>
							</FormGroup>
							<FormGroup className="mt-3">
								<FormLabel>Black</FormLabel>
								<Form.Control
									as="select"
									value={secondPlayerId}
									onChange={(e) => setSecondPlayerId(parseInt(e.target.value))}
								>
									{playerList}
								</Form.Control>
							</FormGroup>
							<Button
								variant="primary"
								type="submit"
								className="mt-3"
								onClick={handleSave}
							>
								Save
							</Button>
							<Button
								variant="danger"
								className="mt-3 ms-3"
								onClick={handleDelete}
							>
								Delete
							</Button>
						</Form>
					</Jumbotron>
				</Col>
			</Row>
		);
	}

	return <h1>Loading</h1>;
}
