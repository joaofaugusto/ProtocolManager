// backend/models/protocol_history.go
package models

import (
	"time"
)

type ProtocolHistory struct {
	ProtocolHistoryID int  `gorm:"primaryKey"`
	ProtocolID        int  `gorm:"index"`
	OldStatusID       *int `gorm:"index"`
	NewStatusID       int  `gorm:"index"`
	Notes             string
	CreatedBy         int
	CreatedAt         time.Time
	PreviousStatus    *ProtocolStatus `gorm:"foreignKey:OldStatusID"`
	NewStatus         ProtocolStatus  `gorm:"foreignKey:NewStatusID"`
	CreatedByAgent    SalesPersonnel  `gorm:"foreignKey:CreatedBy"`
}

func (ProtocolHistory) TableName() string {
	return "protocol_history"
}
