import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
	Col,
	InputGroup,
	Row,
	Table,
	FormControl,
	Pagination,
  FormLabel,
  Button,
  FormGroup,
  Modal,
  Form
} from 'react-bootstrap';
import { useHttp } from '../hooks/http.hook';
import { throttle } from 'lodash';
import { Link } from 'react-router-dom';

export default function ClubsList() {
	const [clubs, setClubs] = useState([]);
	const [perPage, setPerPage] = useState(10);
	const [name, setName] = useState('');
	const [address, setAddress] = useState('');
	const [count, setCount] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	const [show, setShow] = useState(false);
	const [createName, setCreateName] = useState('');
	const [createAddress, setCreateAddress] = useState('');
	const [createLogo, setCreateLogo] = useState('');
	const [createWebsite, setCreateWebsite] = useState('');

	const throttled = useRef(
		throttle((currentPage, perPage, name, address) => {
			getClubs(currentPage ? currentPage : 1, perPage, name, address);
		}, 1000)
	);

	const { request } = useHttp();

	const getClubs = useCallback(
		async (page = 1, perPage = 0, name = '', address = '') => {
			try {
				const data = await request(
					`http://localhost:8080/club?page=${page}&perPage=${
						perPage ? perPage : 0
					}&name=${name}&address=${address}`
				);
				setClubs(data.clubs);
				console.log(data);
				setCount(data.count);
			} catch (e) {}
		},
		[request]
	);

	useEffect(() => {
		throttled.current(currentPage, perPage, name, address);
	}, [currentPage, perPage, name, getClubs, address]);

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

	const clubList = clubs.map((c) => (
		<tr key={c.id}>
			<td>
				<Link to={`/club/${c.id}`}>{c.id}</Link>
			</td>
			<td>{c.name}</td>
			<td>{c.address}</td>
			<td>{c.logo.Valid ? <img src={c.logo.String} alt={c.name} /> : '-'}</td>
			<td>{c.website.Valid ? <a href={c.website.String}>{c.name}</a> : '-'}</td>
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
  
  const saveClub = useCallback(async () => {
		try {
			await request(`http://localhost:8080/club`, 'POST', {
        name: createName,
        address: createAddress,
        logo: {
          Valid: createLogo !== '',
          String: createLogo
        },
        website: {
          Valid: createWebsite !== '',
          String: createWebsite
        },
			});
			setShow(false);
		} catch (e) {
			alert('Error occured');
		}
	}, [
		request,
    createName,
    createAddress,
    createLogo,
    createWebsite
	]);

	const handleSave = (e) => {
		e.preventDefault();

		saveClub();
	};

	return (
		<>
      <Modal show={show} onHide={() => setShow(false)}>
				<Modal.Header>
					<Modal.Title>Create Club</Modal.Title>
				</Modal.Header>

				<Modal.Body>
					<Form>
						<FormGroup>
							<FormLabel>Name</FormLabel>
							<FormControl
								type="text"
								placeholder="Enter name"
								value={createName}
								onChange={(e) => setCreateName(e.target.value)}
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
							<FormLabel>Logo url</FormLabel>
							<FormControl
								type="text"
								placeholder="Enter logo url"
								value={createLogo}
								onChange={(e) => setCreateLogo(e.target.value)}
							/>
						</FormGroup>
            <FormGroup className="mt-3">
							<FormLabel>Website url</FormLabel>
							<FormControl
								type="text"
								placeholder="Enter website url"
								value={createWebsite}
								onChange={(e) => setCreateWebsite(e.target.value)}
							/>
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
							<label htmlFor="perPage">Clubs per page</label>
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
								<th>Name</th>
								<th>Address</th>
								<th>Logo</th>
								<th>Website</th>
							</tr>
						</thead>
						<tbody>{clubList}</tbody>
					</Table>
				</Col>
			</Row>
		</>
	);
}
