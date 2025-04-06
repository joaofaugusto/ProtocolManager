// backend/repository/protocol_status_repository.go
package repository

import (
	"ProtocolManager/backend/models"
	"gorm.io/gorm"
)

type ProtocolStatusRepository struct {
	DB *gorm.DB
}

func NewProtocolStatusRepository(db *gorm.DB) *ProtocolStatusRepository {
	return &ProtocolStatusRepository{DB: db}
}

func (r *ProtocolStatusRepository) GetAll() ([]models.ProtocolStatus, error) {
	var statuses []models.ProtocolStatus
	err := r.DB.Order("order_sequence").Find(&statuses).Error
	return statuses, err
}

func (r *ProtocolStatusRepository) GetByID(id int) (
	models.ProtocolStatus, error,
) {
	var status models.ProtocolStatus
	err := r.DB.First(&status, id).Error
	return status, err
}

func (r *ProtocolStatusRepository) Create(status models.ProtocolStatus) (
	models.ProtocolStatus, error,
) {
	err := r.DB.Create(&status).Error
	return status, err
}

func (r *ProtocolStatusRepository) Update(
	id int, status models.ProtocolStatus,
) error {
	return r.DB.Model(&models.ProtocolStatus{}).Where(
		"status_id = ?", id,
	).Updates(status).Error
}

func (r *ProtocolStatusRepository) Delete(id int) error {
	return r.DB.Delete(&models.ProtocolStatus{}, id).Error
}
