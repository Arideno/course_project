create or replace view unowned_clubs as
select *
from club c
where c.id not in
      (select o.club_id from organizers o);