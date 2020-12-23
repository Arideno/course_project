package apiserver

import (
	"github.com/arideno/course_project/models"
	"github.com/arideno/course_project/store"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"
)

type APIServer struct {
	router *gin.Engine
	store *store.Store
}

func NewServer() *APIServer {
	return &APIServer{}
}

func (s *APIServer) Start() error {
	s.router = gin.Default()

	s.router.Use(cors.New(cors.Config{
		AllowAllOrigins: true,
		AllowMethods: []string{"POST", "GET", "PUT", "DELETE"},
		AllowHeaders: []string{"Content-Type"},
	}))

	if err := s.configureStore(); err != nil {
		return err
	}
	defer s.store.Close()

	s.configureRouter()

	return s.router.Run(":8080")
}

func (s *APIServer) configureStore() error {
	s.store = store.NewStore()
	if err := s.store.Open(); err != nil {
		return err
	}

	return nil
}

func (s *APIServer) configureRouter() {
	s.router.POST("/sponsor", s.handleSponsorCreate())
	s.router.PUT("/sponsor", s.handleSponsorUpdate())
	s.router.GET("/sponsor/:id", s.handleSponsorGetById())
	s.router.GET("/sponsor", s.handleSponsorGetAll())
	s.router.GET("/sponsor/:id/tournaments", s.handleSponsorGetTournaments())
	s.router.DELETE("/sponsor/:id", s.handleSponsorDelete())

	s.router.POST("/club", s.handleClubCreate())
	s.router.PUT("/club", s.handleClubUpdate())
	s.router.GET("/club/:id", s.handleClubGetById())
	s.router.GET("/club", s.handleClubGetAll())
	s.router.GET("/club/:id/organizer", s.handleClubGetOrganizer())
	s.router.GET("/club/:id/players", s.handleClubGetPlayers())
	s.router.DELETE("/club/:id", s.handleClubDelete())
	s.router.GET("/unowned_clubs", s.handleUnownedClubs())

	s.router.POST("/organizer", s.handleOrganizerCreate())
	s.router.PUT("/organizer", s.handleOrganizerUpdate())
	s.router.GET("/organizer/:id", s.handleOrganizerGetById())
	s.router.GET("/organizer", s.handleOrganizerGetAll())
	s.router.GET("/organizer/:id/club", s.handleOrganizerGetClub())
	s.router.GET("/organizer/:id/tournaments", s.handleOrganizerGetTournaments())
	s.router.DELETE("/organizer/:id", s.handleOrganizerDelete())

	s.router.POST("/tournament", s.handleTournamentCreate())
	s.router.PUT("/tournament", s.handleTournamentUpdate())
	s.router.GET("/tournament/:id", s.handleTournamentGetById())
	s.router.GET("/tournament", s.handleTournamentGetAll())
	s.router.GET("/tournament/:id/organizer", s.handleTournamentGetOrganizer())
	s.router.GET("/tournament/:id/sponsors", s.handleTournamentGetSponsors())
	s.router.GET("/tournament/:id/players", s.handleTournamentGetPlayers())
	s.router.GET("/tournament/:id/matches", s.handleTournamentGetMatches())
	s.router.DELETE("/tournament/:id", s.handleTournamentDelete())

	s.router.POST("/player", s.handlePlayerCreate())
	s.router.PUT("/player", s.handlePlayerUpdate())
	s.router.GET("/player/:id", s.handlePlayerGetById())
	s.router.GET("/player", s.handlePlayerGetAll())
	s.router.GET("/player/:id/club", s.handlePlayerGetClub())
	s.router.GET("/player/:id/tournaments", s.handlePlayerGetTournaments())
	s.router.GET("/player/:id/matches", s.handlePlayerGetMatches())
	s.router.DELETE("/player/:id", s.handlePlayerDelete())

	s.router.POST("/match", s.handleMatchCreate())
	s.router.PUT("/match", s.handleMatchUpdate())
	s.router.GET("/match/:id", s.handleMatchGetById())
	s.router.GET("/match", s.handleMatchGetAll())
	s.router.GET("/match/:id/players", s.handleMatchGetPlayers())
	s.router.DELETE("/match/:id", s.handleMatchDelete())
}

