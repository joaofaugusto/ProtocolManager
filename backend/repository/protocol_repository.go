// backend/repository/protocol_repository.go
package repository

import (
	"ProtocolManager/backend/models"
	"fmt"
	"gorm.io/gorm"
	"time"
)

type ProtocolRepository struct {
	DB *gorm.DB
}

func NewProtocolRepository(db *gorm.DB) *ProtocolRepository {
	return &ProtocolRepository{DB: db}
}

func (r *ProtocolRepository) GetAll() ([]models.Protocol, error) {
	var protocols []models.Protocol

	result := r.DB.
		Preload("Type").
		Preload("Status").
		Preload("Customer").
		Preload("Branch").
		Preload("Requestor").
		Preload("AssignedAgent").
		Preload("CreatedByAgent").
		Find(&protocols)

	if result.Error != nil {
		return nil, result.Error
	}

	return protocols, nil
}

func (r *ProtocolRepository) GetByID(id int) (models.Protocol, error) {
	var protocol models.Protocol
	result := r.DB.
		Preload("Type").
		Preload("Status").
		Preload("Customer").
		Preload("Branch").
		Preload("Requestor").
		Preload("AssignedAgent").
		Preload("CreatedByAgent").
		First(&protocol, id)
	return protocol, result.Error
}

// backend/repository/protocol_repository.go
func (r *ProtocolRepository) Create(protocol models.Protocol) (
	models.Protocol, error,
) {
	// Set a default type_id if not provided or if it's zero
	if protocol.TypeID == 0 {
		// Get the first available type from the database
		var defaultType models.ProtocolType
		if err := r.DB.First(&defaultType).Error; err != nil {
			return protocol, fmt.Errorf("no protocol types available: %w", err)
		}
		protocol.TypeID = defaultType.TypeID
	}

	// Ensure we have a valid created_by
	if protocol.CreatedBy == 0 {
		var personnel models.SalesPersonnel
		if err := r.DB.First(&personnel).Error; err != nil {
			return protocol, fmt.Errorf(
				"no personnel available for created_by: %w", err,
			)
		}
		protocol.CreatedBy = personnel.PersonnelID
	}

	// Generate protocol number
	currentYear := time.Now().Year()
	var count int64
	r.DB.Model(&models.Protocol{}).
		Where("EXTRACT(YEAR FROM created_at) = ?", currentYear).
		Count(&count)

	protocol.ProtocolNumber = fmt.Sprintf("%d-%04d", currentYear, count+1)

	// Create the protocol
	result := r.DB.Create(&protocol)
	if result.Error != nil {
		return protocol, result.Error
	}

	// Create initial history record
	history := models.ProtocolHistory{
		ProtocolID:  protocol.ProtocolID,
		NewStatusID: protocol.StatusID,
		Notes:       "Protocol created",
		CreatedBy:   protocol.CreatedBy,
	}

	r.DB.Create(&history)

	// Fetch the complete protocol with associations
	r.DB.
		Preload("Type").
		Preload("Status").
		Preload("Customer").
		Preload("Branch").
		Preload("Requestor").
		Preload("AssignedAgent").
		Preload("CreatedByAgent").
		First(&protocol, protocol.ProtocolID)

	return protocol, nil
}

func (r *ProtocolRepository) Update(id int, protocol models.Protocol) error {
	// Validate the priority field before updating
	validPriorities := map[string]bool{
		"low":    true,
		"medium": true,
		"high":   true,
	}

	if !validPriorities[protocol.Priority] {
		return fmt.Errorf("invalid priority value: %s", protocol.Priority)
	}

	// Get current protocol to check for status changes
	var currentProtocol models.Protocol
	if err := r.DB.First(&currentProtocol, id).Error; err != nil {
		return err
	}

	// Update the protocol
	result := r.DB.Model(&models.Protocol{ProtocolID: id}).Updates(
		map[string]interface{}{
			"title":        protocol.Title,
			"description":  protocol.Description,
			"type_id":      protocol.TypeID,
			"status_id":    protocol.StatusID,
			"requestor_id": protocol.RequestorID,
			"customer_id":  protocol.CustomerID,
			"branch_id":    protocol.BranchID,
			"assigned_to":  protocol.AssignedTo,
			"priority":     protocol.Priority,
			"deadline":     protocol.Deadline,
		},
	)

	if result.Error != nil {
		return result.Error
	}

	// If status has changed, add to history
	if currentProtocol.StatusID != protocol.StatusID {
		// Check if status is terminal
		var newStatus models.ProtocolStatus
		if err := r.DB.First(&newStatus, protocol.StatusID).Error; err != nil {
			return err
		}

		// Store the old status ID
		oldStatusID := currentProtocol.StatusID

		// Create history entry for status change
		history := models.ProtocolHistory{
			ProtocolID:  protocol.ProtocolID,
			OldStatusID: &oldStatusID,
			NewStatusID: protocol.StatusID,
			Notes:       "Status changed",   // Default note for status change
			CreatedBy:   protocol.CreatedBy, // Use the protocol's CreatedBy or a specific value
		}

		if err := r.DB.Create(&history).Error; err != nil {
			return err
		}

		// If new status is terminal, set closed_at time
		if newStatus.IsTerminal {
			now := time.Now()
			r.DB.Model(&models.Protocol{ProtocolID: id}).Update(
				"closed_at", now,
			)
		}
	}

	return nil
}
func (r *ProtocolRepository) Delete(id int) error {
	// Delete related history records first
	if err := r.DB.Where(
		"protocol_id = ?", id,
	).Delete(&models.ProtocolHistory{}).Error; err != nil {
		return err
	}

	// Delete the protocol
	result := r.DB.Delete(&models.Protocol{}, id)
	return result.Error
}

// Additional useful methods

func (r *ProtocolRepository) GetByStatus(statusID int) (
	[]models.Protocol, error,
) {
	var protocols []models.Protocol
	result := r.DB.
		Preload("Type").
		Preload("Status").
		Preload("Customer").
		Preload("Branch").
		Preload("Requestor").
		Preload("AssignedAgent").
		Where("status_id = ?", statusID).
		Order("created_at DESC").
		Find(&protocols)
	return protocols, result.Error
}

func (r *ProtocolRepository) GetHistory(protocolID int) (
	[]models.ProtocolHistory, error,
) {
	var history []models.ProtocolHistory
	result := r.DB.
		Preload("PreviousStatus").
		Preload("NewStatus").
		Preload("CreatedByAgent").
		Where("protocol_id = ?", protocolID).
		Order("created_at").
		Find(&history)
	return history, result.Error
}
