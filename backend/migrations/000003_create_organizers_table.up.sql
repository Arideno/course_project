create table organizers(
    id serial primary key,
    first_name varchar(255) not null,
    second_name varchar(255) not null,
    club_id int references club(id) on delete cascade unique
);

insert into organizers (first_name, second_name, club_id) values ('Hobart', 'Varney', 1);
insert into organizers (first_name, second_name, club_id) values ('Gottfried', 'Truggian', 2);
insert into organizers (first_name, second_name, club_id) values ('Mame', 'Cadman', 3);
insert into organizers (first_name, second_name, club_id) values ('Mead', 'Edgerly', 4);
insert into organizers (first_name, second_name, club_id) values ('Bradney', 'Hallifax', 5);
insert into organizers (first_name, second_name, club_id) values ('Rupert', 'Brood', 6);
insert into organizers (first_name, second_name, club_id) values ('Hamel', 'Halley', 7);
insert into organizers (first_name, second_name, club_id) values ('Eldin', 'Totaro', 8);
insert into organizers (first_name, second_name, club_id) values ('Aimil', 'De Zamudio', 9);
insert into organizers (first_name, second_name, club_id) values ('Levon', 'Proudler', 10);
insert into organizers (first_name, second_name, club_id) values ('Lambert', 'Allison', 11);
insert into organizers (first_name, second_name, club_id) values ('Eliza', 'Dillingham', 12);
insert into organizers (first_name, second_name, club_id) values ('Irv', 'Ottiwill', 13);
insert into organizers (first_name, second_name, club_id) values ('Lalo', 'Emmins', 14);
insert into organizers (first_name, second_name, club_id) values ('Hadrian', 'Rumbold', 15);
insert into organizers (first_name, second_name, club_id) values ('Petronille', 'Vallack', 16);
insert into organizers (first_name, second_name, club_id) values ('Guthrie', 'Driussi', 17);
insert into organizers (first_name, second_name, club_id) values ('Jammal', 'Barsby', 18);
insert into organizers (first_name, second_name, club_id) values ('Meggy', 'Middlehurst', 19);
insert into organizers (first_name, second_name, club_id) values ('Briano', 'Carous', 20);
insert into organizers (first_name, second_name, club_id) values ('Launce', 'Suggett', 21);
insert into organizers (first_name, second_name, club_id) values ('Temple', 'Goff', 22);
insert into organizers (first_name, second_name, club_id) values ('Malvina', 'Gianolini', 23);
insert into organizers (first_name, second_name, club_id) values ('Loise', 'Aiskrigg', 24);
insert into organizers (first_name, second_name, club_id) values ('Lammond', 'Meiningen', 25);
insert into organizers (first_name, second_name, club_id) values ('Renie', 'Camilleri', 26);
insert into organizers (first_name, second_name, club_id) values ('Ola', 'Scales', 27);
insert into organizers (first_name, second_name, club_id) values ('Lorrayne', 'Fewkes', 28);
insert into organizers (first_name, second_name, club_id) values ('Ana', 'Durie', 29);
insert into organizers (first_name, second_name, club_id) values ('Geno', 'Marton', 30);
insert into organizers (first_name, second_name, club_id) values ('Lacy', 'Schukraft', 31);
insert into organizers (first_name, second_name, club_id) values ('Michell', 'Rubinshtein', 32);
insert into organizers (first_name, second_name, club_id) values ('Rebeka', 'Acedo', 33);
insert into organizers (first_name, second_name, club_id) values ('Erskine', 'Bayman', 34);
insert into organizers (first_name, second_name, club_id) values ('Earlie', 'Eyer', 35);
insert into organizers (first_name, second_name, club_id) values ('Joshuah', 'Speir', 36);
insert into organizers (first_name, second_name, club_id) values ('Leanna', 'Pichmann', 37);
insert into organizers (first_name, second_name, club_id) values ('Jude', 'Forseith', 38);
insert into organizers (first_name, second_name, club_id) values ('Rhys', 'Pardie', 39);
insert into organizers (first_name, second_name, club_id) values ('Maighdiln', 'Mantrip', 40);
insert into organizers (first_name, second_name, club_id) values ('Niels', 'Oaker', 41);
insert into organizers (first_name, second_name, club_id) values ('Dorolice', 'Enos', 42);
insert into organizers (first_name, second_name, club_id) values ('Lilli', 'Bricksey', 43);
insert into organizers (first_name, second_name, club_id) values ('Sherri', 'Grinvalds', 44);
insert into organizers (first_name, second_name, club_id) values ('Mathe', 'McDougald', 45);
insert into organizers (first_name, second_name, club_id) values ('Cassandre', 'McElwee', 46);
insert into organizers (first_name, second_name, club_id) values ('Berna', 'Wordsley', 47);
insert into organizers (first_name, second_name, club_id) values ('Ronda', 'Burroughes', 48);
insert into organizers (first_name, second_name, club_id) values ('Myron', 'Heditch', 49);
insert into organizers (first_name, second_name, club_id) values ('Corrianne', 'Epinoy', 50);
