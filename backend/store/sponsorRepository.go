package store

import (
	"fmt"
	"github.com/arideno/course_project/models"
	"log"
	"math"
)

type SponsorRepository struct {
	store *Store
}

func (r *SponsorRepository) Create(sponsor *models.Sponsor) error {
	_, err := r.store.db.Exec("INSERT INTO sponsors(first_name, last_name, phone, logo, website) VALUES ($1, $2, $3, $4, $5)", sponsor.FirstName, sponsor.LastName, sponsor.Phone, sponsor.Logo, sponsor.Website)
	return err
}

func (r *SponsorRepository) Update(sponsor *models.Sponsor) error {
	_, err := r.store.db.Exec("UPDATE sponsors SET first_name = $1, last_name = $2, phone = $3, logo = $4, website = $5 WHERE id = $6", sponsor.FirstName, sponsor.LastName, sponsor.Phone, sponsor.Logo, sponsor.Website, sponsor.Id)
	return err
}

func (r *SponsorRepository) SelectById(id int) (*models.Sponsor, error) {
	var sponsor models.Sponsor
	err := r.store.db.Get(&sponsor, "SELECT * FROM sponsors WHERE id = $1", id)
	if err != nil {
		return nil, err
	}

	return &sponsor, nil
}

func (r *SponsorRepository) SelectAll(page int, perPage int, name, phone string) ([]*models.Sponsor, int) {
	sponsors := make([]*models.Sponsor, 0)
	if perPage == 0 {
		query := "SELECT * FROM sponsors"
		wasWhere := false
		if name != "" {
			query += fmt.Sprintf(" WHERE (first_name ILIKE '%%%s%%' OR last_name ILIKE '%%%s%%')", name, name)
			wasWhere = true
		}
		if phone != "" {
			if wasWhere {
				query += fmt.Sprintf(" AND phone ILIKE '%%%s%%'", phone)
			} else {
				query += fmt.Sprintf(" WHERE phone ILIKE '%%%s%%'", phone)
			}
		}
		query += " ORDER BY id"
		log.Println(query)
		_ = r.store.db.Select(&sponsors, query)
		return sponsors, 0
	} else {
		query := "SELECT * FROM sponsors"
		queryCount := "SELECT count(id) FROM sponsors"
		wasWhere := false
		if name != "" {
			query += fmt.Sprintf(" WHERE (first_name ILIKE '%%%s%%' OR last_name ILIKE '%%%s%%')", name, name)
			queryCount += fmt.Sprintf(" WHERE (first_name ILIKE '%%%s%%' OR last_name ILIKE '%%%s%%')", name, name)
			wasWhere = true
		}
		if phone != "" {
			if wasWhere {
				query += fmt.Sprintf(" AND phone ILIKE '%%%s%%'", phone)
				queryCount += fmt.Sprintf(" AND phone ILIKE '%%%s%%'", phone)
			} else {
				query += fmt.Sprintf(" WHERE phone ILIKE '%%%s%%'", phone)
				queryCount += fmt.Sprintf(" WHERE phone ILIKE '%%%s%%'", phone)
			}
		}
		query += fmt.Sprintf(" ORDER BY id OFFSET %d LIMIT %d", (page - 1) * perPage, perPage)
		log.Println(query)
		_ = r.store.db.Select(&sponsors, query)
		var count int
		_ = r.store.db.Get(&count, queryCount)
		return sponsors, int(math.Ceil(float64(count) / float64(perPage)))
	}
}

func (r *SponsorRepository) SelectTournaments(id int) []*models.Tournament {
	tournaments := make([]*models.Tournament, 0)
	_ = r.store.db.Select(&tournaments, "SELECT * FROM tournaments WHERE id = (SELECT tournament_id FROM tournament_sponsors WHERE sponsor_id = $1)", id)
	return tournaments
}

func (r *SponsorRepository) Delete(id int) error {
	_, err := r.store.db.Exec("DELETE FROM sponsors WHERE id = $1", id)
	return err
}
