package store

import (
	"fmt"
	"github.com/arideno/course_project/models"
	"github.com/jackc/pgtype"
	"log"
	"math"
)

type PlayerRepository struct {
	store *Store
}

func (r *PlayerRepository) Create(player *models.Player) error {
	_, err := r.store.db.Exec("INSERT INTO players(first_name, last_name, address, phone_number, email, rank, club_id) VALUES ($1, $2, $3, $4, $5, $6, $7)", player.FirstName, player.LastName, player.Address, player.PhoneNumber, player.Email, player.Rank, player.Club.Id)
	return err
}

func (r *PlayerRepository) Update(player *models.Player) error {
	_, err := r.store.db.Exec("UPDATE players SET first_name = $1, last_name = $2, address = $3, phone_number = $4, email = $5, rank = $6, club_id = $7 WHERE id = $8", player.FirstName, player.LastName, player.Address, player.PhoneNumber, player.Email, player.Rank, player.Club.Id, player.Id)
	return err
}

func (r *PlayerRepository) SelectById(id int64) (*models.Player, error) {
	var player models.Player
	err := r.store.db.Get(&player, `SELECT p.id, p.first_name, p.last_name, p.address, p.phone_number, p.email, p.rank, c.id "club.id", c.name "club.name", c.address "club.address", c.logo "club.logo", c.website "club.website" FROM players p LEFT JOIN club c ON c.id = p.club_id WHERE p.id = $1`, id)
	if err != nil {
		return nil, err
	}

	return &player, nil
}

func (r *PlayerRepository) SelectAll(page int, perPage int, name, address, email, phone string, firstRate, secondRate, clubId int) ([]*models.Player, int) {
	players := make([]*models.Player, 0)
	if perPage == 0 {
		query := `SELECT p.id, p.first_name, p.last_name, p.address, p.phone_number, p.email, p.rank, c.id "club.id", c.name "club.name", c.address "club.address", c.logo "club.logo", c.website "club.website" FROM players p LEFT JOIN club c ON c.id = p.club_id`
		wasWhere := false
		if name != "" {
			query += fmt.Sprintf(" WHERE (first_name ILIKE '%%%s%%' OR last_name ILIKE '%%%s%%')", name, name)
			wasWhere = true
		}
		if address != "" {
			if wasWhere {
				query += fmt.Sprintf(" AND p.address ILIKE '%%%s%%'", address)
			} else {
				query += fmt.Sprintf(" WHERE p.address ILIKE '%%%s%%'", address)
			}
			wasWhere = true
		}
		if email != "" {
			if wasWhere {
				query += fmt.Sprintf(" AND email ILIKE '%%%s%%'", email)
			} else {
				query += fmt.Sprintf(" WHERE email ILIKE '%%%s%%'", email)
			}
			wasWhere = true
		}
		if phone != "" {
			if wasWhere {
				query += fmt.Sprintf(" AND phone_number ILIKE '%%%s%%'", phone)
			} else {
				query += fmt.Sprintf(" WHERE phone_number ILIKE '%%%s%%'", phone)
			}
			wasWhere = true
		}
		if firstRate != 0 {
			if wasWhere {
				query += fmt.Sprintf(" AND rank >= %d", firstRate)
			} else {
				query += fmt.Sprintf(" WHERE rank >= %d", firstRate)
			}
			wasWhere = true
		}
		if secondRate != 0 {
			if wasWhere {
				query += fmt.Sprintf(" AND rank <= %d", secondRate)
			} else {
				query += fmt.Sprintf(" WHERE rank <= %d", secondRate)
			}
			wasWhere = true
		}
		if clubId != 0 {
			if wasWhere {
				query += fmt.Sprintf(" AND c.id = %d", clubId)
			} else {
				query += fmt.Sprintf(" WHERE c.id = %d", clubId)
			}
		}
		query += " ORDER BY p.id"
		_ = r.store.db.Select(&players, query)
		return players, 0
	} else {
		query := `SELECT p.id, p.first_name, p.last_name, p.address, p.phone_number, p.email, p.rank, c.id "club.id", c.name "club.name", c.address "club.address", c.logo "club.logo", c.website "club.website" FROM players p LEFT JOIN club c ON c.id = p.club_id`
		queryCount := "SELECT count(id) FROM players"
		wasWhere := false
		if name != "" {
			query += fmt.Sprintf(" WHERE (first_name ILIKE '%%%s%%' OR last_name ILIKE '%%%s%%')", name, name)
			queryCount += fmt.Sprintf(" WHERE (first_name ILIKE '%%%s%%' OR last_name ILIKE '%%%s%%')", name, name)
			wasWhere = true
		}
		if address != "" {
			if wasWhere {
				query += fmt.Sprintf(" AND p.address ILIKE '%%%s%%'", address)
				queryCount += fmt.Sprintf(" AND address ILIKE '%%%s%%'", address)
			} else {
				query += fmt.Sprintf(" WHERE p.address ILIKE '%%%s%%'", address)
				queryCount += fmt.Sprintf(" WHERE address ILIKE '%%%s%%'", address)
			}
			wasWhere = true
		}
		if email != "" {
			if wasWhere {
				query += fmt.Sprintf(" AND email ILIKE '%%%s%%'", email)
				queryCount += fmt.Sprintf(" AND email ILIKE '%%%s%%'", email)
			} else {
				query += fmt.Sprintf(" WHERE email ILIKE '%%%s%%'", email)
				queryCount += fmt.Sprintf(" WHERE email ILIKE '%%%s%%'", email)
			}
			wasWhere = true
		}
		if phone != "" {
			if wasWhere {
				query += fmt.Sprintf(" AND phone_number ILIKE '%%%s%%'", phone)
				queryCount += fmt.Sprintf(" AND phone_number ILIKE '%%%s%%'", phone)
			} else {
				query += fmt.Sprintf(" WHERE phone_number ILIKE '%%%s%%'", phone)
				queryCount += fmt.Sprintf(" WHERE phone_number ILIKE '%%%s%%'", phone)
			}
			wasWhere = true
		}
		if firstRate != 0 {
			if wasWhere {
				query += fmt.Sprintf(" AND rank >= %d", firstRate)
				queryCount += fmt.Sprintf(" AND rank >= %d", firstRate)
			} else {
				query += fmt.Sprintf(" WHERE rank >= %d", firstRate)
				queryCount += fmt.Sprintf(" WHERE rank >= %d", firstRate)
			}
			wasWhere = true
		}
		if secondRate != 0 {
			if wasWhere {
				query += fmt.Sprintf(" AND rank <= %d", secondRate)
				queryCount += fmt.Sprintf(" AND rank <= %d", secondRate)
			} else {
				query += fmt.Sprintf(" WHERE rank <= %d", secondRate)
				queryCount += fmt.Sprintf(" WHERE rank <= %d", secondRate)
			}
		}
		if clubId != 0 {
			if wasWhere {
				query += fmt.Sprintf(" AND c.id = %d", clubId)
				queryCount += fmt.Sprintf(" AND club_id = %d", clubId)
			} else {
				query += fmt.Sprintf(" WHERE c.id = %d", clubId)
				queryCount += fmt.Sprintf(" WHERE club_id = %d", clubId)
			}
		}
		query += fmt.Sprintf(" ORDER BY p.id OFFSET %d LIMIT %d", (page - 1) * perPage, perPage)
		log.Println(query)
		err := r.store.db.Select(&players, query)
		log.Println(err)
		var count int
		_ = r.store.db.Get(&count, queryCount)
		return players, int(math.Ceil(float64(count) / float64(perPage)))
	}
}

