create or replace function tournament_participation() returns trigger
as
$$
begin
    if (tg_op = 'DELETE') then
        if (select count(m.id)
            from matches m
            where (m.first_player_id = old.first_player_id
                or m.second_player_id = old.first_player_id)
              and m.tournament_id = old.tournament_id) = 0 then
            delete
            from player_tournament_participation ptp
            where ptp.player_id = old.first_player_id
              and ptp.tournament_id = old.tournament_id;
        end if;
        if (select count(m.id)
            from matches m
            where (m.first_player_id = old.second_player_id
                or m.second_player_id = old.second_player_id)
              and m.tournament_id = old.tournament_id) = 0 then
            delete
            from player_tournament_participation ptp
            where ptp.player_id = old.second_player_id
              and ptp.tournament_id = old.tournament_id;
        end if;
        return old;
    elsif (tg_op = 'INSERT') then
        if (select count(*)
            from player_tournament_participation ptp
            where ptp.player_id = new.first_player_id
              and ptp.tournament_id = new.tournament_id) = 0 then
            insert into player_tournament_participation (player_id, tournament_id, final_result)
            values (new.first_player_id,
                    new.tournament_id,
                    case
                        when new.result = -1 then 0
                        when new.result = 0 then 0.5
                        when new.result = 1 then 1
                        end);
        else
            update player_tournament_participation ptp
            set final_result = case
                                   when new.result = 1 then final_result + 1
                                   when new.result = 0 then final_result + 0.5
                                   else final_result
                end
            where ptp.player_id = new.first_player_id
              and ptp.tournament_id = new.tournament_id;
        end if;
        if (select count(*)
            from player_tournament_participation ptp
            where ptp.player_id = new.second_player_id
              and ptp.tournament_id = new.tournament_id) = 0 then
            insert into player_tournament_participation (player_id, tournament_id, final_result)
            values (new.second_player_id,
                    new.tournament_id,
                    case
                        when new.result = -1 then 1
                        when new.result = 0 then 0.5
                        when new.result = 1 then 0
                        end);
        else
            update player_tournament_participation ptp
            set final_result = case
                                   when new.result = -1 then final_result + 1
                                   when new.result = 0 then final_result + 0.5
                                   else final_result
                end
            where ptp.player_id = new.second_player_id
              and ptp.tournament_id = new.tournament_id;
        end if;
        return new;
    elsif (tg_op = 'UPDATE') then
        update player_tournament_participation
        set final_result =
                case
                    when old.result = 1 then final_result - 1
                    when old.result = 0 then final_result - 0.5
                    else final_result
                    end
        where player_id = old.first_player_id
          and tournament_id = old.tournament_id;
        update player_tournament_participation
        set final_result =
                case
                    when old.result = -1 then final_result - 1
                    when old.result = 0 then final_result - 0.5
                    else final_result
                    end
        where player_id = old.second_player_id
          and tournament_id = old.tournament_id;

        if (select count(m.id)
            from matches m
            where (m.first_player_id = old.first_player_id
                or m.second_player_id = old.first_player_id)
              and m.tournament_id = old.tournament_id) = 0 then
            delete
            from player_tournament_participation ptp
            where ptp.player_id = old.first_player_id
              and ptp.tournament_id = old.tournament_id;
        end if;
        if (select count(m.id)
            from matches m
            where (m.first_player_id = old.second_player_id
                or m.second_player_id = old.second_player_id)
              and m.tournament_id = old.tournament_id) = 0 then
            delete
            from player_tournament_participation ptp
            where ptp.player_id = old.second_player_id
              and ptp.tournament_id = old.tournament_id;
        end if;

        if (select count(*)
            from player_tournament_participation ptp
            where ptp.player_id = new.first_player_id
              and ptp.tournament_id = new.tournament_id) = 0 then
            insert into player_tournament_participation (player_id, tournament_id, final_result)
            values (new.first_player_id,
                    new.tournament_id,
                    0);
        end if;
        if (select count(*)
            from player_tournament_participation ptp
            where ptp.player_id = new.second_player_id
              and ptp.tournament_id = new.tournament_id) = 0 then
            insert into player_tournament_participation (player_id, tournament_id, final_result)
            values (new.second_player_id,
                    new.tournament_id,
                    0);
        end if;

        update player_tournament_participation
        set final_result =
                case
                    when new.result = 1 then final_result + 1
                    when new.result = 0 then final_result + 0.5
                    else final_result
                    end
        where player_id = new.first_player_id
          and tournament_id = new.tournament_id;
        update player_tournament_participation
        set final_result =
                case
                    when new.result = -1 then final_result + 1
                    when new.result = 0 then final_result + 0.5
                    else final_result
                    end
        where player_id = new.second_player_id
          and tournament_id = new.tournament_id;

        return new;
    end if;
    return null;
end;
$$ language plpgsql;

create trigger match_created
    after insert or update or delete
    on matches
    for each row
execute procedure tournament_participation();