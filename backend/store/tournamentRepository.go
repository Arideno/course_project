package store

import (
	"fmt"
	"github.com/arideno/course_project/models"
	"log"
	"math"
)

type TournamentRepository struct {
	store *Store
}

func (r *TournamentRepository) Create(tournament *models.Tournament) error {
	_, err := r.store.db.Exec("INSERT INTO tournaments(start_date, end_date, name, organizer_id) VALUES ($1, $2, $3, $4)", tournament.StartDate, tournament.EndDate, tournament.Name, tournament.Organizer.Id)
	return err
}

func (r *TournamentRepository) Update(tournament *models.Tournament) error {
	_, err := r.store.db.Exec("UPDATE tournaments SET start_date = $1, end_date = $2, name = $3, organizer_id = $4 WHERE id = $5", tournament.StartDate, tournament.EndDate, tournament.Name, tournament.Organizer.Id, tournament.Id)
	return err
}

func (r *TournamentRepository) SelectById(id int) (*models.Tournament, error) {
	var tournament models.Tournament
	err := r.store.db.Get(&tournament, `SELECT t.id, t.start_date, t.end_date, t.name, o.id "organizer.id", o.first_name "organizer.first_name", o.last_name "organizer.last_name" FROM tournaments t LEFT JOIN organizers o ON o.id = t.organizer_id WHERE t.id = $1`, id)
	if err != nil {
		return nil, err
	}

	return &tournament, nil
}

func (r *TournamentRepository) SelectAll(page int, perPage int, name string, startDate, endDate string) ([]*models.Tournament, int) {
	tournaments := make([]*models.Tournament, 0)
	if perPage == 0 {
		query := "SELECT t.id, t.start_date, t.end_date, t.name, o.id \"organizer.id\", o.first_name \"organizer.first_name\", o.last_name \"organizer.last_name\" FROM tournaments t LEFT JOIN organizers o ON o.id = t.organizer_id"
		wasWhere := false
		if name != "" {
			query += fmt.Sprintf(" WHERE name ILIKE '%%%s%%'", name)
			wasWhere = true
		}
		if startDate != "" {
			if wasWhere {
				query += fmt.Sprintf(" AND start_date >= '%s'", startDate)
			} else {
				query += fmt.Sprintf(" WHERE start_date >= '%s'", startDate)
			}
			wasWhere = true
		}
		if endDate != "" {
			if wasWhere {
				query += fmt.Sprintf(" AND end_date <= '%s'", endDate)
			} else {
				query += fmt.Sprintf(" WHERE end_date <= '%s'", endDate)
			}
		}
		query += " ORDER BY t.id"
		log.Println(query)
		_ = r.store.db.Select(&tournaments, query)
		return tournaments, 0
	} else {
		query := "SELECT t.id, t.start_date, t.end_date, t.name, o.id \"organizer.id\", o.first_name \"organizer.first_name\", o.last_name \"organizer.last_name\" FROM tournaments t LEFT JOIN organizers o ON o.id = t.organizer_id"
		queryCount := "SELECT count(id) FROM tournaments"
		wasWhere := false
		if name != "" {
			query += fmt.Sprintf(" WHERE name ILIKE '%%%s%%'", name)
			queryCount += fmt.Sprintf(" WHERE name ILIKE '%%%s%%'", name)
			wasWhere = true
		}
		if startDate != "" {
			if wasWhere {
				query += fmt.Sprintf(" AND start_date >= '%s'", startDate)
				queryCount += fmt.Sprintf(" AND start_date >= '%s'", startDate)
			} else {
				query += fmt.Sprintf(" WHERE start_date >= '%s'", startDate)
				queryCount += fmt.Sprintf(" WHERE start_date >= '%s'", startDate)
			}
			wasWhere = true
		}
		if endDate != "" {
			if wasWhere {
				query += fmt.Sprintf(" AND end_date <= '%s'", endDate)
				queryCount += fmt.Sprintf(" AND end_date <= '%s'", endDate)
			} else {
				query += fmt.Sprintf(" WHERE end_date <= '%s'", endDate)
				queryCount += fmt.Sprintf(" WHERE end_date <= '%s'", endDate)
			}
		}
		query += fmt.Sprintf(" ORDER BY t.id OFFSET %d LIMIT %d", (page - 1) * perPage, perPage)
		log.Println(query)
		_ = r.store.db.Select(&tournaments, query)
		var count int
		_ = r.store.db.Get(&count, queryCount)
		return tournaments, int(math.Ceil(float64(count) / float64(perPage)))
	}
}

func (r *TournamentRepository) GetOrganizer(id int) (*models.Organizer, error) {
	var organizer models.Organizer
	err := r.store.db.Get(&organizer, "SELECT * FROM organizers WHERE id = (SELECT organizer_id FROM tournaments WHERE id = $1)", id)
	if err != nil {
		return nil, err
	}

	return &organizer, nil
}

func (r *TournamentRepository) SelectSponsors(id int) []*models.Sponsor {
	sponsors := make([]*models.Sponsor, 0)
	_ = r.store.db.Select(&sponsors, "SELECT * FROM sponsors WHERE id = (SELECT sponsor_id FROM tournament_sponsors WHERE tournament_id = $1)", id)
	return sponsors
}

func (r *TournamentRepository) SelectPlayers(id int) []*models.Player {
	players := make([]*models.Player, 0)
	_ = r.store.db.Select(&players, "SELECT * FROM get_players_for_tournament($1)", id)
	return players
}

func (r *TournamentRepository) SelectMatches(id int) []*models.Match {
	matches := make([]*models.Match, 0)
	_ = r.store.db.Select(&matches, "SELECT * FROM matches WHERE tournament_id = $1", id)
	return matches
}

func (r *TournamentRepository) Delete(id int) error {
	_, err := r.store.db.Exec("DELETE FROM tournaments WHERE id = $1", id)
	return err
}
