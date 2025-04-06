// backend/handlers/protocol_status_handler.go
package handlers

import (
	"ProtocolManager/backend/models"
	"ProtocolManager/backend/repository"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ProtocolStatusHandler struct {
	Repo *repository.ProtocolStatusRepository
}

func NewProtocolStatusHandler(repo *repository.ProtocolStatusRepository) *ProtocolStatusHandler {
	return &ProtocolStatusHandler{Repo: repo}
}

func (h *ProtocolStatusHandler) GetAllStatuses(c *gin.Context) {
	statuses, err := h.Repo.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, statuses)
}

func (h *ProtocolStatusHandler) GetStatusByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	status, err := h.Repo.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Status not found"})
		return
	}
	c.JSON(http.StatusOK, status)
}

func (h *ProtocolStatusHandler) CreateStatus(c *gin.Context) {
	var status models.ProtocolStatus
	if err := c.ShouldBindJSON(&status); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	created, err := h.Repo.Create(status)
	if err != nil {
		c.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "Failed to create status: " + err.Error()},
		)
		return
	}
	c.JSON(http.StatusCreated, created)
}

func (h *ProtocolStatusHandler) UpdateStatus(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var status models.ProtocolStatus
	if err := c.ShouldBindJSON(&status); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = h.Repo.Update(id, status)
	if err != nil {
		c.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "Failed to update status: " + err.Error()},
		)
		return
	}

	// Fetch the updated status to return
	updated, err := h.Repo.GetByID(id)
	if err != nil {
		c.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "Status updated but failed to retrieve"},
		)
		return
	}

	c.JSON(http.StatusOK, updated)
}

func (h *ProtocolStatusHandler) DeleteStatus(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	if err := h.Repo.Delete(id); err != nil {
		c.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "Failed to delete status: " + err.Error()},
		)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Status deleted successfully"})
}
