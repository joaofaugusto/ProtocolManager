// models/attachment.go
package models

import "time"

type Attachment struct {
	AttachmentID int
	ProtocolID   int
	FileName     string
	FilePath     string
	FileSize     int64
	FileType     *string
	UploadedBy   int
	UploadedAt   time.Time
	ContentType  *string
	Description  *string
}
