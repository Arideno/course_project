package store

import (
	"fmt"
	"github.com/arideno/course_project/models"
	"math"
)

type MatchRepository struct {
	store *Store
}

func (r *MatchRepository) Create(match *models.Match) error {
	_, err := r.store.db.Exec("CALL create_match_procedure($1, $2, $3, $4, $5)", match.StartDate, match.Result, match.Tournament.Id, match.FirstPlayer.Id, match.SecondPlayer.Id)
	return err
}

func (r *MatchRepository) Update(match *models.Match) error {
	_, err := r.store.db.Exec("UPDATE matches SET start_date = $1, result = $2, tournament_id = $3, first_player_id = $4, second_player_id = $5 WHERE id = $6", match.StartDate, match.Result, match.Tournament.Id, match.FirstPlayer.Id, match.SecondPlayer.Id, match.Id)
	return err
}

func (r *MatchRepository) SelectById(id int) (*models.Match, error) {
	var match models.Match
	err := r.store.db.Get(&match, `SELECT m.id, m.start_date, m.result, t.id "tournament.id", t.name "tournament.name", first_p.id "first_player.id", first_p.first_name "first_player.first_name", first_p.last_name "first_player.last_name", first_p.rank "first_player.rank", second_p.id "second_player.id", second_p.first_name "second_player.first_name", second_p.last_name "second_player.last_name", second_p.rank "second_player.rank" FROM matches m LEFT JOIN players first_p on first_p.id = m.first_player_id LEFT JOIN players second_p on second_p.id = m.second_player_id LEFT JOIN tournaments t on m.tournament_id = t.id WHERE m.id = $1`, id)
	if err != nil {
		return nil, err
	}

	return &match, nil
}

func (r *MatchRepository) SelectAll(page int, perPage int, name, tournamentName string) ([]*models.Match, int) {
	matches := make([]*models.Match, 0)
	if perPage == 0 {
		query := `SELECT m.id, m.start_date, m.result, t.id "tournament.id", t.name "tournament.name", first_p.id "first_player.id", first_p.first_name "first_player.first_name", first_p.last_name "first_player.last_name", first_p.rank "first_player.rank", second_p.id "second_player.id", second_p.first_name "second_player.first_name", second_p.last_name "second_player.last_name", second_p.rank "second_player.rank" FROM matches m LEFT JOIN players first_p on first_p.id = m.first_player_id LEFT JOIN players second_p on second_p.id = m.second_player_id LEFT JOIN tournaments t on m.tournament_id = t.id`
		wasWhere := false
		if name != "" {
			query += fmt.Sprintf(" WHERE (first_p.first_name ILIKE '%%%s%%' OR first_p.last_name ILIKE '%%%s%%' OR second_p.first_name ILIKE '%%%s%%' OR second_p.last_name ILIKE '%%%s%%')", name, name, name, name)
			wasWhere = true
		}
		if tournamentName != "" {
			if wasWhere {
				query += fmt.Sprintf(" AND t.name ILIKE '%%%s%%'", tournamentName)
			} else {
				query += fmt.Sprintf(" WHERE t.name ILIKE '%%%s%%'", tournamentName)
			}
		}
		query += " ORDER BY m.id"
		_ = r.store.db.Select(&matches, query)
		return matches, 0
	} else {
		query := `SELECT m.id, m.start_date, m.result, t.id "tournament.id", t.name "tournament.name", first_p.id "first_player.id", first_p.first_name "first_player.first_name", first_p.last_name "first_player.last_name", first_p.rank "first_player.rank", second_p.id "second_player.id", second_p.first_name "second_player.first_name", second_p.last_name "second_player.last_name", second_p.rank "second_player.rank" FROM matches m LEFT JOIN players first_p on first_p.id = m.first_player_id LEFT JOIN players second_p on second_p.id = m.second_player_id LEFT JOIN tournaments t on m.tournament_id = t.id`
		queryCount := `SELECT count(m.id) FROM matches m LEFT JOIN players first_p on first_p.id = m.first_player_id LEFT JOIN players second_p on second_p.id = m.second_player_id LEFT JOIN tournaments t on m.tournament_id = t.id`
		wasWhere := false
		if name != "" {
			query += fmt.Sprintf(" WHERE (first_p.first_name ILIKE '%%%s%%' OR first_p.last_name ILIKE '%%%s%%' OR second_p.first_name ILIKE '%%%s%%' OR second_p.last_name ILIKE '%%%s%%')", name, name, name, name)
			queryCount += fmt.Sprintf(" WHERE (first_p.first_name ILIKE '%%%s%%' OR first_p.last_name ILIKE '%%%s%%' OR second_p.first_name ILIKE '%%%s%%' OR second_p.last_name ILIKE '%%%s%%')", name, name, name, name)
			wasWhere = true
		}
		if tournamentName != "" {
			if wasWhere {
				query += fmt.Sprintf(" AND t.name ILIKE '%%%s%%'", tournamentName)
				queryCount += fmt.Sprintf(" AND t.name ILIKE '%%%s%%'", tournamentName)
			} else {
				query += fmt.Sprintf(" WHERE t.name ILIKE '%%%s%%'", tournamentName)
				queryCount += fmt.Sprintf(" WHERE t.name ILIKE '%%%s%%'", tournamentName)
			}
		}
		query += " ORDER BY m.id OFFSET $1 LIMIT $2"
		_ = r.store.db.Select(&matches, query, (page - 1) * perPage, perPage)
		var count int
		_ = r.store.db.Get(&count, queryCount)
		return matches, int(math.Ceil(float64(count) / float64(perPage)))
	}
}

func (r *MatchRepository) GetPlayers(id int) []*models.Player {
	var firstPlayer models.Player
	var secondPlayer models.Player
	_ = r.store.db.Get(&firstPlayer, "SELECT * FROM players WHERE id = (SELECT first_player_id FROM matches WHERE id = $1)", id)
	_ = r.store.db.Get(&secondPlayer, "SELECT * FROM players WHERE id = (SELECT second_player_id FROM matches WHERE id = $1)", id)

	return []*models.Player{
		&firstPlayer, &secondPlayer,
	}
}

func (r *MatchRepository) Delete(id int) error {
	_, err := r.store.db.Exec("DELETE FROM matches WHERE id = $1", id)
	return err
}