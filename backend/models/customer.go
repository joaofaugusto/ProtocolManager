// backend/models/customer.go
package models

import "time"

type Customer struct {
	CustomerID int       `json:"customer_id" gorm:"primaryKey;column:customer_id"`
	FirstName  string    `json:"first_name" gorm:"column:first_name;not null"`
	LastName   string    `json:"last_name" gorm:"column:last_name;not null"`
	Email      string    `json:"email" gorm:"column:email;uniqueIndex;not null"`
	Phone      string    `json:"phone" gorm:"column:phone"`
	Address    string    `json:"address" gorm:"column:address"`
	City       string    `json:"city" gorm:"column:city"`
	State      string    `json:"state" gorm:"column:state"`
	PostalCode string    `json:"postal_code" gorm:"column:postal_code"`
	BranchID   *int      `json:"branch_id" gorm:"column:branch_id"`
	Active     bool      `json:"active" gorm:"column:active;default:true"`
	CreatedAt  time.Time `json:"created_at" gorm:"column:created_at;autoCreateTime"`
	UpdatedAt  time.Time `json:"updated_at" gorm:"column:updated_at;autoUpdateTime"`
}

// TableName specifies the table name for GORM
func (Customer) TableName() string {
	return "customers"
}
