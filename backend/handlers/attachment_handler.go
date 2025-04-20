// handlers/attachment_handler.go
package handlers

import (
	"ProtocolManager/backend/config"
	"ProtocolManager/backend/repository"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	Repo   *repository.FileRepository
	Config *config.Config
}

func NewAttachmentHandler(
	repo *repository.FileRepository, cfg *config.Config,
) *Handler {
	return &Handler{
		Repo:   repo,
		Config: cfg,
	}
}

// DownloadAttachment handles file downloads
func (h *Handler) DownloadAttachment(c *gin.Context) {
	// Extract attachment ID from URL parameter
	id := c.Param("id")
	log.Println("Received attachment ID:", id)

	attachmentID, err := strconv.Atoi(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid attachment ID"})
		return
	}

	// Get attachment from database
	attachment, err := h.Repo.GetAttachmentByID(attachmentID)
	if err != nil {
		log.Printf("Erro ao buscar anexo ID %d: %v", attachmentID, err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Attachment not found"})
		return
	}

	// Get file path (modify this according to your storage system)
	filePath := attachment.FilePath

	// Check if file exists
	log.Println("Verificando arquivo em:", filePath)
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		log.Println("Arquivo não encontrado no caminho:", filePath)
		c.JSON(http.StatusNotFound, gin.H{"error": "File not found on server"})
		return
	}

	// Set headers for file download
	// Set headers for file download
	c.Header("Content-Description", "File Transfer")
	c.Header(
		"Content-Disposition",
		fmt.Sprintf("attachment; filename=%s", attachment.FileName),
	)

	contentType := "application/octet-stream"
	if attachment.ContentType != nil {
		contentType = *attachment.ContentType
	}
	c.Header("Content-Type", contentType)

	c.Header("Content-Transfer-Encoding", "binary")
	c.Header("Cache-Control", "no-cache")

	// Serve the file
	c.File(filePath)
}
