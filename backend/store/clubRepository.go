package store

import (
	"fmt"
	"github.com/arideno/course_project/models"
	"log"
	"math"
)

type ClubRepository struct {
	store *Store
}

func (r *ClubRepository) Create(club *models.Club) error {
	_, err := r.store.db.Exec("INSERT INTO club(name, address, logo, website) VALUES ($1, $2, $3, $4)", club.Name, club.Address, club.Logo, club.Website)
	return err
}

func (r *ClubRepository) Update(club *models.Club) error {
	_, err := r.store.db.Exec("UPDATE club SET name = $1, address = $2, logo = $3, website = $4 WHERE id = $5", club.Name, club.Address, club.Logo, club.Website, club.Id)
	return err
}

func (r *ClubRepository) SelectById(id int) (*models.Club, error) {
	var club models.Club
	err := r.store.db.Get(&club, "SELECT * FROM club WHERE id = $1", id)
	if err != nil {
		return nil, err
	}

	return &club, nil
}

func (r *ClubRepository) SelectAll(page int, perPage int, name, address string) ([]*models.Club, int) {
	clubs := make([]*models.Club, 0)
	if perPage == 0 {
		query := "SELECT * FROM club"
		wasWhere := false
		if name != "" {
			query += fmt.Sprintf(" WHERE name ILIKE '%%%s%%'", name)
			wasWhere = true
		}
		if address != "" {
			if wasWhere {
				query += fmt.Sprintf(" AND address ILIKE '%%%s%%'", address)
			} else {
				query += fmt.Sprintf(" WHERE address ILIKE '%%%s%%'", address)
			}
		}
		query += " ORDER BY id"
		log.Println(query)
		_ = r.store.db.Select(&clubs, query)
		return clubs, 0
	} else {
		query := "SELECT * FROM club"
		queryCount := "SELECT count(id) FROM club"
		wasWhere := false
		if name != "" {
			query += fmt.Sprintf(" WHERE name ILIKE '%%%s%%'", name)
			queryCount += fmt.Sprintf(" WHERE name ILIKE '%%%s%%'", name)
			wasWhere = true
		}
		if address != "" {
			if wasWhere {
				query += fmt.Sprintf(" AND address ILIKE '%%%s%%'", address)
				queryCount += fmt.Sprintf(" AND address ILIKE '%%%s%%'", address)
			} else {
				query += fmt.Sprintf(" WHERE address ILIKE '%%%s%%'", address)
				queryCount += fmt.Sprintf(" WHERE address ILIKE '%%%s%%'", address)
			}
		}
		query += fmt.Sprintf(" ORDER BY id OFFSET %d LIMIT %d", (page - 1) * perPage, perPage)
		log.Println(query)
		_ = r.store.db.Select(&clubs, query)
		var count int
		_ = r.store.db.Get(&count, queryCount)
		return clubs, int(math.Ceil(float64(count) / float64(perPage)))
	}
}

func (r *ClubRepository) SelectUnowned() []*models.Club {
	clubs := make([]*models.Club, 0)
	_ = r.store.db.Select(&clubs, "SELECT * FROM unowned_clubs")
	return clubs
}

func (r *ClubRepository) GetOrganizer(id int) (*models.Organizer, error) {
	var organizer models.Organizer
	err := r.store.db.Get(&organizer, "SELECT * FROM organizers WHERE club_id = $1", id)
	if err != nil {
		return nil, err
	}

	return &organizer, nil
}

func (r *ClubRepository) GetPlayers(id int) []*models.Player {
	players := make([]*models.Player, 0)
	_ = r.store.db.Select(&players, "SELECT * FROM players WHERE club_id = $1", id)

	return players
}

func (r *ClubRepository) Delete(id int) error {
	_, err := r.store.db.Exec("DELETE FROM club WHERE id = $1", id)
	return err
}
