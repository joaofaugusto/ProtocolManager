// backend/handlers/protocol_handler.go
package handlers

import (
	"ProtocolManager/backend/models"
	"ProtocolManager/backend/repository"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ProtocolHandler struct {
	Repo *repository.ProtocolRepository
}

func NewProtocolHandler(repo *repository.ProtocolRepository) *ProtocolHandler {
	return &ProtocolHandler{Repo: repo}
}

func (h *ProtocolHandler) GetAllProtocols(c *gin.Context) {
	protocols, err := h.Repo.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, protocols)
}

func (h *ProtocolHandler) GetProtocolByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	protocol, err := h.Repo.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Protocol not found"})
		return
	}
	c.JSON(http.StatusOK, protocol)
}

func (h *ProtocolHandler) CreateProtocol(c *gin.Context) {
	var protocol models.Protocol
	if err := c.ShouldBindJSON(&protocol); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if protocol.CreatedBy == 0 && protocol.AssignedTo > 0 {
		protocol.CreatedBy = protocol.AssignedTo
	} else {
		// Try to find at least one valid personnel ID in the database
		var personnel models.SalesPersonnel
		if err := h.Repo.DB.First(&personnel).Error; err != nil {
			c.JSON(
				http.StatusInternalServerError,
				gin.H{"error": "No valid personnel found in the database"},
			)
			return
		}
		protocol.CreatedBy = personnel.PersonnelID
	}

	created, err := h.Repo.Create(protocol)
	if err != nil {
		c.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "Failed to create protocol: " + err.Error()},
		)
		return
	}
	c.JSON(http.StatusCreated, created)
}

// Fix the Update function in the protocol_handler.go file
func (h *ProtocolHandler) UpdateProtocol(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var protocol models.Protocol
	if err := c.ShouldBindJSON(&protocol); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	protocol.ProtocolID = id

	// Pass both ID and protocol to the Update method
	err = h.Repo.Update(id, protocol)
	if err != nil {
		c.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "Failed to update protocol: " + err.Error()},
		)
		return
	}

	// Fetch the updated protocol to return
	updated, err := h.Repo.GetByID(id)
	if err != nil {
		c.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "Protocol updated but failed to retrieve"},
		)
		return
	}

	c.JSON(http.StatusOK, updated)
}

func (h *ProtocolHandler) DeleteProtocol(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	if err := h.Repo.Delete(id); err != nil {
		c.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "Failed to delete protocol: " + err.Error()},
		)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Protocol deleted successfully"})
}
