create table tournaments
(
    id           serial primary key,
    start_date   date         not null,
    end_date     date         not null check ( end_date > start_date ),
    name         varchar(100) not null,
    organizer_id int references organizers (id) on delete cascade
);

insert into tournaments (start_date, end_date, name, organizer_id) values ('11/04/2020', '11/10/2020', 'Sphagnum', 44);
insert into tournaments (start_date, end_date, name, organizer_id) values ('06/03/2020', '06/10/2020', 'Yuma Browneyes', 39);
insert into tournaments (start_date, end_date, name, organizer_id) values ('05/25/2020', '06/03/2020', 'Pseudobryum Moss', 43);
insert into tournaments (start_date, end_date, name, organizer_id) values ('06/17/2020', '06/26/2020', 'Peebles'' Bluestar', 14);
insert into tournaments (start_date, end_date, name, organizer_id) values ('11/26/2020', '12/02/2020', 'Tushar Plateau Indian Paintbrush', 50);
insert into tournaments (start_date, end_date, name, organizer_id) values ('02/04/2020', '02/10/2020', 'Indian Woodoats', 25);
insert into tournaments (start_date, end_date, name, organizer_id) values ('06/25/2020', '07/03/2020', 'Sunbright', 12);
insert into tournaments (start_date, end_date, name, organizer_id) values ('03/27/2020', '04/01/2020', 'Decodon', 10);
insert into tournaments (start_date, end_date, name, organizer_id) values ('06/08/2020', '06/17/2020', 'Pirigallo', 6);
insert into tournaments (start_date, end_date, name, organizer_id) values ('02/29/2020', '03/07/2020', 'Reed', 8);
insert into tournaments (start_date, end_date, name, organizer_id) values ('08/18/2020', '08/27/2020', 'Diamond Valley Suncup', 27);
insert into tournaments (start_date, end_date, name, organizer_id) values ('02/25/2020', '03/02/2020', 'Scarlet Bottlebrush', 7);
insert into tournaments (start_date, end_date, name, organizer_id) values ('01/24/2020', '01/29/2020', 'Leavenworth''s Sedge', 34);
insert into tournaments (start_date, end_date, name, organizer_id) values ('12/08/2020', '12/14/2020', 'Andrews'' Lecodon Moss', 9);
insert into tournaments (start_date, end_date, name, organizer_id) values ('05/26/2020', '06/03/2020', 'Anisomeridium Lichen', 29);
insert into tournaments (start_date, end_date, name, organizer_id) values ('08/24/2020', '08/31/2020', 'Kern River Fleabane', 13);
insert into tournaments (start_date, end_date, name, organizer_id) values ('01/02/2020', '01/11/2020', 'Pholisma', 31);
insert into tournaments (start_date, end_date, name, organizer_id) values ('05/03/2020', '05/08/2020', 'Kolekole Cyanea', 1);
insert into tournaments (start_date, end_date, name, organizer_id) values ('10/04/2020', '10/11/2020', 'Ravenel''s Pipewort', 42);
insert into tournaments (start_date, end_date, name, organizer_id) values ('01/28/2020', '02/05/2020', 'Resurrection Plant', 5);
insert into tournaments (start_date, end_date, name, organizer_id) values ('06/17/2020', '06/23/2020', 'Plain Mariposa Lily', 50);
insert into tournaments (start_date, end_date, name, organizer_id) values ('04/15/2020', '04/24/2020', 'Reverchon''s Bristlegrass', 15);
insert into tournaments (start_date, end_date, name, organizer_id) values ('10/11/2020', '10/19/2020', 'Cup Lichen', 20);
insert into tournaments (start_date, end_date, name, organizer_id) values ('05/21/2020', '05/30/2020', 'Blue Wild Indigo', 37);
insert into tournaments (start_date, end_date, name, organizer_id) values ('02/09/2020', '02/14/2020', 'Chamisso Arnica', 48);
insert into tournaments (start_date, end_date, name, organizer_id) values ('02/03/2020', '02/09/2020', 'Wright''s Laurel Canelon', 47);
insert into tournaments (start_date, end_date, name, organizer_id) values ('08/31/2020', '09/07/2020', 'Organ Mountain Foxtail Cactus', 4);
insert into tournaments (start_date, end_date, name, organizer_id) values ('10/07/2020', '10/12/2020', 'Howell''s Dicranum Moss', 44);
insert into tournaments (start_date, end_date, name, organizer_id) values ('08/26/2020', '09/04/2020', 'Marsh''s Dutchman''s Pipe', 23);
insert into tournaments (start_date, end_date, name, organizer_id) values ('09/01/2020', '09/09/2020', 'Florida Bellwort', 4);
