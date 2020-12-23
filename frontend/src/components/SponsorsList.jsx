import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
	Col,
	InputGroup,
	Row,
	Table,
	FormControl,
	Pagination,
  Modal,
  Form,
  FormGroup,
  FormLabel,
  Button,
} from 'react-bootstrap';
import { useHttp } from '../hooks/http.hook';
import { throttle } from 'lodash';
import { Link } from 'react-router-dom';

export default function SponsorsList() {
	const [sponsors, setSponsors] = useState([]);
	const [perPage, setPerPage] = useState(10);
	const [name, setName] = useState('');
	const [phone, setPhone] = useState('');
	const [count, setCount] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	const [show, setShow] = useState(false);
  const [createFirstName, setCreateFirstName] = useState('');
  const [createLastName, setCreateLastName] = useState('');
	const [createPhone, setCreatePhone] = useState('');
	const [createLogo, setCreateLogo] = useState('');
	const [createWebsite, setCreateWebsite] = useState('');

	const throttled = useRef(
		throttle((currentPage, perPage, name, phone) => {
			getSponsors(currentPage ? currentPage : 1, perPage, name, phone);
		}, 1000)
	);

	const { request } = useHttp();

	const getSponsors = useCallback(
		async (page = 1, perPage = 0, name = '', phone = '') => {
			try {
				const data = await request(
					`http://localhost:8080/sponsor?page=${page}&perPage=${
						perPage ? perPage : 0
					}&name=${name}&phone=${phone}`
				);
				setSponsors(data.sponsors);
				console.log(data);
				setCount(data.count);
			} catch (e) {}
		},
		[request]
	);

	useEffect(() => {
		throttled.current(currentPage, perPage, name, phone);
	}, [currentPage, perPage, name, getSponsors, phone]);

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

	const handlePhoneChange = (e) => {
		const phone = e.target.value;
		setPhone(phone);
	};

	const sponsorList = sponsors.map((s) => (
		<tr key={s.id}>
			<td>
				<Link to={`/sponsor/${s.id}`}>{s.id}</Link>
			</td>
			<td>{s.first_name}</td>
			<td>{s.last_name}</td>
			<td>{s.phone.Valid ? s.phone.String : '-'}</td>
			<td>{s.logo.Valid ? <img src={s.logo.String} alt={s.name} /> : '-'}</td>
			<td>
				{s.website.Valid ? (
					<a href={s.website.String}>
						{s.first_name} {s.last_name}
					</a>
				) : (
					'-'
				)}
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
  
  const saveSponsor = useCallback(async () => {
		try {
			await request(`http://localhost:8080/sponsor`, 'POST', {
        first_name: createFirstName,
        last_name: createLastName,
        phone: {
          Valid: createPhone !== '',
          String: createPhone
        },
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
    createFirstName,
    createLastName,
    createPhone,
    createLogo,
    createWebsite
  ]);
  
  const handleSave = (e) => {
		e.preventDefault();

		saveSponsor();
	};

	return (
		<>
      <Modal show={show} onHide={() => setShow(false)}>
				<Modal.Header>
					<Modal.Title>Create Sponsor</Modal.Title>
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
							<FormLabel>Phone</FormLabel>
							<FormControl
								type="text"
								placeholder="Enter phone"
								value={createPhone}
								onChange={(e) => setCreatePhone(e.target.value)}
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
							<label htmlFor="perPage">Sponsors per page</label>
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
							<label htmlFor="address">Filter by phone</label>
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
								<th>Phone</th>
								<th>Logo</th>
								<th>Website</th>
							</tr>
						</thead>
						<tbody>{sponsorList}</tbody>
					</Table>
				</Col>
			</Row>
		</>
	);
}
