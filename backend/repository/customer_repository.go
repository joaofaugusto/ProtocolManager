// backend/repository/customer_repository.go
package repository

import (
	"ProtocolManager/backend/models"
	"gorm.io/gorm"
)

type CustomerRepository struct {
	DB *gorm.DB
}

func NewCustomerRepository(db *gorm.DB) *CustomerRepository {
	return &CustomerRepository{DB: db}
}

func (r *CustomerRepository) GetAll() ([]models.Customer, error) {
	var customers []models.Customer
	result := r.DB.Find(&customers)
	return customers, result.Error
}

func (r *CustomerRepository) GetByID(id int) (models.Customer, error) {
	var customer models.Customer
	result := r.DB.First(&customer, id)
	return customer, result.Error
}

func (r *CustomerRepository) Create(customer models.Customer) (
	models.Customer, error,
) {
	result := r.DB.Create(&customer)
	return customer, result.Error
}

func (r *CustomerRepository) Update(id int, customer models.Customer) error {
	result := r.DB.Model(&models.Customer{}).Where(
		"customer_id = ?", id,
	).Updates(
		map[string]interface{}{
			"first_name":  customer.FirstName,
			"last_name":   customer.LastName,
			"email":       customer.Email,
			"phone":       customer.Phone,
			"address":     customer.Address,
			"city":        customer.City,
			"state":       customer.State,
			"postal_code": customer.PostalCode,
			"branch_id":   customer.BranchID,
			"active":      customer.Active,
		},
	)
	return result.Error
}

func (r *CustomerRepository) Delete(id int) error {
	result := r.DB.Delete(&models.Customer{}, id)
	return result.Error
}
