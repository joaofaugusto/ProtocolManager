// backend/models/protocol_reminder.go
package models

import (
	"time"
)

type ProtocolReminder struct {
	ReminderID      int       `json:"reminder_id" gorm:"primaryKey;column:reminder_id"`
	ProtocolID      int       `json:"protocol_id" gorm:"column:protocol_id;not null"`
	ReminderText    string    `json:"reminder_text" gorm:"column:reminder_text;not null"`
	ReminderMessage string    `json:"reminder_message" gorm:"column:reminder_message"`
	ReminderDate    time.Time `json:"reminder_date" gorm:"column:reminder_date;not null"`
	IsCompleted     bool      `json:"is_completed" gorm:"column:is_completed;default:false"`
	IsSent          bool      `json:"is_sent" gorm:"column:is_sent;default:false"`
	CreatedBy       int       `json:"created_by" gorm:"column:created_by;not null"`
	CreatedAt       time.Time `json:"created_at" gorm:"column:created_at"`

	// Define relationship properly
	CreatedByAgent SalesPersonnel `json:"created_by_agent" gorm:"foreignKey:CreatedBy;references:PersonnelID"`
}

func (ProtocolReminder) TableName() string {
	return "protocol_reminders"
}
