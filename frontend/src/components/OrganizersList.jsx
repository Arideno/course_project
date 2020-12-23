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

export default function OrganizersList() {
	const [organizers, setOrganizers] = useState([]);
	const [perPage, setPerPage] = useState(10);
	const [name, setName] = useState('');
	const [count, setCount] = useState(0);
	const [clubId, setClubId] = useState(0);
	const [clubs, setClubs] = useState([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [createFirstName, setCreateFirstName] = useState('');
	const [createLastName, setCreateLastName] = useState('');
  const [createClubId, setCreateClubId] = useState(0);
  const [show, setShow] = useState(false);
  const [createClubs, setCreateClubs] = useState([]);

  const { request } = useHttp();
  
  const getUnownedClubs = useCallback(async () => {
    try {
      const data = await request(`http://localhost:8080/unowned_clubs`)
      setCreateClubs(data.clubs)
      console.log(data)
    } catch (e) {}
  }, [request])

  useEffect(() => {
    getUnownedClubs()
  }, [getUnownedClubs])

	const throttled = useRef(
		throttle((currentPage, perPage, name, clubId) => {
			getOrganizers(currentPage ? currentPage : 1, perPage, name, clubId);
		}, 1000)
	);

	const getClubs = useCallback(async () => {
		try {
			const data = await request(`http://localhost:8080/club`);
			setClubs(data.clubs);
		} catch (e) {}
	}, [request]);

	useEffect(() => {
		getClubs();
	}, [getClubs]);

	const getOrganizers = useCallback(
		async (page = 1, perPage = 0, name = '', clubId = 0) => {
			try {
				const data = await request(
					`http://localhost:8080/organizer?page=${page}&perPage=${
						perPage ? perPage : 0
					}&name=${name}&clubId=${clubId}`
				);
				setOrganizers(data.organizers);
				console.log(data);
				setCount(data.count);
			} catch (e) {}
		},
		[request]
	);

	useEffect(() => {
		throttled.current(currentPage, perPage, name, clubId);
	}, [currentPage, perPage, name, getOrganizers, clubId]);

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

	const organizerList = organizers.map((o) => (
		<tr key={o.id}>
			<td>
				<Link to={`/organizer/${o.id}`}>{o.id}</Link>
			</td>
			<td>{o.first_name}</td>
			<td>{o.last_name}</td>
			<td>
				<Link to={`/club/${o.club.id}`}>{o.club.name}</Link>
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
  
  const saveOrganizer = useCallback(async () => {
    try {
      await request(`http://localhost:8080/organizer`, 'POST', {
        first_name: createFirstName,
        last_name: createLastName,
        club: {
          id: createClubId
        }
      })
      setShow(false)
    } catch (e) {
      alert('Error occured')
    }
  }, [request, createFirstName, createLastName, createClubId])

	const handleSave = (e) => {
    e.preventDefault();
    
    saveOrganizer()
  };
  
  const createClubsList = createClubs.map(c => {
    return <option key={c.id} value={c.id}>{c.name}</option>
  })

	return (
		<>
      <Modal show={show} onHide={() => setShow(false)}>
				<Modal.Header>
					<Modal.Title>Create Organizer</Modal.Title>
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
							<FormLabel>Club</FormLabel>
							<Form.Control
								as="select"
								value={createClubId}
								onChange={(e) => setCreateClubId(parseInt(e.target.value))}
							>
                <option value={0}></option>
								{createClubsList}
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
							<label htmlFor="perPage">Organizers per page</label>
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
								<th>First Name</th>
								<th>Last Name</th>
								<th>Club</th>
							</tr>
						</thead>
						<tbody>{organizerList}</tbody>
					</Table>
				</Col>
			</Row>
		</>
	);
}
