// models/user.go
package models

import "time"

type User struct {
	UserID       int       `gorm:"primaryKey" json:"user_id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	Role         string    `json:"role"`
	Active       bool      `json:"active"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
	PersonnelID  *int      `json:"personnel_id"`
}
