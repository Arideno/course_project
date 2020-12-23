create user user_of_db;
grant select, trigger on all tables in schema public to user_of_db;
grant connect on database postgres to user_of_db;
grant execute on all functions in schema public to user_of_db;