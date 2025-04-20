// backend/handlers/protocol_history_handler.go
package handlers

import (
	"ProtocolManager/backend/models"
	"ProtocolManager/backend/repository"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ProtocolHistoryHandler struct {
	Repo *repository.ProtocolHistoryRepository
}

func NewProtocolHistoryHandler(repo *repository.ProtocolHistoryRepository) *ProtocolHistoryHandler {
	return &ProtocolHistoryHandler{Repo: repo}
}

func (h *ProtocolHistoryHandler) GetAllHistory(c *gin.Context) {
	history, err := h.Repo.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, history)
}

func (h *ProtocolHistoryHandler) GetHistoryByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	history, err := h.Repo.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "History not found"})
		return
	}
	c.JSON(http.StatusOK, history)
}

func (h *ProtocolHistoryHandler) GetHistoryByProtocolID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	history, err := h.Repo.GetByProtocolID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, history)
}

func (h *ProtocolHistoryHandler) CreateHistory(c *gin.Context) {
	var history models.ProtocolHistory
	if err := c.ShouldBindJSON(&history); err != nil {
		c.JSON(
			http.StatusBadRequest, gin.H{"error": "Bind error: " + err.Error()},
		)
		return
	}

	log.Printf("Recebido: %+v\n", history)

	// Validar dados obrigatórios
	if history.ProtocolID == 0 || history.NewStatusID == 0 || history.CreatedBy == 0 {
		c.JSON(
			http.StatusBadRequest,
			gin.H{"error": "Campos obrigatórios ausentes"},
		)
		return
	}

	created, err := h.Repo.Create(history)
	if err != nil {
		c.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "Failed to create history: " + err.Error()},
		)
		return
	}
	c.JSON(http.StatusCreated, created)
}
