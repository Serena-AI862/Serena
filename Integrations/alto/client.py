import os
import requests
from typing import Dict, List, Optional
from datetime import datetime

class AltoClient:
    """Alto CRM API Client"""
    
    def __init__(self, api_key: str, sandbox: bool = False):
        """Initialize Alto client
        
        Args:
            api_key: Alto API key
            sandbox: Whether to use sandbox environment
        """
        self.api_key = api_key
        self.base_url = "https://sandbox.altotest.co.uk/api" if sandbox else "https://api.alto.co.uk"
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        })

    # Reference Check Operations
    def get_reference_checks(self, start_date: Optional[datetime] = None, 
                           end_date: Optional[datetime] = None) -> List[Dict]:
        """Get reference checks within date range"""
        params = {}
        if start_date:
            params['startDate'] = start_date.isoformat()
        if end_date:
            params['endDate'] = end_date.isoformat()
            
        response = self.session.get(f"{self.base_url}/referenceChecks", params=params)
        response.raise_for_status()
        return response.json()

    def update_reference_check_status(self, reference_check_id: str, status: str) -> Dict:
        """Update reference check status
        
        Args:
            reference_check_id: ID of the reference check
            status: New status ('Pending' or 'Completed')
        """
        if status not in ['Pending', 'Completed']:
            raise ValueError("Status must be either 'Pending' or 'Completed'")
            
        response = self.session.patch(
            f"{self.base_url}/referenceChecks/{reference_check_id}",
            json={"status": status}
        )
        response.raise_for_status()
        return response.json()

    # Contact Operations
    def create_contact(self, contact_data: Dict) -> Dict:
        """Create a new contact"""
        response = self.session.post(f"{self.base_url}/contacts", json=contact_data)
        response.raise_for_status()
        return response.json()

    def get_contact(self, contact_id: str) -> Dict:
        """Get contact details"""
        response = self.session.get(f"{self.base_url}/contacts/{contact_id}")
        response.raise_for_status()
        return response.json()

    # Property Operations
    def create_property(self, property_data: Dict) -> Dict:
        """Create a new property"""
        response = self.session.post(f"{self.base_url}/inventory", json=property_data)
        response.raise_for_status()
        return response.json()

    # Document Operations
    def upload_document(self, document_path: str, linked_type: str, linked_id: str) -> Dict:
        """Upload a document
        
        Args:
            document_path: Path to the document file
            linked_type: Type of entity to link to ('Contact', 'Tenancy', 'Property')
            linked_id: ID of the entity to link to
        """
        with open(document_path, 'rb') as f:
            files = {'file': f}
            data = {
                'LinkedType': linked_type,
                'LinkedId': linked_id
            }
            response = self.session.post(
                f"{self.base_url}/documents",
                data=data,
                files=files
            )
            response.raise_for_status()
            return response.json()

    # Tenancy Operations
    def get_tenancy_tenant_ids(self, tenancy_id: str) -> List[str]:
        """Get tenant IDs for a tenancy"""
        response = self.session.get(f"{self.base_url}/tenancies/{tenancy_id}/tenantIds")
        response.raise_for_status()
        return response.json()

    def get_guarantor_ids(self, tenant_id: str) -> List[str]:
        """Get guarantor IDs for a tenant"""
        response = self.session.get(f"{self.base_url}/guarantorIds", params={'tenantId': tenant_id})
        response.raise_for_status()
        return response.json()

    # Appointment Operations
    def create_appointment(self, appointment_data: Dict) -> Dict:
        """Create a new appointment"""
        response = self.session.post(f"{self.base_url}/appointments", json=appointment_data)
        response.raise_for_status()
        return response.json() 