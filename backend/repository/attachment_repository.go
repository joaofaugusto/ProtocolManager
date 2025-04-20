// repository/attachment_repository.go
package repository

import (
	"ProtocolManager/backend/models"
	"database/sql"
	_ "database/sql"
	"log"
)

type FileRepository struct {
	db *sql.DB
}

func NewFileRepository(db *sql.DB) *FileRepository {
	return &FileRepository{db: db}
}

// GetAttachmentByID retrieves attachment details from database
func (r *FileRepository) GetAttachmentByID(id int) (*models.Attachment, error) {
	var attachment models.Attachment

	query := `
		SELECT 
			attachment_id,
			protocol_id,
			file_name,
			file_path,
			file_size,
			file_type,
			uploaded_by,
			uploaded_at,
			content_type,
			description
		FROM protocol_attachments 
		WHERE attachment_id = $1
	`

	err := r.db.QueryRow(query, id).Scan(
		&attachment.AttachmentID,
		&attachment.ProtocolID,
		&attachment.FileName,
		&attachment.FilePath,
		&attachment.FileSize,
		&attachment.FileType, // *string
		&attachment.UploadedBy,
		&attachment.UploadedAt,
		&attachment.ContentType, // *string
		&attachment.Description, // *string
	)

	if err != nil {
		log.Printf("Erro no Scan: %v", err)
		return nil, err
	}

	log.Println("Attachment encontrado:", attachment.FileName)
	return &attachment, nil
}
