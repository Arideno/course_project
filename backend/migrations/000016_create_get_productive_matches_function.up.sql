create or replace function get_productive_matches_count(playerId bigint, tournamentId int)
    returns int as
$$
begin
    return (
        select count(matches.id)
        from (
                 select *
                 from matches m
                 where m.first_player_id = playerId
                   and m.tournament_id = tournamentId
                   and m.result = 1
                 union
                 select *
                 from matches m
                 where (m.first_player_id = playerId or
                        m.second_player_id = playerId)
                   and m.tournament_id = tournamentId
                   and m.result = 0
                 union
                 select *
                 from matches m
                 where m.second_player_id = playerId
                   and m.tournament_id = tournamentId
                   and m.result = -1
             ) matches
    );
end;
$$
language plpgsql;