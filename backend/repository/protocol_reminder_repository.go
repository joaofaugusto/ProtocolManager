// backend/repository/protocol_reminder_repository.go
package repository

import (
	"ProtocolManager/backend/models"
	"gorm.io/gorm"
	"time"
)

type ProtocolReminderRepository struct {
	DB *gorm.DB
}

func NewProtocolReminderRepository(db *gorm.DB) *ProtocolReminderRepository {
	return &ProtocolReminderRepository{DB: db}
}

func (r *ProtocolReminderRepository) GetAll() (
	[]models.ProtocolReminder, error,
) {
	var reminders []models.ProtocolReminder
	result := r.DB.Preload("CreatedByAgent").Find(&reminders)
	return reminders, result.Error
}

func (r *ProtocolReminderRepository) GetByID(id int) (
	models.ProtocolReminder, error,
) {
	var reminder models.ProtocolReminder
	result := r.DB.Preload("CreatedByAgent").First(&reminder, id)
	return reminder, result.Error
}

func (r *ProtocolReminderRepository) GetByProtocolID(protocolID int) (
	[]models.ProtocolReminder, error,
) {
	var reminders []models.ProtocolReminder
	result := r.DB.Where("protocol_id = ?", protocolID).
		Preload("CreatedByAgent").
		Order("reminder_date").
		Find(&reminders)
	return reminders, result.Error
}

func (r *ProtocolReminderRepository) GetUpcomingReminders(withinHours int) (
	[]models.ProtocolReminder, error,
) {
	var reminders []models.ProtocolReminder
	now := time.Now()
	cutoff := now.Add(time.Duration(withinHours) * time.Hour)

	result := r.DB.Where(
		"is_sent = ? AND reminder_date BETWEEN ? AND ?", false, now, cutoff,
	).
		Preload("CreatedByAgent").
		Find(&reminders)
	return reminders, result.Error
}

func (r *ProtocolReminderRepository) Create(reminder models.ProtocolReminder) (
	models.ProtocolReminder, error,
) {
	result := r.DB.Create(&reminder)
	return reminder, result.Error
}

func (r *ProtocolReminderRepository) Update(
	id int, reminder models.ProtocolReminder,
) error {
	result := r.DB.Model(&models.ProtocolReminder{}).Where(
		"reminder_id = ?", id,
	).Updates(
		map[string]interface{}{
			"reminder_date":    reminder.ReminderDate,
			"reminder_message": reminder.ReminderText,
			"is_sent":          reminder.IsCompleted,
		},
	)
	return result.Error
}

func (r *ProtocolReminderRepository) MarkAsSent(id int) error {
	result := r.DB.Model(&models.ProtocolReminder{}).Where(
		"reminder_id = ?", id,
	).Update("is_sent", true)
	return result.Error
}

func (r *ProtocolReminderRepository) Delete(id int) error {
	result := r.DB.Delete(&models.ProtocolReminder{}, id)
	return result.Error
}
