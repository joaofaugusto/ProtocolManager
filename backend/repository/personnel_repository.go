package repository

import (
	"ProtocolManager/backend/models"
	"gorm.io/gorm"
)

type PersonnelRepository struct {
	DB *gorm.DB
}

func NewPersonnelRepository(db *gorm.DB) *PersonnelRepository {
	return &PersonnelRepository{DB: db}
}

func (r *PersonnelRepository) GetAll() ([]models.SalesPersonnel, error) {
	var personnel []models.SalesPersonnel
	result := r.DB.Find(&personnel)
	return personnel, result.Error
}

func (r *PersonnelRepository) GetByID(id int) (models.SalesPersonnel, error) {
	var personnel models.SalesPersonnel
	result := r.DB.First(&personnel, id)
	return personnel, result.Error
}

func (r *PersonnelRepository) Create(personnel models.SalesPersonnel) (
	models.SalesPersonnel, error,
) {
	result := r.DB.Create(&personnel)
	return personnel, result.Error
}

func (r *PersonnelRepository) Update(
	id int, personnel models.SalesPersonnel,
) error {
	result := r.DB.Model(&models.SalesPersonnel{}).Where(
		"personnel_id = ?", id,
	).Updates(
		map[string]interface{}{
			"first_name": personnel.FirstName,
			"last_name":  personnel.LastName,
			"email":      personnel.Email,
			"phone":      personnel.Phone,
			"branch_id":  personnel.BranchID,
			"active":     personnel.Active,
		},
	)
	return result.Error
}

func (r *PersonnelRepository) Delete(id int) error {
	result := r.DB.Delete(&models.SalesPersonnel{}, id)
	return result.Error
}
