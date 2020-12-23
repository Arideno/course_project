create or replace function get_number_of_matches_for_player(playerId bigint, tournamentId int)
returns int as
$$
begin
    return (select count(m.id) from matches m where (m.first_player_id = playerId or m.second_player_id = playerId) and m.tournament_id = tournamentId);
end;
$$
language plpgsql;