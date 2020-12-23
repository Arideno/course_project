create or replace function delete_club_with_organizer() returns trigger as
$$
begin
    delete from club c where c.id = old.club_id;
    return old;
end;
$$
language plpgsql;

create trigger organizer_deleted
after delete on organizers
for each row execute procedure delete_club_with_organizer();