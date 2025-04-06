// backend/handlers/personnel_handler.go
package handlers

import (
	"ProtocolManager/backend/models"
	"ProtocolManager/backend/repository"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type PersonnelHandler struct {
	Repo *repository.PersonnelRepository
}

func NewPersonnelHandler(repo *repository.PersonnelRepository) *PersonnelHandler {
	return &PersonnelHandler{Repo: repo}
}

func (h *PersonnelHandler) GetAllPersonnel(c *gin.Context) {
	personnel, err := h.Repo.GetAll()
	if err != nil {
		c.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "Failed to retrieve personnel"},
		)
		return
	}
	c.JSON(http.StatusOK, personnel)
}

func (h *PersonnelHandler) GetPersonnelByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid personnel ID"})
		return
	}

	personnel, err := h.Repo.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Personnel not found"})
		return
	}
	c.JSON(http.StatusOK, personnel)
}

func (h *PersonnelHandler) CreatePersonnel(c *gin.Context) {
	var personnel models.SalesPersonnel
	if err := c.ShouldBindJSON(&personnel); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	created, err := h.Repo.Create(personnel)
	if err != nil {
		c.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "Failed to create personnel"},
		)
		return
	}
	c.JSON(http.StatusCreated, created)
}

func (h *PersonnelHandler) UpdatePersonnel(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid personnel ID"})
		return
	}

	var personnel models.SalesPersonnel
	if err := c.ShouldBindJSON(&personnel); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = h.Repo.Update(id, personnel)
	if err != nil {
		c.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "Failed to update personnel"},
		)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Personnel updated successfully"})
}

func (h *PersonnelHandler) DeletePersonnel(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid personnel ID"})
		return
	}

	err = h.Repo.Delete(id)
	if err != nil {
		c.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "Failed to delete personnel"},
		)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Personnel deleted successfully"})
}
