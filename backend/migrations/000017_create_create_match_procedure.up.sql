create or replace procedure create_match_procedure(startDate date,
                                                   matchResult smallint,
                                                    tournamentId bigint,
                                                    firstPlayerId bigint,
                                                    secondPlayerId bigint)
language plpgsql
as
$$
begin
    if (matchResult != 0 and matchResult != 1 and matchResult != -1) then
        raise exception 'Wrong result value';
    end if;
    insert into matches(start_date, result, tournament_id, first_player_id, second_player_id)
                values (startDate, matchResult, tournamentId, firstPlayerId, secondPlayerId);
    commit;
end
$$