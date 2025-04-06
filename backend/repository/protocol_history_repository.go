// backend/repository/protocol_history_repository.go
package repository

import (
	"ProtocolManager/backend/models"
	"gorm.io/gorm"
)

type ProtocolHistoryRepository struct {
	DB *gorm.DB
}

func NewProtocolHistoryRepository(db *gorm.DB) *ProtocolHistoryRepository {
	return &ProtocolHistoryRepository{DB: db}
}

func (r *ProtocolHistoryRepository) GetAll() ([]models.ProtocolHistory, error) {
	var histories []models.ProtocolHistory
	result := r.DB.Preload("PreviousStatus").Preload("NewStatus").Preload("CreatedByAgent").Find(&histories)
	return histories, result.Error
}

func (r *ProtocolHistoryRepository) GetByID(id int) (
	models.ProtocolHistory, error,
) {
	var history models.ProtocolHistory
	result := r.DB.Preload("PreviousStatus").Preload("NewStatus").Preload("CreatedByAgent").First(
		&history, id,
	)
	return history, result.Error
}

func (r *ProtocolHistoryRepository) GetByProtocolID(protocolID int) (
	[]models.ProtocolHistory, error,
) {
	var histories []models.ProtocolHistory
	result := r.DB.Where("protocol_id = ?", protocolID).
		Preload("PreviousStatus").
		Preload("NewStatus").
		Preload("CreatedByAgent").
		Order("created_at DESC").
		Find(&histories)
	return histories, result.Error
}

func (r *ProtocolHistoryRepository) Create(history models.ProtocolHistory) (
	models.ProtocolHistory, error,
) {
	result := r.DB.Create(&history)
	return history, result.Error
}
