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
// backend/handlers/protocol_handler.go
func (h *ProtocolHandler) UpdateProtocol(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var payload map[string]interface{}
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(
			http.StatusBadRequest,
			gin.H{"error": "JSON inválido: " + err.Error()},
		)
		return
	}

	err = h.Repo.UpdateFields(id, payload)
	if err != nil {
		c.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "Erro ao atualizar protocolo: " + err.Error()},
		)
		return
	}

	updated, err := h.Repo.GetByID(id)
	if err != nil {
		c.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "Atualizou, mas falhou ao recuperar"},
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