func (r *PlayerRepository) SelectClub(id int64) (*models.Club, error) {
	var club models.Club
	err := r.store.db.Get(&club, "SELECT * FROM club WHERE id = (SELECT club_id FROM players WHERE id = $1)", id)
	if err != nil {
		return nil, err
	}

	return &club, nil
}

func (r *PlayerRepository) SelectTournaments(id int64) ([]*models.Tournament, []float64, []int, []int) {
	tournaments := make([]*models.Tournament, 0)

	tournamentIds := make([]int, 0)
	finalResults := make([]float64, 0)
	rows, _ := r.store.db.Query("SELECT tournament_id, final_result FROM player_tournament_participation WHERE player_id = $1 ORDER BY tournament_id", id)
	for rows.Next() {
		var tournamentId int
		var finalResult float64
		_ = rows.Scan(&tournamentId, &finalResult)
		tournamentIds = append(tournamentIds, tournamentId)
		finalResults = append(finalResults, finalResult)
	}
	rows.Close()

	arr := &pgtype.Int4Array{}
	arr.Set(tournamentIds)
	rw, _ := r.store.db.Queryx("SELECT t.id, t.name, t.start_date, t.end_date FROM tournaments t WHERE id = ANY($1) ORDER BY id", arr)
	for rw.Next() {
		var tournament models.Tournament
		_ = rw.StructScan(&tournament)
		tournaments = append(tournaments, &tournament)
	}
	rows.Close()

	matchesPlayedArray := make([]int, 0)
	for _, tournament := range tournaments {
		var matchesPlayed int
		_ = r.store.db.Get(&matchesPlayed, "SELECT * from get_number_of_matches_for_player($1, $2)", id, tournament.Id)
		matchesPlayedArray = append(matchesPlayedArray, matchesPlayed)
	}

	productiveMatchesArray := make([]int, 0)
	for _, tournament := range tournaments {
		var productiveMatches int
		_ = r.store.db.Get(&productiveMatches, "SELECT * from get_productive_matches_count($1, $2)", id, tournament.Id)
		productiveMatchesArray = append(productiveMatchesArray, productiveMatches)
	}

	return tournaments, finalResults, matchesPlayedArray, productiveMatchesArray
}

func (r *PlayerRepository) SelectMatches(id int64) []*models.Match {
	matches := make([]*models.Match, 0)
	_ = r.store.db.Select(&matches, "SELECT * FROM matches WHERE first_player_id = $1 OR second_player_id = $1", id)

	return matches
}

func (r *PlayerRepository) Delete(id int) error {
	_, err := r.store.db.Exec("DELETE FROM players WHERE id = $1", id)
	return err
}