// backend/models/protocol_history.go
package models

import (
	"time"
)

type ProtocolHistory struct {
	ProtocolHistoryID int       `json:"protocol_history_id"`
	ProtocolID        int       `json:"protocol_id"`
	OldStatusID       *int      `json:"previous_status_id"`
	NewStatusID       int       `json:"new_status_id"`
	Notes             string    `json:"notes"`
	CreatedBy         int       `json:"created_by"`
	CreatedAt         time.Time `json:"created_at"`

	PreviousStatus *ProtocolStatus `gorm:"foreignKey:OldStatusID;references:StatusID" json:"previous_status,omitempty"`
	NewStatus      *ProtocolStatus `gorm:"foreignKey:NewStatusID;references:StatusID" json:"new_status,omitempty"`
	CreatedByAgent *SalesPersonnel `gorm:"foreignKey:CreatedBy;references:PersonnelID" json:"created_by_agent,omitempty"`
}

func (ProtocolHistory) TableName() string {
	return "protocol_history"
}
