package main

import (
	"github.com/arideno/course_project/apiserver"
	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"log"
	"os"
)

func main() {
	if err := migration(); err != nil {
		log.Fatal(err)
	}

	server := apiserver.NewServer()

	if err := server.Start(); err != nil {
		log.Fatal(err)
	}
}

func migration() error {
	m, err := migrate.New("file://./migrations", os.Getenv("DB_URL"))
	if err != nil {
		return err
	}

	if err := m.Up(); err != nil {
		if err != migrate.ErrNoChange {
			return err
		}
	}

	return nil
}