func (s *APIServer) handleSponsorCreate() gin.HandlerFunc {
	return func(c *gin.Context) {
		var sponsor models.Sponsor
		if err := c.ShouldBindJSON(&sponsor); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		if err := s.store.Sponsor().Create(&sponsor); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"message": "ok",
		})
	}
}

func (s *APIServer) handleSponsorUpdate() gin.HandlerFunc {
	return func(c *gin.Context) {
		var sponsor models.Sponsor
		if err := c.ShouldBindJSON(&sponsor); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		if err := s.store.Sponsor().Update(&sponsor); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "ok",
		})
	}
}

func (s *APIServer) handleSponsorGetById() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		sponsor, err := s.store.Sponsor().SelectById(id)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"data": sponsor,
		})
	}
}

func (s *APIServer) handleSponsorGetAll() gin.HandlerFunc {
	return func(c *gin.Context) {
		page, err := strconv.Atoi(c.DefaultQuery("page", "0"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		perPage, err := strconv.Atoi(c.DefaultQuery("perPage", "0"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		name := c.DefaultQuery("name", "")
		phone := c.DefaultQuery("phone", "")

		sponsors, count := s.store.Sponsor().SelectAll(page, perPage, name, phone)

		c.JSON(http.StatusOK, gin.H{
			"sponsors": sponsors,
			"count": count,
		})
	}
}

func (s *APIServer) handleSponsorGetTournaments() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		tournaments := s.store.Sponsor().SelectTournaments(id)

		c.JSON(http.StatusOK, gin.H{
			"data": tournaments,
		})
	}
}

func (s *APIServer) handleSponsorDelete() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		err = s.store.Sponsor().Delete(id)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "ok",
		})
	}
}

func (s *APIServer) handleClubCreate() gin.HandlerFunc {
	return func(c *gin.Context) {
		var club models.Club
		if err := c.ShouldBindJSON(&club); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		if err := s.store.Club().Create(&club); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"message": "ok",
		})
	}
}

func (s *APIServer) handleClubUpdate() gin.HandlerFunc {
	return func(c *gin.Context) {
		var club models.Club
		if err := c.ShouldBindJSON(&club); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		if err := s.store.Club().Update(&club); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "ok",
		})
	}
}

func (s *APIServer) handleClubGetById() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		club, err := s.store.Club().SelectById(id)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"data": club,
		})
	}
}

func (s *APIServer) handleClubGetAll() gin.HandlerFunc {
	return func(c *gin.Context) {
		page, err := strconv.Atoi(c.DefaultQuery("page", "0"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		perPage, err := strconv.Atoi(c.DefaultQuery("perPage", "0"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		name := c.DefaultQuery("name", "")
		address := c.DefaultQuery("address", "")

		clubs, count := s.store.Club().SelectAll(page, perPage, name, address)

		c.JSON(http.StatusOK, gin.H{
			"clubs": clubs,
			"count": count,
		})
	}
}

func (s *APIServer) handleUnownedClubs() gin.HandlerFunc {
	return func(c *gin.Context) {
		clubs := s.store.Club().SelectUnowned()

		c.JSON(http.StatusOK, gin.H{
			"clubs": clubs,
		})
	}
}

func (s *APIServer) handleClubGetOrganizer() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		organizer, err := s.store.Club().GetOrganizer(id)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"data": organizer,
		})
	}
}

func (s *APIServer) handleClubGetPlayers() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		players := s.store.Club().GetPlayers(id)

		c.JSON(http.StatusOK, gin.H{
			"data": players,
		})
	}
}

func (s *APIServer) handleClubDelete() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		err = s.store.Club().Delete(id)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "ok",
		})
	}
}

func (s *APIServer) handleOrganizerCreate() gin.HandlerFunc {
	return func(c *gin.Context) {
		var organizer models.Organizer
		if err := c.ShouldBindJSON(&organizer); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		if err := s.store.Organizer().Create(&organizer); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"message": "ok",
		})
	}
}

