// backend/models/protocol_status.go
package models

type ProtocolStatus struct {
	StatusID   int    `json:"status_id" gorm:"primaryKey;column:status_id"`
	StatusName string `json:"status_name"`
	Color      string `json:"color"`
	IsTerminal bool   `json:"is_terminal"`
}

func (ProtocolStatus) TableName() string {
	return "protocol_statuses"
}
