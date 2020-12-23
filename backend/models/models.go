package models

import (
	"database/sql"
	"time"
)

type Sponsor struct {
	Id        int            `json:"id" db:"id"`
	FirstName string         `json:"first_name" db:"first_name"`
	LastName  string         `json:"last_name" db:"last_name"`
	Phone     sql.NullString `json:"phone" db:"phone"`
	Logo      sql.NullString `json:"logo" db:"logo"`
	Website   sql.NullString `json:"website" db:"website"`
}

type Club struct {
	Id      int            `json:"id" db:"id"`
	Name    string         `json:"name" db:"name"`
	Address string         `json:"address" db:"address"`
	Logo    sql.NullString `json:"logo" db:"logo"`
	Website sql.NullString `json:"website" db:"website"`
}

type Organizer struct {
	Id        int    `json:"id"`
	FirstName string `json:"first_name" db:"first_name"`
	LastName  string `json:"last_name" db:"last_name"`
	Club      Club   `json:"club" db:"club"`
}

type Tournament struct {
	Id        int       `json:"id"`
	StartDate time.Time `json:"start_date" db:"start_date"`
	EndDate   time.Time `json:"end_date" db:"end_date"`
	Name      string    `json:"name"`
	Organizer Organizer `json:"organizer" db:"organizer"`
}

type Player struct {
	Id          int64          `json:"id"`
	FirstName   string         `json:"first_name" db:"first_name"`
	LastName    string         `json:"last_name" db:"last_name"`
	Address     sql.NullString `json:"address" db:"address"`
	PhoneNumber sql.NullString `json:"phone_number" db:"phone_number"`
	Email       sql.NullString `json:"email" db:"email"`
	Rank        int            `json:"rank" db:"rank"`
	Club        Club           `json:"club"`
}

type Match struct {
	Id           int        `json:"id"`
	StartDate    time.Time  `json:"start_date" db:"start_date"`
	Result       int        `json:"result" db:"result"`
	Tournament   Tournament `json:"tournament" db:"tournament"`
	FirstPlayer  Player     `json:"first_player" db:"first_player"`
	SecondPlayer Player     `json:"second_player" db:"second_player"`
}
