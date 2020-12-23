import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
	Col,
	InputGroup,
	Row,
	Table,
	FormControl,
	Pagination,
  FormLabel,
  FormGroup,
  Form,
  Modal,
  Button
} from 'react-bootstrap';
import { useHttp } from '../hooks/http.hook';
import { throttle } from 'lodash';
import { getTrackBackground, Range } from 'react-range';
import { Link } from 'react-router-dom';

export default function TournamentsList() {
	const [players, setPlayers] = useState([]);
	const [perPage, setPerPage] = useState(10);
	const [name, setName] = useState('');
	const [address, setAddress] = useState('');
	const [phone, setPhone] = useState('');
	const [email, setEmail] = useState('');
	const [count, setCount] = useState(0);
	const [firstRate, setFirstRate] = useState(1400);
	const [secondRate, setSecondRate] = useState(3000);
	const [clubId, setClubId] = useState(0);
	const [clubs, setClubs] = useState([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [show, setShow] = useState(false);
	const [createFirstName, setCreateFirstName] = useState('');
	const [createLastName, setCreateLastName] = useState('');
	const [createAddress, setCreateAddress] = useState('');
	const [createPhone, setCreatePhone] = useState('');
	const [createEmail, setCreateEmail] = useState('');
	const [createRank, setCreateRank] = useState('');
	const [createClubId, setCreateClubId] = useState(0);

	const throttled = useRef(
		throttle(
			(
				currentPage,
				perPage,
				name,
				address,
				email,
				phone,
				firstRate,
				secondRate,
				clubId
			) => {
				getPlayers(
					currentPage ? currentPage : 1,
					perPage,
					name,
					address,
					email,
					phone,
					firstRate,
					secondRate,
					clubId
				);
			},
			1000
		)
	);

	const { request } = useHttp();

	const getClubs = useCallback(async () => {
		try {
			const data = await request(`http://localhost:8080/club`);
			setClubs(data.clubs);
		} catch (e) {}
	}, [request]);

	useEffect(() => {
		getClubs();
	}, [getClubs]);

	const getPlayers = useCallback(
		async (
			page = 1,
			perPage = 0,
			name = '',
			address = '',
			email = '',
			phone = '',
			firstRate = 0,
			secondRate = 0,
			clubId = 0
		) => {
			try {
				const data = await request(
					`http://localhost:8080/player?page=${page}&perPage=${
						perPage ? perPage : 0
					}&name=${name}&address=${address}&email=${email}&phone=${phone}&first_rate=${firstRate}&second_rate=${secondRate}&clubId=${clubId}`
				);
				setPlayers(data.players);
				console.log(data);
				setCount(data.count);
			} catch (e) {}
		},
		[request]
	);

	useEffect(() => {
		throttled.current(
			currentPage,
			perPage,
			name,
			address,
			email,
			phone,
			firstRate,
			secondRate,
			clubId
		);
	}, [
		currentPage,
		perPage,
		name,
		getPlayers,
		address,
		email,
		phone,
		firstRate,
		secondRate,
		clubId,
	]);

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

	const handleNameChange = (e) => {
		const name = e.target.value;
		setName(name);
	};

	const handleAddressChange = (e) => {
		const address = e.target.value;
		setAddress(address);
	};

	const handlePhoneChange = (e) => {
		const phone = e.target.value;
		setPhone(phone);
	};

	const handleEmailChange = (e) => {
		const email = e.target.value;
		setEmail(email);
	};

	const playerList = players.map((p) => (
		<tr key={p.id}>
			<td>
				<Link to={`/player/${p.id}`}>{p.id}</Link>
			</td>
			<td>{p.first_name}</td>
			<td>{p.last_name}</td>
			<td>{p.address.Valid ? p.address.String : '-'}</td>
			<td>{p.phone_number.Valid ? p.phone_number.String : '-'}</td>
			<td>{p.email.Valid ? p.email.String : '-'}</td>
			<td>{p.rank}</td>
			<td>
				<Link to={`/club/${p.club.id}`}>{p.club.name}</Link>
			</td>
		</tr>
	));

	const clubsList = clubs.map((c) => {
		return (
			<option key={c.id} value={c.id}>
				{c.name}
			</option>
		);
	});

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

	const savePlayer = useCallback(async () => {
		try {
			await request(`http://localhost:8080/player`, 'POST', {
				first_name: createFirstName,
				last_name: createLastName,
				address: {
					Valid: createAddress !== '',
					String: createAddress,
				},
				phone_number: {
					Valid: createPhone !== '',
					String: createPhone,
				},
				email: {
					Valid: createEmail !== '',
					String: createEmail,
				},
				rank: parseInt(createRank),
				club: {
					id: createClubId,
				},
			});
			setShow(false);
		} catch (e) {
			alert('Error occured');
		}
	}, [
		request,
		createFirstName,
		createLastName,
		createAddress,
		createPhone,
		createEmail,
		createRank,
		createClubId,
	]);

	const handleSave = (e) => {
		e.preventDefault();

		savePlayer();
	};

	return (
		<>
      <Modal show={show} onHide={() => setShow(false)}>
				<Modal.Header>
					<Modal.Title>Create Player</Modal.Title>
				</Modal.Header>

				<Modal.Body>
					<Form>
						<FormGroup>
							<FormLabel>First name</FormLabel>
							<FormControl
								type="text"
								placeholder="Enter first name"
								value={createFirstName}
								onChange={(e) => setCreateFirstName(e.target.value)}
							/>
						</FormGroup>
						<FormGroup className="mt-3">
							<FormLabel>Last name</FormLabel>
							<FormControl
								type="text"
								placeholder="Enter last name"
								value={createLastName}
								onChange={(e) => setCreateLastName(e.target.value)}
							/>
						</FormGroup>
            <FormGroup className="mt-3">
							<FormLabel>Address</FormLabel>
							<FormControl
								type="text"
								placeholder="Enter address"
								value={createAddress}
								onChange={(e) => setCreateAddress(e.target.value)}
							/>
						</FormGroup>
            <FormGroup className="mt-3">
							<FormLabel>Phone</FormLabel>
							<FormControl
								type="text"
								placeholder="Enter phone"
								value={createPhone}
								onChange={(e) => setCreatePhone(e.target.value)}
							/>
						</FormGroup>
            <FormGroup className="mt-3">
							<FormLabel>Email</FormLabel>
							<FormControl
								type="text"
								placeholder="Enter email"
								value={createEmail}
								onChange={(e) => setCreateEmail(e.target.value)}
							/>
						</FormGroup>
            <FormGroup className="mt-3">
							<FormLabel>Rank</FormLabel>
							<FormControl
								type="text"
								placeholder="Enter rank"
								value={createRank}
								onChange={(e) => setCreateRank(e.target.value)}
							/>
						</FormGroup>
						<FormGroup className="mt-3">
							<FormLabel>Club</FormLabel>
							<Form.Control
								as="select"
								value={createClubId}
								onChange={(e) => setCreateClubId(parseInt(e.target.value))}
							>
                <option value={0}></option>
								{clubsList}
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
							<label htmlFor="perPage">Players per page</label>
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
							<label htmlFor="name">Filter by name</label>
							<InputGroup className="mb-3">
								<FormControl
									placeholder="Name"
									id="name"
									value={name}
									onChange={handleNameChange}
								/>
							</InputGroup>
						</Col>
					</Row>
					<Row>
						<Col>
							<label htmlFor="address">Filter by address</label>
							<InputGroup className="mb-3">
								<FormControl
									placeholder="Address"
									id="address"
									value={address}
									onChange={handleAddressChange}
								/>
							</InputGroup>
						</Col>
					</Row>
					<Row>
						<Col>
							<label htmlFor="phone">Filter by phone</label>
							<InputGroup className="mb-3">
								<FormControl
									placeholder="Phone"
									id="phone"
									value={phone}
									onChange={handlePhoneChange}
								/>
							</InputGroup>
						</Col>
					</Row>
					<Row>
						<Col>
							<label htmlFor="email">Filter by email</label>
							<InputGroup className="mb-3">
								<FormControl
									placeholder="Email"
									id="email"
									value={email}
									onChange={handleEmailChange}
								/>
							</InputGroup>
						</Col>
					</Row>
					<Row>
						<Col>
							<label htmlFor="email">Filter by club</label>
							<InputGroup className="mb-3">
								<FormControl
									as="select"
									value={clubId}
									onChange={(e) => setClubId(parseInt(e.target.value))}
								>
									<option value="0">All</option>
									{clubsList}
								</FormControl>
							</InputGroup>
						</Col>
					</Row>
					<Row>
						<Col>
							<label htmlFor="rate">Filter by rank</label>
							<h3 id="rate">
								[{firstRate};{secondRate}]
							</h3>
						</Col>
					</Row>
					<Row className="mt-3 mb-3">
						<Col>
							<Range
								values={[firstRate, secondRate]}
								step={1}
								min={1400}
								max={3000}
								onChange={(values) => {
									setFirstRate(values[0]);
									setSecondRate(values[1]);
								}}
								renderTrack={({ props, children }) => (
									<div
										onMouseDown={props.onMouseDown}
										onTouchStart={props.onTouchStart}
										style={{
											...props.style,
											height: '36px',
											display: 'flex',
											width: '100%',
										}}
									>
										<div
											ref={props.ref}
											style={{
												height: '5px',
												width: '100%',
												borderRadius: '4px',
												background: getTrackBackground({
													values: [firstRate, secondRate],
													colors: ['#ccc', '#548BF4', '#ccc'],
													min: 1400,
													max: 3000,
												}),
												alignSelf: 'center',
											}}
										>
											{children}
										</div>
									</div>
								)}
								renderThumb={({ props, isDragged }) => (
									<div
										{...props}
										style={{
											...props.style,
											height: '42px',
											width: '42px',
											borderRadius: '4px',
											backgroundColor: '#FFF',
											display: 'flex',
											justifyContent: 'center',
											alignItems: 'center',
											boxShadow: '0px 2px 6px #AAA',
										}}
									>
										<div
											style={{
												height: '16px',
												width: '5px',
												backgroundColor: isDragged ? '#548BF4' : '#CCC',
											}}
										/>
									</div>
								)}
							/>
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
								<th>First name</th>
								<th>Last name</th>
								<th>Address</th>
								<th>Phone</th>
								<th>Email</th>
								<th>Rank</th>
								<th>Club</th>
							</tr>
						</thead>
						<tbody>{playerList}</tbody>
					</Table>
				</Col>
			</Row>
		</>
	);
}
