create table player_tournament_participation
(
    final_result  decimal not null,
    player_id     bigint references players (id) on delete cascade,
    tournament_id int references tournaments (id) on delete cascade
);