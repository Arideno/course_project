create or replace function get_players_for_tournament(tournamentId int)
    returns table
            (
                id           bigint,
                first_name   varchar(255),
                last_name    varchar(255),
                address      text,
                phone_number varchar(20),
                email        varchar(50),
                rank         int
            )
as
$$
begin
    return query
    select p.id, p.first_name, p.last_name, p.address, p.phone_number, p.email, p.rank from players p left join player_tournament_participation ptp on p.id = ptp.player_id where ptp.tournament_id = tournamentId;
end;
$$
language plpgsql;