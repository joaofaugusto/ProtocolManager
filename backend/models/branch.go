// backend/models/branch.go
package models

import "time"

type Branch struct {
	BranchID   int       `json:"branch_id" gorm:"primaryKey;column:branch_id"`
	BranchName string    `json:"branch_name" gorm:"column:branch_name;not null"`
	BranchCode string    `json:"branch_code" gorm:"column:branch_code;uniqueIndex;not null"`
	CreatedAt  time.Time `json:"created_at" gorm:"column:created_at;autoCreateTime"`
	UpdatedAt  time.Time `json:"updated_at" gorm:"column:updated_at;autoUpdateTime"`
}

// TableName specifies the table name for GORM
func (Branch) TableName() string {
	return "insurance_branches"
}
