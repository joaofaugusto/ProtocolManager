// backend/handlers/protocol_reminder_handler.go
package handlers

import (
	"ProtocolManager/backend/models"
	"ProtocolManager/backend/repository"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ProtocolReminderHandler struct {
	Repo *repository.ProtocolReminderRepository
}

func NewProtocolReminderHandler(repo *repository.ProtocolReminderRepository) *ProtocolReminderHandler {
	return &ProtocolReminderHandler{Repo: repo}
}

func (h *ProtocolReminderHandler) GetRemindersByProtocolID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid protocol ID"})
		return
	}

	reminders, err := h.Repo.GetByProtocolID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, reminders)
}

func (h *ProtocolReminderHandler) GetUpcomingReminders(c *gin.Context) {
	hoursStr := c.DefaultQuery("hours", "24")
	hours, err := strconv.Atoi(hoursStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid hours parameter"})
		return
	}

	reminders, err := h.Repo.GetUpcomingReminders(hours)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, reminders)
}

func (h *ProtocolReminderHandler) CreateReminder(c *gin.Context) {
	protocolID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid protocol ID"})
		return
	}

	var reminder models.ProtocolReminder
	if err := c.ShouldBindJSON(&reminder); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	reminder.ProtocolID = protocolID

	created, err := h.Repo.Create(reminder)
	if err != nil {
		c.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "Failed to create reminder"},
		)
		return
	}
	c.JSON(http.StatusCreated, created)
}

func (h *ProtocolReminderHandler) UpdateReminder(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid reminder ID"})
		return
	}

	var reminder models.ProtocolReminder
	if err := c.ShouldBindJSON(&reminder); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.Repo.Update(id, reminder); err != nil {
		c.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "Failed to update reminder"},
		)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Reminder updated successfully"})
}

func (h *ProtocolReminderHandler) MarkReminderAsSent(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid reminder ID"})
		return
	}

	if err := h.Repo.MarkAsSent(id); err != nil {
		c.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "Failed to mark reminder as sent"},
		)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Reminder marked as sent"})
}

func (h *ProtocolReminderHandler) DeleteReminder(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid reminder ID"})
		return
	}

	if err := h.Repo.Delete(id); err != nil {
		c.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "Failed to delete reminder"},
		)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Reminder deleted successfully"})
}
