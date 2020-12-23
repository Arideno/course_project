package store

import (
	_ "github.com/jackc/pgx/v4/stdlib"
	"github.com/jmoiron/sqlx"
	"os"
)

type Store struct {
	db *sqlx.DB
	sponsorRepository *SponsorRepository
	clubRepository *ClubRepository
	organizerRepository *OrganizerRepository
	tournamentRepository *TournamentRepository
	playerRepository *PlayerRepository
	matchRepository *MatchRepository
}

func NewStore() *Store {
	return &Store{}
}

func (s *Store) Open() error {
	db, err := sqlx.Connect("pgx", os.Getenv("DB_URL"))
	if err != nil {
		return err
	}
	s.db = db

	return nil
}

func (s *Store) Close() {
	s.db.Close()
}

func (s *Store) Sponsor() *SponsorRepository {
	if s.sponsorRepository != nil {
		return s.sponsorRepository
	}

	s.sponsorRepository = &SponsorRepository{
		store: s,
	}

	return s.sponsorRepository
}

func (s *Store) Club() *ClubRepository {
	if s.clubRepository != nil {
		return s.clubRepository
	}

	s.clubRepository = &ClubRepository{
		store: s,
	}

	return s.clubRepository
}

func (s *Store) Organizer() *OrganizerRepository {
	if s.organizerRepository != nil {
		return s.organizerRepository
	}

	s.organizerRepository = &OrganizerRepository{
		store: s,
	}

	return s.organizerRepository
}

func (s *Store) Tournament() *TournamentRepository {
	if s.tournamentRepository != nil {
		return s.tournamentRepository
	}

	s.tournamentRepository = &TournamentRepository{
		store: s,
	}

	return s.tournamentRepository
}

func (s *Store) Player() *PlayerRepository {
	if s.playerRepository != nil {
		return s.playerRepository
	}

	s.playerRepository = &PlayerRepository{
		store: s,
	}

	return s.playerRepository
}

func (s *Store) Match() *MatchRepository {
	if s.matchRepository != nil {
		return s.matchRepository
	}

	s.matchRepository = &MatchRepository{
		store: s,
	}

	return s.matchRepository
}