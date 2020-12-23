import moment from 'moment';
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
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { DateRangePicker } from 'react-date-range';
import { uk } from 'date-fns/locale';
import { throttle } from 'lodash';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function TournamentsList() {
	const [tournaments, setTournaments] = useState([]);
	const [perPage, setPerPage] = useState(10);
	const [count, setCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [name, setName] = useState('');
	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);
  const [organizers, setOrganizers] = useState([]);
  const [createOrganizerId, setCreateOrganizerId] = useState(0);
  const [createName, setCreateName] = useState('');
	const [createStartDate, setCreateStartDate] = useState(null);
	const [createEndDate, setCreateEndDate] = useState(null);
	const [show, setShow] = useState(false);

	const { request } = useHttp();

	const getOrganizers = useCallback(async () => {
		try {
			const data = await request(`http://localhost:8080/organizer`);
			setOrganizers(data.organizers);
		} catch (e) {}
	}, [request]);

	useEffect(() => {
		getOrganizers();
	}, [getOrganizers]);

	const throttled = useRef(
		throttle((currentPage, perPage, name, startDate, endDate) => {
			getTournaments(
				currentPage ? currentPage : 1,
				perPage,
				name,
				startDate,
				endDate
			);
		}, 1000)
	);

	const getTournaments = useCallback(
		async (page = 1, perPage = 0, name = '', startDate = '', endDate = '') => {
			try {
				const data = await request(
					`http://localhost:8080/tournament?page=${page}&perPage=${
						perPage ? perPage : 0
					}&name=${name}&start_date=${
						startDate ? moment(startDate).format('MM/DD/yyyy') : ''
					}&end_date=${endDate ? moment(endDate).format('MM/DD/yyyy') : ''}`
				);
				setTournaments(data.tournaments);
				console.log(data);
				setCount(data.count);
			} catch (e) {}
		},
		[request]
	);

	useEffect(() => {
		throttled.current(currentPage, perPage, name, startDate, endDate);
	}, [currentPage, perPage, name, getTournaments, startDate, endDate]);

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

	const tournamentList = tournaments.map((t) => (
		<tr key={t.id}>
			<td>
				<Link to={`/tournament/${t.id}`}>{t.id}</Link>
			</td>
			<td>{t.name}</td>
			<td>{moment(t.start_date).format('DD.MM.yyyy')}</td>
			<td>{moment(t.end_date).format('DD.MM.yyyy')}</td>
			<td>
				<Link to={`/organizer/${t.organizer.id}`}>
					{t.organizer.first_name} {t.organizer.last_name}
				</Link>
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

	const handleDateRangeChange = (ranges) => {
		setStartDate(ranges.selection.startDate);
		setEndDate(ranges.selection.endDate);
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
  
  const organizersList = organizers.map((o) => {
    return <option key={o.id} value={o.id}>{o.first_name} {o.last_name}</option>
  })

  const saveTournament = useCallback(async () => {
    try {
      await request(`http://localhost:8080/tournament`, 'POST', {
        start_date: createStartDate,
        end_date: createEndDate,
        name: createName,
        organizer: {
          id: createOrganizerId
        }
      })
      setShow(false)
    } catch (e) {
      alert('Error occured')
    }
  }, [request, createName, createStartDate, createEndDate, createOrganizerId])

	const handleSave = (e) => {
    e.preventDefault();
    
    saveTournament()
	};

	return (
		<>
			<Modal show={show} onHide={() => setShow(false)}>
				<Modal.Header>
					<Modal.Title>Create Tournament</Modal.Title>
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
							<FormLabel>End date</FormLabel>
							<DatePicker
								dateFormat="dd/MM/yyyy"
								className="form-control"
								locale={uk}
								selected={createEndDate}
								onChange={(date) => setCreateEndDate(date)}
							/>
						</FormGroup>
						<FormGroup className="mt-3">
							<FormLabel>Organizer</FormLabel>
							<Form.Control
								as="select"
								value={createOrganizerId}
								onChange={(e) => setCreateOrganizerId(parseInt(e.target.value))}
							>
                <option value={0}></option>
								{organizersList}
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
				<Col sm={6}>
					<Row>
						<Col>
							<label htmlFor="perPage">Tournaments per page</label>
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
							<label className="d-block" htmlFor="date">
								Filter by date
							</label>
							<DateRangePicker
								locale={uk}
								showMonthAndYearPickers={false}
								ranges={[
									{ startDate: startDate, endDate: endDate, key: 'selection' },
								]}
								onChange={handleDateRangeChange}
							/>
						</Col>
					</Row>
					<Row>
						<Col className="d-flex justify-content-center">
							<Pagination>{pagination}</Pagination>
						</Col>
					</Row>
				</Col>
				<Col sm={6}>
					<Table striped bordered hover>
						<thead>
							<tr>
								<th>#</th>
								<th>Name</th>
								<th>Start date</th>
								<th>End date</th>
								<th>Organizer</th>
							</tr>
						</thead>
						<tbody>{tournamentList}</tbody>
					</Table>
				</Col>
			</Row>
		</>
	);
}
