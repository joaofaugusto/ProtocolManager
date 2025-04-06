// backend/models/protocol_attachment.go
package models

import (
	"time"
)

type ProtocolAttachment struct {
	AttachmentID int       `json:"attachment_id" gorm:"primaryKey;column:attachment_id"`
	ProtocolID   int       `json:"protocol_id" gorm:"column:protocol_id;not null"`
	FileName     string    `json:"file_name" gorm:"column:file_name;not null"`
	FilePath     string    `json:"file_path" gorm:"column:file_path;not null"`
	FileSize     int64     `json:"file_size" gorm:"column:file_size"`
	ContentType  string    `json:"content_type" gorm:"column:content_type"`
	Description  string    `json:"description" gorm:"column:description"`
	UploadedBy   int       `json:"uploaded_by" gorm:"column:uploaded_by;not null"`
	UploadedAt   time.Time `json:"uploaded_at" gorm:"column:uploaded_at"`

	UploadedByAgent SalesPersonnel `json:"uploaded_by_agent" gorm:"foreignKey:UploadedBy;references:PersonnelID"`
}

func (ProtocolAttachment) TableName() string {
	return "protocol_attachments"
}
