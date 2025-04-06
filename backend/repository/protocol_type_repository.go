// backend/repository/protocol_type_repository.go
package repository

import (
	"ProtocolManager/backend/models"
	"gorm.io/gorm"
)

type ProtocolTypeRepository struct {
	DB *gorm.DB
}

func NewProtocolTypeRepository(db *gorm.DB) *ProtocolTypeRepository {
	return &ProtocolTypeRepository{DB: db}
}

func (r *ProtocolTypeRepository) GetAll() ([]models.ProtocolType, error) {
	var types []models.ProtocolType
	result := r.DB.Order("type_name").Find(&types)
	return types, result.Error
}

func (r *ProtocolTypeRepository) GetByID(id int) (models.ProtocolType, error) {
	var protocolType models.ProtocolType
	result := r.DB.First(&protocolType, id)
	return protocolType, result.Error
}

func (r *ProtocolTypeRepository) Create(protocolType models.ProtocolType) (
	models.ProtocolType, error,
) {
	result := r.DB.Create(&protocolType)
	return protocolType, result.Error
}

func (r *ProtocolTypeRepository) Update(
	id int, protocolType models.ProtocolType,
) error {
	protocolType.TypeID = id
	result := r.DB.Model(&models.ProtocolType{TypeID: id}).Updates(
		map[string]interface{}{
			"type_name":             protocolType.TypeName,
			"description":           protocolType.Description,
			"default_deadline_days": protocolType.DefaultDeadlineDays,
		},
	)
	return result.Error
}

func (r *ProtocolTypeRepository) Delete(id int) error {
	result := r.DB.Delete(&models.ProtocolType{}, id)
	return result.Error
}