func (s *APIServer) handleOrganizerUpdate() gin.HandlerFunc {
	return func(c *gin.Context) {
		var organizer models.Organizer
		if err := c.ShouldBindJSON(&organizer); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		if err := s.store.Organizer().Update(&organizer); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "ok",
		})
	}
}

func (s *APIServer) handleOrganizerGetById() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		organizer, err := s.store.Organizer().SelectById(id)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"data": organizer,
		})
	}
}

func (s *APIServer) handleOrganizerGetAll() gin.HandlerFunc {
	return func(c *gin.Context) {
		page, err := strconv.Atoi(c.DefaultQuery("page", "0"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		perPage, err := strconv.Atoi(c.DefaultQuery("perPage", "0"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		clubId, err := strconv.Atoi(c.DefaultQuery("clubId", "0"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		name := c.DefaultQuery("name", "")

		organizers, count := s.store.Organizer().SelectAll(page, perPage, name, clubId)

		c.JSON(http.StatusOK, gin.H{
			"organizers": organizers,
			"count": count,
		})
	}
}

func (s *APIServer) handleOrganizerGetClub() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		club, err := s.store.Organizer().GetClub(id)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"data": club,
		})
	}
}

func (s *APIServer) handleOrganizerGetTournaments() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		tournaments, err := s.store.Organizer().GetTournaments(id)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"data": tournaments,
		})
	}
}

func (s *APIServer) handleOrganizerDelete() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		err = s.store.Organizer().Delete(id)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "ok",
		})
	}
}

func (s *APIServer) handleTournamentCreate() gin.HandlerFunc {
	return func(c *gin.Context) {
		var tournament models.Tournament
		if err := c.ShouldBindJSON(&tournament); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		if err := s.store.Tournament().Create(&tournament); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"message": "ok",
		})
	}
}

func (s *APIServer) handleTournamentUpdate() gin.HandlerFunc {
	return func(c *gin.Context) {
		var tournament models.Tournament
		if err := c.ShouldBindJSON(&tournament); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		if err := s.store.Tournament().Update(&tournament); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "ok",
		})
	}
}

func (s *APIServer) handleTournamentGetById() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		tournament, err := s.store.Tournament().SelectById(id)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"data": tournament,
		})
	}
}

func (s *APIServer) handleTournamentGetAll() gin.HandlerFunc {
	return func(c *gin.Context) {
		page, err := strconv.Atoi(c.DefaultQuery("page", "0"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		perPage, err := strconv.Atoi(c.DefaultQuery("perPage", "0"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		name := c.DefaultQuery("name", "")
		startDate := c.DefaultQuery("start_date", "")
		endDate := c.DefaultQuery("end_date", "")
		tournaments, count := s.store.Tournament().SelectAll(page, perPage, name, startDate, endDate)

		c.JSON(http.StatusOK, gin.H{
			"tournaments": tournaments,
			"count": count,
		})
	}
}

func (s *APIServer) handleTournamentGetOrganizer() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		organizer, err := s.store.Tournament().GetOrganizer(id)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"data": organizer,
		})
	}
}

func (s *APIServer) handleTournamentGetSponsors() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		sponsors := s.store.Tournament().SelectSponsors(id)

		c.JSON(http.StatusOK, gin.H{
			"data": sponsors,
		})
	}
}

func (s *APIServer) handleTournamentGetPlayers() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		players := s.store.Tournament().SelectPlayers(id)

		c.JSON(http.StatusOK, gin.H{
			"data": players,
		})
	}
}

func (s *APIServer) handleTournamentGetMatches() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		matches := s.store.Tournament().SelectMatches(id)

		c.JSON(http.StatusOK, gin.H{
			"data": matches,
		})
	}
}

func (s *APIServer) handleTournamentDelete() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		err = s.store.Tournament().Delete(id)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "ok",
		})
	}
}

func (s *APIServer) handlePlayerCreate() gin.HandlerFunc {
	return func(c *gin.Context) {
		var player models.Player
		if err := c.ShouldBindJSON(&player); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		if err := s.store.Player().Create(&player); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"message": "ok",
		})
	}
}

