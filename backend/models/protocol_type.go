// backend/models/protocol_type.go
package models

import "time"

type ProtocolType struct {
	TypeID              int       `json:"type_id" gorm:"primaryKey;column:type_id"`
	TypeName            string    `json:"type_name" gorm:"column:type_name;not null;unique"`
	Description         string    `json:"description" gorm:"column:description"`
	DefaultDeadlineDays int       `json:"default_deadline_days" gorm:"column:default_deadline_days"`
	CreatedAt           time.Time `json:"created_at" gorm:"column:created_at;autoCreateTime"`
	UpdatedAt           time.Time `json:"updated_at" gorm:"column:updated_at;autoUpdateTime"`
}

func (ProtocolType) TableName() string {
	return "protocol_types"
}
