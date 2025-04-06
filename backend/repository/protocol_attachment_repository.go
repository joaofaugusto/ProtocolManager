// backend/repository/protocol_attachment_repository.go
package repository

import (
	"ProtocolManager/backend/models"
	"gorm.io/gorm"
)

type ProtocolAttachmentRepository struct {
	DB *gorm.DB
}

func NewProtocolAttachmentRepository(db *gorm.DB) *ProtocolAttachmentRepository {
	return &ProtocolAttachmentRepository{DB: db}
}

func (r *ProtocolAttachmentRepository) GetAll() (
	[]models.ProtocolAttachment, error,
) {
	var attachments []models.ProtocolAttachment
	result := r.DB.Preload("UploadedByAgent").Find(&attachments)
	return attachments, result.Error
}

func (r *ProtocolAttachmentRepository) GetByID(id int) (
	models.ProtocolAttachment, error,
) {
	var attachment models.ProtocolAttachment
	result := r.DB.Preload("UploadedByAgent").First(&attachment, id)
	return attachment, result.Error
}

func (r *ProtocolAttachmentRepository) GetByProtocolID(protocolID int) (
	[]models.ProtocolAttachment, error,
) {
	var attachments []models.ProtocolAttachment
	result := r.DB.Where("protocol_id = ?", protocolID).
		Preload("UploadedByAgent").
		Order("uploaded_at DESC").
		Find(&attachments)
	return attachments, result.Error
}

func (r *ProtocolAttachmentRepository) Create(attachment models.ProtocolAttachment) (
	models.ProtocolAttachment, error,
) {
	result := r.DB.Create(&attachment)
	return attachment, result.Error
}

func (r *ProtocolAttachmentRepository) Delete(id int) error {
	result := r.DB.Delete(&models.ProtocolAttachment{}, id)
	return result.Error
}