func (s *APIServer) handlePlayerUpdate() gin.HandlerFunc {
	return func(c *gin.Context) {
		var player models.Player
		if err := c.ShouldBindJSON(&player); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		if err := s.store.Player().Update(&player); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "ok",
		})
	}
}

func (s *APIServer) handlePlayerGetById() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.ParseInt(c.Param("id"), 10, 64)

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		player, err := s.store.Player().SelectById(id)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"data": player,
		})
	}
}

func (s *APIServer) handlePlayerGetAll() gin.HandlerFunc {
	return func(c *gin.Context) {
		page, err := strconv.Atoi(c.DefaultQuery("page", "0"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		perPage, err := strconv.Atoi(c.DefaultQuery("perPage", "0"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		name := c.DefaultQuery("name", "")
		address := c.DefaultQuery("address", "")
		phone := c.DefaultQuery("phone", "")
		email := c.DefaultQuery("email", "")

		firstRate, err := strconv.Atoi(c.DefaultQuery("first_rate", "0"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		secondRate, err := strconv.Atoi(c.DefaultQuery("second_rate", "0"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		clubId, err := strconv.Atoi(c.DefaultQuery("clubId", "0"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		players, count := s.store.Player().SelectAll(page, perPage, name, address, email, phone, firstRate, secondRate, clubId)

		c.JSON(http.StatusOK, gin.H{
			"players": players,
			"count": count,
		})
	}
}

func (s *APIServer) handlePlayerGetClub() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.ParseInt(c.Param("id"), 10, 64)

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		club, err := s.store.Player().SelectClub(id)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"data": club,
		})
	}
}

func (s *APIServer) handlePlayerGetTournaments() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.ParseInt(c.Param("id"), 10, 64)

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		tournaments, results, matchesPlayed, productiveMatches := s.store.Player().SelectTournaments(id)

		c.JSON(http.StatusOK, gin.H{
			"data": gin.H{
				"tournaments": tournaments,
				"results": results,
				"matchesPlayed": matchesPlayed,
				"productiveMatches": productiveMatches,
			},
		})
	}
}

func (s *APIServer) handlePlayerGetMatches() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.ParseInt(c.Param("id"), 10, 64)

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		matches := s.store.Player().SelectMatches(id)

		c.JSON(http.StatusOK, gin.H{
			"data": matches,
		})
	}
}

func (s *APIServer) handlePlayerDelete() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		err = s.store.Player().Delete(id)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "ok",
		})
	}
}

func (s *APIServer) handleMatchCreate() gin.HandlerFunc {
	return func(c *gin.Context) {
		var match models.Match
		if err := c.ShouldBindJSON(&match); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		if err := s.store.Match().Create(&match); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"message": "ok",
		})
	}
}

func (s *APIServer) handleMatchUpdate() gin.HandlerFunc {
	return func(c *gin.Context) {
		var match models.Match
		if err := c.ShouldBindJSON(&match); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		if err := s.store.Match().Update(&match); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "ok",
		})
	}
}

func (s *APIServer) handleMatchGetById() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		match, err := s.store.Match().SelectById(id)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"data": match,
		})
	}
}

func (s *APIServer) handleMatchGetAll() gin.HandlerFunc {
	return func(c *gin.Context) {
		page, err := strconv.Atoi(c.DefaultQuery("page", "0"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		perPage, err := strconv.Atoi(c.DefaultQuery("perPage", "0"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		name := c.DefaultQuery("name", "")
		tournamentName := c.DefaultQuery("tournamentName", "")

		matches, count := s.store.Match().SelectAll(page, perPage, name, tournamentName)

		c.JSON(http.StatusOK, gin.H{
			"matches": matches,
			"count": count,
		})
	}
}

func (s *APIServer) handleMatchGetPlayers() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		players := s.store.Match().GetPlayers(id)

		c.JSON(http.StatusOK, gin.H{
			"data": players,
		})
	}
}

func (s *APIServer) handleMatchDelete() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		err = s.store.Match().Delete(id)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "ok",
		})
	}
}