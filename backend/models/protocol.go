// backend/models/protocol.go
package models

import "time"

type Protocol struct {
	ProtocolID         int        `json:"protocol_id" gorm:"primaryKey;column:protocol_id"`
	ProtocolNumber     string     `json:"protocol_number" gorm:"column:protocol_number"`
	Title              string     `json:"title" gorm:"column:title;not null"`
	Description        string     `json:"description" gorm:"column:description"`
	TypeID             int        `json:"type_id" gorm:"column:type_id;not null"`
	StatusID           int        `json:"status_id" gorm:"column:status_id;not null"`
	RequestorID        *int       `json:"requestor_id" gorm:"column:requestor_id"`
	CustomerID         int        `json:"customer_id" gorm:"column:customer_id"`
	BranchID           *int       `json:"branch_id" gorm:"column:branch_id"`
	AssignedTo         int        `json:"assigned_to" gorm:"column:assigned_to"`
	CreatedBy          int        `json:"created_by" gorm:"column:created_by;not null"`
	Priority           string     `json:"priority" gorm:"column:priority"`
	Deadline           *time.Time `json:"deadline" gorm:"column:deadline"`
	DateRequired       *time.Time `json:"date_required" gorm:"column:date_required"`
	ExpectedCompletion *time.Time `json:"expected_completion" gorm:"column:expected_completion"`
	CreatedAt          time.Time  `json:"created_at" gorm:"column:created_at"`
	UpdatedAt          time.Time  `json:"updated_at" gorm:"column:updated_at"`
	ClosedAt           *time.Time `json:"closed_at" gorm:"column:closed_at"`
	// Define relationships for proper preloading
	// In Protocol model
	Type           ProtocolType   `json:"type" gorm:"foreignKey:TypeID;references:TypeID"`
	Status         ProtocolStatus `json:"status" gorm:"foreignKey:StatusID;references:StatusID"`
	Customer       Customer       `json:"customer" gorm:"foreignKey:CustomerID;references:CustomerID"`
	Branch         Branch         `json:"branch" gorm:"foreignKey:BranchID;references:BranchID"`
	Requestor      SalesPersonnel `json:"requestor" gorm:"foreignKey:RequestorID;references:PersonnelID"`
	AssignedAgent  SalesPersonnel `json:"assigned_agent" gorm:"foreignKey:AssignedTo;references:PersonnelID"`
	CreatedByAgent SalesPersonnel `json:"created_by_agent" gorm:"foreignKey:CreatedBy;references:PersonnelID"`
}

func (Protocol) TableName() string {
	return "protocols"
}
