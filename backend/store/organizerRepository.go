package store

import (
	"fmt"
	"github.com/arideno/course_project/models"
	"log"
	"math"
)

type OrganizerRepository struct {
	store *Store
}

func (r *OrganizerRepository) Create(organizer *models.Organizer) error {
	_, err := r.store.db.Exec("INSERT INTO organizers(first_name, last_name, club_id) VALUES ($1, $2, $3)", organizer.FirstName, organizer.LastName, organizer.Club.Id)
	return err
}

func (r *OrganizerRepository) Update(organizer *models.Organizer) error {
	_, err := r.store.db.Exec("UPDATE organizers SET first_name = $1, last_name = $2, club_id = $3 WHERE id = $4", organizer.FirstName, organizer.LastName, organizer.Club.Id, organizer.Id)
	return err
}

func (r *OrganizerRepository) SelectById(id int) (*models.Organizer, error) {
	var organizer models.Organizer
	err := r.store.db.Get(&organizer, `SELECT o.id, o.first_name, o.last_name, c.id "club.id", c.name "club.name", c.address "club.address", c.logo "club.logo", c.website "club.website" FROM organizers o LEFT JOIN club c ON c.id = o.club_id WHERE o.id = $1`, id)
	if err != nil {
		return nil, err
	}

	return &organizer, nil
}

func (r *OrganizerRepository) SelectAll(page int, perPage int, name string, clubId int) ([]*models.Organizer, int) {
	organizers := make([]*models.Organizer, 0)
	if perPage == 0 {
		query := `SELECT o.id, o.first_name, o.last_name, c.id "club.id", c.name "club.name", c.address "club.address", c.logo "club.logo", c.website "club.website" FROM organizers o LEFT JOIN club c ON c.id = o.club_id`
		wasWhere := false
		if name != "" {
			query += fmt.Sprintf(" WHERE (first_name ILIKE '%%%s%%' OR last_name ILIKE '%%%s%%')", name, name)
			wasWhere = true
		}
		if clubId != 0 {
			if wasWhere {
				query += fmt.Sprintf(" AND c.id = %d", clubId)
			} else {
				query += fmt.Sprintf(" WHERE c.id = %d", clubId)
			}
		}
		query += " ORDER BY o.id"
		log.Println(query)
		_ = r.store.db.Select(&organizers, query)
		return organizers, 0
	} else {
		query := `SELECT o.id, o.first_name, o.last_name, c.id "club.id", c.name "club.name", c.address "club.address", c.logo "club.logo", c.website "club.website" FROM organizers o LEFT JOIN club c ON c.id = o.club_id`
		queryCount := "SELECT count(id) FROM organizers"
		wasWhere := false
		if name != "" {
			query += fmt.Sprintf(" WHERE (first_name ILIKE '%%%s%%' OR last_name ILIKE '%%%s%%')", name, name)
			queryCount += fmt.Sprintf(" WHERE (first_name ILIKE '%%%s%%' OR last_name ILIKE '%%%s%%')", name, name)
			wasWhere = true
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
		query += fmt.Sprintf(" ORDER BY o.id OFFSET %d LIMIT %d", (page - 1) * perPage, perPage)
		log.Println(query)
		_ = r.store.db.Select(&organizers, query)
		var count int
		_ = r.store.db.Get(&count, queryCount)
		return organizers, int(math.Ceil(float64(count) / float64(perPage)))
	}
}

func (r *OrganizerRepository) GetClub(id int) (*models.Club, error) {
	var club models.Club
	err := r.store.db.Get(&club, "SELECT * FROM club WHERE id = (SELECT club_id FROM organizers WHERE id = $1)", id)
	if err != nil {
		return nil, err
	}

	return &club, nil
}

func (r *OrganizerRepository) GetTournaments(id int) ([]*models.Tournament, error) {
	tournaments := make([]*models.Tournament, 0)
	err := r.store.db.Select(&tournaments, "SELECT * FROM tournaments WHERE organizer_id = $1", id)
	if err != nil {
		return nil, err
	}

	return tournaments, nil
}

func (r *OrganizerRepository) Delete(id int) error {
	_, err := r.store.db.Exec("DELETE FROM organizers WHERE id = $1", id)
	return err
}
