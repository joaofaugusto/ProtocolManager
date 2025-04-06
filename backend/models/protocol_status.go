// backend/models/protocol_status.go
package models

type ProtocolStatus struct {
	StatusID   int `gorm:"primaryKey"`
	StatusName string
	IsTerminal bool
}

func (ProtocolStatus) TableName() string {
	return "protocol_statuses"
}
