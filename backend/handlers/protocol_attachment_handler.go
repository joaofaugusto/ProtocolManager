// backend/handlers/protocol_attachment_handler.go
package handlers

import (
	"ProtocolManager/backend/models"
	"ProtocolManager/backend/repository"
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type ProtocolAttachmentHandler struct {
	Repo *repository.ProtocolAttachmentRepository
}

func NewProtocolAttachmentHandler(repo *repository.ProtocolAttachmentRepository) *ProtocolAttachmentHandler {
	return &ProtocolAttachmentHandler{Repo: repo}
}

func (h *ProtocolAttachmentHandler) GetAttachmentsByProtocolID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	attachments, err := h.Repo.GetByProtocolID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, attachments)
}

func (h *ProtocolAttachmentHandler) UploadAttachment(c *gin.Context) {
	protocolID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid protocol ID"})
		return
	}

	// Get file
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}
	defer file.Close()

	// Parse uploaded by
	uploadedByStr := c.PostForm("uploaded_by")
	uploadedBy, err := strconv.Atoi(uploadedByStr)
	if err != nil {
		c.JSON(
			http.StatusBadRequest,
			gin.H{"error": "Invalid uploaded_by parameter"},
		)
		return
	}

	// Create directory if it doesn't exist
	uploadDir := "./uploads"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		c.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "Failed to create upload directory"},
		)
		return
	}

	// Generate unique filename
	filename := fmt.Sprintf("%d-%s", time.Now().Unix(), header.Filename)
	filepath := fmt.Sprintf("%s/%s", uploadDir, filename)

	// Save file
	out, err := os.Create(filepath)
	if err != nil {
		c.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "Failed to save file"},
		)
		return
	}
	defer out.Close()

	_, err = io.Copy(out, file)
	if err != nil {
		c.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "Failed to copy file"},
		)
		return
	}

	// Create attachment record
	attachment := models.ProtocolAttachment{
		ProtocolID:  protocolID,
		FileName:    header.Filename,
		FilePath:    filepath,
		FileSize:    header.Size,                       // header.Size is already int64, no need to cast
		ContentType: header.Header.Get("Content-Type"), // Use ContentType instead of FileType
		UploadedBy:  uploadedBy,
	}

	created, err := h.Repo.Create(attachment)
	if err != nil {
		c.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "Failed to save attachment record"},
		)
		return
	}

	c.JSON(http.StatusCreated, created)
}

func (h *ProtocolAttachmentHandler) DeleteAttachment(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid attachment ID"})
		return
	}

	// Get attachment to find file path
	attachment, err := h.Repo.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Attachment not found"})
		return
	}

	// Delete file if it exists
	if _, err := os.Stat(attachment.FilePath); err == nil {
		if err := os.Remove(attachment.FilePath); err != nil {
			c.JSON(
				http.StatusInternalServerError,
				gin.H{"error": "Failed to delete file"},
			)
			return
		}
	}

	// Delete record
	if err := h.Repo.Delete(id); err != nil {
		c.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "Failed to delete attachment record"},
		)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Attachment deleted successfully"})
}
