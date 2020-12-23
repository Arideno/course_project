create table matches
(
    id               serial primary key,
    start_date       date     not null,
    result           smallint not null default 0 check ( result >= -1 and result <= 1 ),
    tournament_id    int references tournaments (id) on delete cascade,
    first_player_id  bigint references players (id) on delete cascade,
    second_player_id bigint references players (id) on delete cascade check ( second_player_id != first_player_id )
);